# DRP – Data Request Portal

Your task is to **design and implement** a production-ready web application called **DRP – Data Request Portal**, according to the specification below.

You must:
- make **reasonable engineering decisions** when not explicitly specified,
- prefer **clarity, auditability, and maintainability** over cleverness,
- produce **clean, well-structured, documented code**,
- avoid unnecessary abstractions,
- assume **on-premise deployment** (no SaaS dependencies required).

---

## 1. Product Purpose

DRP is an **on-premise system for formal data requests** issued by a competition authority.
The prurpose of this SW is to create online Questionnaires for data requesting from competitors. It will be similar to Google forms, but hosted localy with full control, maintainable and customizable. The competitor receives unique link and fills the responses and submits. Answers are stored in DB.
It is a **legally relevant data-collection system** with:
- structured questionnaires,
- respondent-specific access links,
- full auditability,
- data export for economic / legal analysis.

---

On next lines are suggestions how the system could work. Use it as inspiration.

## 2. High-Level Architecture

### Stack (mandatory)
- **Frontend:** Vite + React + Javacript
- **Backend:** Node.js (Express or Fastify) + Javacript
- **Database:** MySQL
- **Storage:** local filesystem (optionally S3-compatible later)

### Separation
- Single SPA frontend with two modes:
  - **Editor (internal)**
  - **Respondent (external)**
- REST API backend
- No authentication providers, no emails, no user accounts

---

## 3. Access Model (Critical)

### Editors
- Each questionnaire has **one edit password**
- Access via:
  - `/e/:questionnaireCode/login`
- Password is **hashed** (argon2 or bcrypt)
- Successful login creates an **editor session**
- No user accounts, no emails, no roles

### Respondents
- Each respondent gets a **unique, unguessable token link**
- Example: `/r/:token`
- Token is stored **only as SHA-256 hash**
- Token can be **rotated / revoked**
- Token identifies:
  - respondent
  - questionnaire
  - submission

---

## 4. Core Domain Model

Implement the following entities:

### Questionnaire
- Metadata (title, description)
- Edit password
- Status: draft / published / archived
- Linked template

### Questionnaire Version (IMMUTABLE)
- Created on every publish
- Snapshot of:
  - questionnaire definition (JSON)
  - template (CSS/layout)
- Submissions always reference a version

### Template
- Editable CSS
- Layout parameters (width, spacing, header)

### Respondent
- Belongs to questionnaire
- Has name, IČO, internal note
- Has optional deadline
- Has status: invited / in_progress / submitted / locked

### Submission
- One per respondent
- Status: draft / submitted
- Autosave supported
- Immutable after submit (unless explicitly reopened)

### Answer
- Stored per question (EAV model)
- Value stored as JSON

### File Upload
- Linked to submission + question
- Metadata in DB
- Binary data on filesystem

### Audit Log
- Records all critical actions:
  - edits
  - publishes
  - submits
  - token rotations
- Includes actor type and timestamp

---

## 5. Questionnaire Definition Format (JSON)

Questionnaires are defined in **JSON**, stored and versioned.

### Structure
```json
{
  "id": "QNR-2026-01",
  "title": "Market Data Request",
  "blocks": [],
  "logic": [],
  "settings": {
    "autosaveSeconds": 10,
    "allowResubmit": false
  }
}
```

### Blocks
- Contain questions
- Can be hidden/shown by logic
- Can be repeatable (optional)

### Question Types (mandatory)
- checkbox (multi-select)
- radio (single-select)
- short_text
- long_text
- scale (normalized 0..1)
- file upload

### Scale Question
- Labels map to numeric values in `[0,1]`
- Values are stored as numbers

### File Question
- Allowed extensions & MIME types
- Max size
- Max number of files
- Server-side validation mandatory

---

## 6. Form Logic Engine

Implement a **deterministic rules engine**.

### Rules
- Condition → actions
- Conditions reference other answers
- No loops
- No scripting
- Pure declarative JSON

### Conditions
- `==`, `!=`, `>`, `<`, `>=`, `<=`
- `in`, `not in`
- `isEmpty`, `notEmpty`

### Actions
- show / hide block or question
- enable / disable
- require / unrequire
- clear value

Rules must be evaluated:
- on load
- on answer change

---

## 7. Frontend Requirements

### Respondent UI
- Block-based navigation
- Autosave (debounced)
- Progress indicator
- Validation summary before submit
- File uploads with progress
- Final review before submit
- Read-only view after submission

### Editor UI
- Questionnaire builder
- Block & question editor
- Option editor for checkbox/radio/scale
- Logic rule editor
- Live preview
- Template editor (CSS + preview)
- Respondent management:
  - import CSV
  - regenerate token
  - see status
- Export UI

---

## 8. Backend API (Required Endpoints)

### Respondent
- `GET /api/r/:token/form`
- `GET /api/r/:token/submission`
- `PUT /api/r/:token/submission`
- `POST /api/r/:token/submit`
- `POST /api/r/:token/upload`
- `GET /api/r/:token/file/:fileId`

### Editor
- `POST /api/e/:code/login`
- `GET /api/e/questionnaire/:id`
- `PUT /api/e/questionnaire/:id`
- `PUT /api/e/questionnaire/:id/definition`
- `POST /api/e/questionnaire/:id/publish`
- `POST /api/e/questionnaire/:id/clone`
- `POST /api/e/questionnaire/:id/respondents/import`
- `POST /api/e/respondent/:id/token/rotate`
- `GET /api/e/questionnaire/:id/dashboard`
- `POST /api/e/questionnaire/:id/export`

---

## 9. Export Requirements

### CSV
- One row per respondent
- One column per question
- Checkbox values joined with `;`
- UTF-8

### XLSX
- Sheet: submissions
- Sheet: questions metadata
- Sheet: file metadata

### Bundle
ZIP containing:
- XLSX export
- questionnaire definition JSON
- template CSS
- all uploaded files organized per respondent

---

## 10. Non-Functional Requirements

- MySQL foreign keys & indexes
- Strong input validation
- Rate limiting on public endpoints
- File storage outside web root
- No eval, no dynamic code execution
- Clean error handling
- Logging suitable for public authority

---

## 11. Implementation Rules

- Use Javascript everywhere
- Share schemas between frontend and backend
- Use explicit migrations for DB
- Prefer readable SQL over ORM magic
- No cloud-only dependencies
- No unnecessary auth systems
- Everything must be auditable

---

## 12. Deliverables Expected

Generate:
1. Database schema (DDL)
2. Backend project structure + API implementation
3. Frontend project structure + main components
4. Rules engine
5. Export logic
6. Basic documentation in code

