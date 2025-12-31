# API Documentation

## Base URL

- Development: `http://localhost:3001/api`
- Production: Configure in environment

## Authentication

### Editor Session
Editors authenticate using the questionnaire code. A session token is returned.

```http
POST /api/editor/session
Content-Type: application/json

{
  "code": "QNR-2025-ABCD1234"
}
```

Response:
```json
{
  "token": "jwt-session-token",
  "questionnaire": { ... }
}
```

### Respondent Token
Respondents access forms using unique tokens embedded in URLs:
```
/r/{token}
```

---

## Public Endpoints

### List Questionnaires
```http
GET /api/questionnaires
```

Response:
```json
[
  {
    "id": 1,
    "code": "QNR-2025-ABCD1234",
    "title": "Market Survey 2025",
    "description": "...",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "respondent_count": 10,
    "opened_count": 5,
    "submitted_count": 3
  }
]
```

### Get Questionnaire
```http
GET /api/questionnaires/:id
```

### Create Questionnaire
```http
POST /api/questionnaires
Content-Type: application/json

{
  "title": "New Survey",
  "description": "Optional description"
}
```

### Delete Questionnaire
```http
DELETE /api/questionnaires/:id
```

### Get Questionnaire by Code
```http
GET /api/questionnaires/code/:code
```

---

## Editor Endpoints

All editor endpoints require the `Authorization` header with the session token.

```http
Authorization: Bearer {session-token}
```

### Update Questionnaire Definition
```http
PUT /api/editor/definition
Content-Type: application/json

{
  "definition": {
    "blocks": [
      {
        "id": "block-1",
        "title": "General Information",
        "description": "...",
        "questions": [...]
      }
    ]
  }
}
```

### List Respondents
```http
GET /api/editor/respondents
```

### Add Respondent
```http
POST /api/editor/respondents
Content-Type: application/json

{
  "name": "Company Ltd.",
  "ico": "12345678",
  "email": "contact@company.com",
  "internalNote": "Optional note",
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.000Z"
}
```

### Import Respondents
```http
POST /api/editor/respondents/import
Content-Type: application/json

{
  "respondents": [
    { "name": "Company 1", "ico": "11111111", "email": "a@b.com" },
    { "name": "Company 2", "ico": "22222222", "email": "c@d.com" }
  ]
}
```

### Update Respondent
```http
PUT /api/editor/respondents/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "validUntil": "2025-06-30T23:59:59.000Z"
}
```

### Bulk Update Respondents
```http
PUT /api/editor/respondents/bulk
Content-Type: application/json

{
  "ids": [1, 2, 3],
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-06-30T23:59:59.000Z"
}
```

### Delete Respondent
```http
DELETE /api/editor/respondents/:id
```

### Get Submission
```http
GET /api/editor/submissions/:respondentId
```

### Export Data
```http
GET /api/editor/export/csv
GET /api/editor/export/xlsx
GET /api/editor/export/zip
```

---

## Respondent Endpoints

### Get Form
```http
GET /api/form/:token
```

Response:
```json
{
  "questionnaire": {
    "id": 1,
    "title": "Survey",
    "definition": { ... }
  },
  "respondent": {
    "id": 1,
    "name": "Company Ltd.",
    "status": "in_progress",
    "valid_from": "...",
    "valid_until": "..."
  },
  "answers": {
    "question-1": "Answer value",
    "question-2": ["option1", "option2"]
  },
  "files": [...]
}
```

### Save Answers (Autosave)
```http
POST /api/form/:token/save
Content-Type: application/json

{
  "answers": {
    "question-1": "New answer",
    "question-2": ["option1"]
  }
}
```

### Submit Form
```http
POST /api/form/:token/submit
Content-Type: application/json

{
  "answers": { ... }
}
```

### Upload File
```http
POST /api/form/:token/upload
Content-Type: multipart/form-data

file: (binary)
questionId: "question-5"
```

### Delete File
```http
DELETE /api/form/:token/files/:fileId
```

---

## Question Definition Schema

```json
{
  "id": "q-unique-id",
  "type": "radio",
  "label": "Select your preference",
  "description": "Optional help text",
  "variable": "preference",
  "required": true,
  "options": [
    { "id": "opt-1", "label": "Option A", "value": "val01" },
    { "id": "opt-2", "label": "Option B", "value": "val02" }
  ],
  "scaleConfig": {
    "min": 0,
    "max": 10,
    "step": 1,
    "labels": [
      { "value": 0, "label": "Not at all" },
      { "value": 10, "label": "Completely" }
    ]
  },
  "maxFiles": 3
}
```

### Question Types

| Type | Fields |
|------|--------|
| `short_text` | label, description, variable, required |
| `long_text` | label, description, variable, required |
| `radio` | label, options, required |
| `checkbox` | label, options, required |
| `scale` | label, scaleConfig, required |
| `file` | label, maxFiles, required |

---

## Error Responses

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Internal Server Error
