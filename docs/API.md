# API Documentation

## Base URL

- Development: `http://localhost:3001/api`
- Production: Configure in environment

## Authentication

The application uses two authentication methods:

### 1. JWT Authentication (Primary)

Users can register and login to get a JWT token that provides access to all questionnaires.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {jwt-token}
```

### 2. Editor Session (Legacy/Per-Questionnaire)

Each questionnaire can have its own edit password. This creates a session for that specific questionnaire only.

```http
POST /api/e/{code}/login
Content-Type: application/json

{
  "password": "questionnaire-edit-password"
}
```

Response:
```json
{
  "sessionId": "session-uuid",
  "questionnaire": { ... }
}
```

Use the session ID in subsequent requests:
```http
X-Editor-Session: {session-id}
```

### 3. Respondent Token

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
    "status": "published",
    "created_at": "2025-01-01T00:00:00.000Z",
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

### Get Questionnaire by Code
```http
GET /api/questionnaires/code/:code
```

### Create Questionnaire
```http
POST /api/questionnaires
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "title": "New Survey",
  "description": "Optional description"
}
```

### Delete Questionnaire
```http
DELETE /api/questionnaires/:id
Authorization: Bearer {jwt-token}
```

---

## Editor Endpoints

All editor endpoints require either:
- JWT token: `Authorization: Bearer {token}` (access to all questionnaires)
- Editor session: `X-Editor-Session: {session-id}` (access to single questionnaire)

Base path: `/api/e/{code}/`

### Get Dashboard
```http
GET /api/e/{code}/dashboard
```

### Update Definition
```http
PUT /api/e/{code}/definition
Content-Type: application/json

{
  "definition": {
    "blocks": [...]
  }
}
```

### List Respondents
```http
GET /api/e/{code}/respondents
```

### Add Respondent
```http
POST /api/e/{code}/respondents
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
POST /api/e/{code}/respondents/import
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
PUT /api/e/{code}/respondents/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "validUntil": "2025-06-30T23:59:59.000Z"
}
```

### Bulk Update Respondents
```http
PUT /api/e/{code}/respondents/bulk
Content-Type: application/json

{
  "ids": [1, 2, 3],
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-06-30T23:59:59.000Z"
}
```

### Delete Respondent
```http
DELETE /api/e/{code}/respondents/:id
```

### Delete Multiple Respondents
```http
DELETE /api/e/{code}/respondents/bulk
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

### Get Submission
```http
GET /api/e/{code}/submissions/:respondentId
```

### Export Data
```http
GET /api/e/{code}/export/csv
GET /api/e/{code}/export/xlsx
GET /api/e/{code}/export/zip
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
    "status": "in_progress"
  },
  "answers": {
    "question-1": "Answer value"
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
    "question-1": "New answer"
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

## Question Types

| Type | Description |
|------|-------------|
| `short_text` | Single-line text input |
| `long_text` | Multi-line textarea |
| `radio` | Single choice from options |
| `checkbox` | Multiple choice from options |
| `scale` | Numeric scale with labels |
| `file` | File upload |

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
