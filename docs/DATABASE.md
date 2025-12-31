# Database Schema

## Overview

The DRP application uses MySQL 8.0+ with the following tables:

- `questionnaires` - Survey definitions
- `respondents` - Survey participants
- `submissions` - Submitted answers
- `files` - Uploaded file metadata

## Tables

### questionnaires

Stores questionnaire definitions and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| code | VARCHAR(50) | Unique access code (e.g., QNR-2025-ABCD1234) |
| title | VARCHAR(255) | Questionnaire title |
| description | TEXT | Optional description |
| definition | JSON | Question blocks and questions |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `code` - UNIQUE

### respondents

Stores respondent information and access tokens.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| questionnaire_id | INT | Foreign key to questionnaires |
| name | VARCHAR(255) | Respondent name/company |
| ico | VARCHAR(20) | Company ID (IČO) |
| email | VARCHAR(255) | Email address |
| token | VARCHAR(100) | Unique access token |
| status | ENUM | 'invited', 'in_progress', 'submitted', 'locked' |
| internal_note | TEXT | Internal notes (not visible to respondent) |
| valid_from | DATETIME | Access valid from |
| valid_until | DATETIME | Access valid until |
| first_accessed_at | DATETIME | First form access |
| submitted_at | DATETIME | Submission timestamp |
| created_at | TIMESTAMP | Creation timestamp |

**Indexes:**
- `token` - UNIQUE
- `questionnaire_id` - INDEX

### submissions

Stores respondent answers.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| respondent_id | INT | Foreign key to respondents |
| questionnaire_id | INT | Foreign key to questionnaires |
| answers | JSON | All question answers |
| submitted_at | DATETIME | Submission timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `respondent_id` - INDEX
- `questionnaire_id` - INDEX

### files

Stores uploaded file metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| respondent_id | INT | Foreign key to respondents |
| questionnaire_id | INT | Foreign key to questionnaires |
| question_id | VARCHAR(100) | Question identifier |
| original_name | VARCHAR(255) | Original filename |
| stored_name | VARCHAR(255) | Stored filename on disk |
| mime_type | VARCHAR(100) | File MIME type |
| size_bytes | BIGINT | File size in bytes |
| created_at | TIMESTAMP | Upload timestamp |

**Indexes:**
- `respondent_id` - INDEX
- `question_id` - INDEX

## Entity Relationship Diagram

```
┌─────────────────┐
│  questionnaires │
├─────────────────┤
│ id (PK)         │
│ code            │
│ title           │
│ description     │
│ definition      │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────┴────────┐
│   respondents   │
├─────────────────┤
│ id (PK)         │
│ questionnaire_id│──────┐
│ name            │      │
│ ico             │      │
│ email           │      │
│ token           │      │
│ status          │      │
│ valid_from      │      │
│ valid_until     │      │
│ submitted_at    │      │
└────────┬────────┘      │
         │               │
         │ 1:1           │
         │               │
┌────────┴────────┐      │
│   submissions   │      │
├─────────────────┤      │
│ id (PK)         │      │
│ respondent_id   │      │
│ questionnaire_id│──────┤
│ answers         │      │
│ submitted_at    │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│     files       │      │
├─────────────────┤      │
│ id (PK)         │      │
│ respondent_id   │      │
│ questionnaire_id│──────┘
│ question_id     │
│ original_name   │
│ stored_name     │
│ mime_type       │
│ size_bytes      │
└─────────────────┘
```

## JSON Schemas

### questionnaires.definition

```json
{
  "blocks": [
    {
      "id": "block-uuid",
      "title": "Block Title",
      "description": "Block description",
      "questions": [
        {
          "id": "question-uuid",
          "type": "radio",
          "label": "Question text",
          "description": "Help text",
          "variable": "export_name",
          "required": true,
          "options": [
            { "id": "opt-1", "label": "Option A", "value": "val01" }
          ],
          "scaleConfig": {
            "min": 0,
            "max": 10,
            "step": 1,
            "labels": [{ "value": 0, "label": "Low" }]
          },
          "maxFiles": 3
        }
      ]
    }
  ]
}
```

### submissions.answers

```json
{
  "question-uuid-1": "Text answer",
  "question-uuid-2": ["val01", "val02"],
  "question-uuid-3": 7.5
}
```

## Setup

Run the schema script to create the database:

```bash
mysql -u root -p < backend/schema.sql
```

Or manually:

```sql
CREATE DATABASE IF NOT EXISTS drpdb 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE drpdb;

-- Create tables from schema.sql
```
