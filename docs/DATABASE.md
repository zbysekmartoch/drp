# Database Schema

## Overview

The DRP application uses MySQL 8.0+ with the following tables:

| Table | Description |
|-------|-------------|
| `questionnaires` | Survey definitions and settings |
| `respondents` | Survey participants with access tokens |
| `submissions` | Submitted answers |
| `file_uploads` | Uploaded file metadata |
| `editor_sessions` | Per-questionnaire edit sessions |
| `questionnaire_versions` | Published questionnaire snapshots |
| `audit_log` | System audit trail |
| `access_log` | Respondent access tracking |
| `templates` | Reusable questionnaire templates |
| `usr` | User accounts for JWT authentication |
| `answers` | Individual answers (alternative storage) |
| `data_eav` | Entity-Attribute-Value storage |

---

## Table Definitions

### questionnaires

Stores questionnaire definitions and metadata.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| code | VARCHAR(50) | NO | UNI | Unique access code (e.g., QNR-2025-ABCD1234) |
| title | VARCHAR(500) | NO | | Questionnaire title |
| description | TEXT | YES | | Optional description |
| edit_password_hash | VARCHAR(255) | YES | | Bcrypt hash for per-questionnaire edit access |
| status | ENUM | YES | MUL | 'draft', 'published', 'archived' |
| template_id | INT | YES | MUL | FK to templates |
| definition | JSON | YES | | Question blocks and questions |
| settings | JSON | YES | | Questionnaire settings |
| created_at | TIMESTAMP | YES | | Creation timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

### respondents

Stores respondent information and access tokens.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| questionnaire_id | INT | NO | MUL | FK to questionnaires |
| name | VARCHAR(500) | NO | | Respondent name/company |
| ico | VARCHAR(20) | YES | | Company ID (IČO) |
| email | VARCHAR(255) | YES | | Email address |
| internal_note | TEXT | YES | | Internal notes (not visible to respondent) |
| token | VARCHAR(16) | NO | | Short access token (displayed) |
| token_hash | VARCHAR(64) | NO | MUL | SHA-256 hash (for lookup) |
| valid_from | DATETIME | YES | | Access valid from |
| valid_until | DATETIME | YES | | Access valid until |
| first_accessed_at | DATETIME | YES | | First form access |
| status | ENUM | YES | MUL | 'invited', 'in_progress', 'submitted', 'locked' |
| created_at | TIMESTAMP | YES | | Creation timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

### submissions

Stores respondent answers.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| respondent_id | INT | NO | UNI | FK to respondents (1:1) |
| questionnaire_version_id | INT | YES | MUL | FK to questionnaire_versions |
| status | ENUM | YES | MUL | 'draft', 'submitted' |
| data | JSON | YES | | All question answers |
| submitted_at | TIMESTAMP | YES | | Submission timestamp |
| created_at | TIMESTAMP | YES | | Creation timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

### file_uploads

Stores uploaded file metadata.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| submission_id | INT | NO | MUL | FK to submissions |
| question_id | VARCHAR(100) | NO | MUL | Question identifier |
| original_name | VARCHAR(500) | NO | | Original filename |
| stored_name | VARCHAR(255) | NO | | Stored filename on disk |
| mime_type | VARCHAR(100) | YES | | File MIME type |
| size_bytes | BIGINT | YES | | File size in bytes |
| storage_path | VARCHAR(1000) | NO | | Full path to file |
| created_at | TIMESTAMP | YES | | Upload timestamp |

---

### editor_sessions

Per-questionnaire edit sessions (legacy authentication).

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| session_id | VARCHAR(64) | NO | UNI | Unique session identifier |
| questionnaire_id | INT | NO | MUL | FK to questionnaires |
| expires_at | TIMESTAMP | NO | MUL | Session expiration |
| created_at | TIMESTAMP | YES | | Creation timestamp |

---

### questionnaire_versions

Published questionnaire snapshots for data integrity.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| questionnaire_id | INT | NO | MUL | FK to questionnaires |
| version_number | INT | NO | | Sequential version number |
| definition | JSON | NO | | Frozen question definition |
| template_css | TEXT | YES | | Custom CSS |
| template_layout | JSON | YES | | Layout configuration |
| published_at | TIMESTAMP | YES | | Publication timestamp |

---

### audit_log

System audit trail for all entity changes.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| entity_type | ENUM | NO | MUL | 'questionnaire', 'respondent', 'submission', 'file' |
| entity_id | INT | NO | | ID of the affected entity |
| action | VARCHAR(100) | NO | MUL | Action performed (create, update, delete, etc.) |
| actor_type | ENUM | NO | | 'editor', 'respondent', 'system' |
| actor_id | INT | YES | | ID of the actor (user/respondent) |
| details | JSON | YES | | Additional action details |
| ip_address | VARCHAR(45) | YES | | Client IP address |
| created_at | TIMESTAMP | YES | MUL | Timestamp |

---

### access_log

Tracks respondent form access with device info.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| respondent_id | INT | NO | MUL | FK to respondents |
| ip_address | VARCHAR(45) | YES | | Client IP |
| user_agent | TEXT | YES | | Browser user agent |
| accept_language | VARCHAR(255) | YES | | Preferred language |
| referer | TEXT | YES | | Referrer URL |
| screen_width | INT | YES | | Screen width in pixels |
| screen_height | INT | YES | | Screen height in pixels |
| timezone | VARCHAR(100) | YES | | Client timezone |
| platform | VARCHAR(100) | YES | | OS/Platform |
| is_mobile | TINYINT(1) | YES | | Mobile device flag |
| created_at | TIMESTAMP | YES | MUL | Access timestamp |

---

### templates

Reusable questionnaire templates.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| name | VARCHAR(255) | NO | | Template name |
| css | TEXT | YES | | Custom CSS styles |
| layout_config | JSON | YES | | Layout configuration |
| created_at | TIMESTAMP | YES | | Creation timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

### usr

User accounts for JWT authentication.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| first_name | VARCHAR(100) | NO | | User's first name |
| last_name | VARCHAR(100) | NO | | User's last name |
| email | VARCHAR(255) | NO | UNI | Email (login identifier) |
| password_hash | VARCHAR(255) | NO | | Bcrypt password hash |
| role | ENUM | YES | | 'admin', 'user' |
| created_at | TIMESTAMP | YES | | Registration timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

### answers

Individual answers storage (alternative to JSON in submissions).

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| submission_id | INT | NO | MUL | FK to submissions |
| question_id | VARCHAR(100) | NO | MUL | Question identifier |
| value | JSON | YES | | Answer value |
| created_at | TIMESTAMP | YES | | Creation timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

### data_eav

Entity-Attribute-Value storage for flexible data.

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | INT | NO | PRI | Primary key |
| respondent_id | INT | NO | MUL | FK to respondents |
| variable | VARCHAR(100) | NO | MUL | Variable/attribute name |
| value | TEXT | YES | | Value |
| created_at | TIMESTAMP | YES | | Creation timestamp |
| updated_at | TIMESTAMP | YES | | Last update timestamp |

---

## Entity Relationships

```
┌─────────────────────┐
│   questionnaires    │
│        (1)          │
└──────────┬──────────┘
           │
     ┌─────┼─────┬────────────┬─────────────┐
     │     │     │            │             │
     ▼     ▼     ▼            ▼             ▼
┌────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│respond-│ │editor_   │ │question-  │ │templates │
│ents(N) │ │sessions  │ │naire_ver- │ │   (N)    │
└───┬────┘ │   (N)    │ │sions (N)  │ └──────────┘
    │      └──────────┘ └─────┬─────┘
    │                         │
    ▼                         │
┌──────────┐                  │
│submissions│◄────────────────┘
│   (1:1)   │
└────┬──────┘
     │
     ├──────────────┐
     ▼              ▼
┌──────────┐  ┌──────────┐
│file_     │  │answers   │
│uploads(N)│  │   (N)    │
└──────────┘  └──────────┘

┌─────────────┐     ┌─────────────┐
│  audit_log  │     │  access_log │
└─────────────┘     └─────────────┘
(tracks all entities) (tracks respondent access)

┌─────────────┐     ┌─────────────┐
│    usr      │     │  data_eav   │
└─────────────┘     └─────────────┘
(JWT users)         (flexible storage)
```

---

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

### submissions.data

```json
{
  "question-uuid-1": "Text answer",
  "question-uuid-2": ["val01", "val02"],
  "question-uuid-3": 7.5
}
```

---

## Setup

Run the schema script to create the database:

```bash
mysql -u root -p < backend/src/db/schema.js
```

Or create manually and run migrations.
