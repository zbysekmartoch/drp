# DRP User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating a Questionnaire](#creating-a-questionnaire)
4. [Building Questions](#building-questions)
5. [Managing Respondents](#managing-respondents)
6. [Collecting Responses](#collecting-responses)
7. [Exporting Data](#exporting-data)
8. [Respondent Guide](#respondent-guide)

---

## Introduction

DRP (Data Request Portal) is a web-based application for creating and managing data collection questionnaires. It allows you to:

- Create structured questionnaires with various question types
- Manage respondents and generate unique access links
- Collect responses with real-time autosave
- Export data in multiple formats (CSV, Excel, ZIP)

### Supported Languages

The application supports three languages:
- 🇨🇿 Czech (default)
- 🇸🇰 Slovak
- 🇬🇧 English

You can switch languages using the language selector in the top-right corner of any page.

---

## Getting Started

### Logging In

1. Navigate to the application URL
2. Click **"Login"** or **"Přihlásit se"**
3. Enter your email and password
4. Click **"Sign In"**

<!-- Screenshot: Login page -->
![Login Page](screenshots/01-login.png)
*Login page with email and password fields*

### Dashboard Overview

After logging in, you'll see the main dashboard with a list of all questionnaires.

<!-- Screenshot: Main dashboard -->
![Dashboard](screenshots/02-dashboard.png)
*Main dashboard showing list of questionnaires*

The dashboard displays:
- **Questionnaire name** - Click to open
- **Code** - Unique identifier (e.g., QNR-2025-ABCD1234)
- **Respondents** - Total number of respondents
- **Opened** - How many respondents opened the form
- **Responses** - Number of submitted responses
- **Last Updated** - Date of last modification

---

## Creating a Questionnaire

### Step 1: Create New Questionnaire

1. Click the **"New Questionnaire"** button (+ icon)
2. Enter the questionnaire title
3. Optionally add a description
4. Click **"Create Questionnaire"**

<!-- Screenshot: Create questionnaire form -->
![Create Questionnaire](screenshots/03-create-questionnaire.png)
*New questionnaire creation form*

### Step 2: Questionnaire Overview

After creation, you'll be taken to the questionnaire overview page showing:
- Statistics (respondents, opened, in progress, responses)
- Quick actions
- Export options
- Version history

<!-- Screenshot: Questionnaire overview -->
![Questionnaire Overview](screenshots/04-questionnaire-overview.png)
*Questionnaire overview with statistics and quick actions*

---

## Building Questions

### Accessing the Editor

1. From the questionnaire overview, click **"Edit Questionnaire"** or the **"Builder"** tab
2. You'll see the question editor interface

<!-- Screenshot: Question builder -->
![Question Builder](screenshots/05-question-builder.png)
*Question builder interface*

### Adding Blocks

Questions are organized into blocks (sections). To add a block:

1. Click **"Add Block"** at the bottom of the editor
2. Enter the block title
3. Optionally add a description

<!-- Screenshot: Adding a block -->
![Add Block](screenshots/06-add-block.png)
*Adding a new question block*

### Adding Questions

1. Within a block, click one of the question type buttons:
   - **Short Text** - Single line text input
   - **Long Text** - Multi-line textarea
   - **Single Choice** - Radio buttons (one selection)
   - **Multiple Choice** - Checkboxes (multiple selections)
   - **Scale** - Numeric scale with optional labels
   - **File Upload** - Allow file attachments

2. Click on the question to expand its settings

<!-- Screenshot: Question types -->
![Question Types](screenshots/07-question-types.png)
*Available question types*

### Configuring Questions

Each question has these settings:

| Setting | Description |
|---------|-------------|
| **Label** | The question text shown to respondents |
| **Variable** | Internal name for data export |
| **Required** | Whether the question must be answered |
| **Description** | Optional help text |

<!-- Screenshot: Question settings -->
![Question Settings](screenshots/08-question-settings.png)
*Question configuration panel*

### Choice Questions (Radio/Checkbox)

For choice questions, you can add options:

1. Click **"Add Option"**
2. Enter the option label (shown to user)
3. The value (for export) is auto-generated

<!-- Screenshot: Choice options -->
![Choice Options](screenshots/09-choice-options.png)
*Adding options to a choice question*

### Scale Questions

Scale questions allow numeric input with these settings:

| Setting | Description |
|---------|-------------|
| **Minimum** | Lowest value on scale |
| **Maximum** | Highest value on scale |
| **Step** | Increment between values |
| **Labels** | Optional labels for specific values |

<!-- Screenshot: Scale configuration -->
![Scale Configuration](screenshots/10-scale-config.png)
*Scale question configuration*

### Saving Changes

Changes are saved automatically. You'll see:
- **"Saving..."** - While saving
- **"Saved"** - When changes are saved

---

## Managing Respondents

### Accessing Respondent Manager

1. Click the **"Respondents"** tab in the questionnaire editor
2. You'll see the list of all respondents

<!-- Screenshot: Respondent manager -->
![Respondent Manager](screenshots/11-respondent-manager.png)
*Respondent management interface*

### Adding a Single Respondent

1. Click **"Add Respondent"**
2. Fill in the form:
   - **Name** (required) - Company or person name
   - **Company ID** (optional) - IČO
   - **Email** (optional)
   - **Internal Note** (optional) - Not visible to respondent
   - **Valid From/Until** - Access window

3. Click **"Add"**

<!-- Screenshot: Add respondent form -->
![Add Respondent](screenshots/12-add-respondent.png)
*Add respondent form*

### Importing Multiple Respondents

1. Click **"Add Multiple"**
2. Enter respondents in CSV format:
   ```
   Company Name 1, 12345678, email1@example.com
   Company Name 2, 87654321, email2@example.com
   ```
3. Click **"Import"**

<!-- Screenshot: Import respondents -->
![Import Respondents](screenshots/13-import-respondents.png)
*Bulk import interface*

### Copying Access Links

Each respondent has a unique access link:

1. Find the respondent in the list
2. Click the **copy icon** next to their token
3. The link is copied to clipboard

The link format is: `https://yourdomain.com/r/{token}`

<!-- Screenshot: Copy link -->
![Copy Link](screenshots/14-copy-link.png)
*Copying respondent access link*

### Respondent Status

| Status | Description |
|--------|-------------|
| 🔵 **Not Opened** | Link not yet accessed |
| 👁️ **Viewed** | Form opened but not started |
| ✏️ **In Progress** | Partially completed |
| ✅ **Submitted** | Form submitted |
| 🔒 **Locked** | Access revoked |

### Bulk Operations

1. Select multiple respondents using checkboxes
2. Click **"Bulk Actions"**
3. Choose an action:
   - Update validity dates
   - Delete selected

<!-- Screenshot: Bulk actions -->
![Bulk Actions](screenshots/15-bulk-actions.png)
*Bulk operations menu*

---

## Collecting Responses

### Monitoring Progress

The **"Responses"** tab shows:
- Submission statistics
- Progress bar
- Recent submissions
- Export options

<!-- Screenshot: Responses overview -->
![Responses Overview](screenshots/16-responses-overview.png)
*Response collection overview*

### Viewing Individual Responses

1. Click on a respondent's name in the submissions list
2. View all their answers
3. See uploaded files

<!-- Screenshot: View submission -->
![View Submission](screenshots/17-view-submission.png)
*Individual response viewer*

---

## Exporting Data

### Export Formats

| Format | Description |
|--------|-------------|
| **CSV** | Simple spreadsheet format, one row per respondent |
| **Excel (XLSX)** | Multiple sheets with answers, questions, and file list |
| **ZIP Bundle** | Excel file + all uploaded files |

### Exporting

1. Go to the questionnaire overview or responses page
2. Click the desired export button
3. The file will download automatically

<!-- Screenshot: Export options -->
![Export Options](screenshots/18-export-options.png)
*Export format options*

### CSV Format

The CSV file contains:
- Header row with question variables
- One row per respondent
- All answers in columns

### Excel Format

The Excel file contains multiple sheets:
- **Responses** - All answers
- **Questions** - Question definitions
- **Files** - List of uploaded files

---

## Respondent Guide

This section is for respondents filling out the questionnaire.

### Accessing the Form

1. Click the link provided to you
2. The form will open in your browser

<!-- Screenshot: Respondent form -->
![Respondent Form](screenshots/19-respondent-form.png)
*Questionnaire form for respondents*

### Filling Out the Form

1. Answer all questions marked with ***** (required)
2. Your progress is shown at the top
3. Answers are **saved automatically** - you can leave and return later

<!-- Screenshot: Form progress -->
![Form Progress](screenshots/20-form-progress.png)
*Progress indicator and autosave*

### Uploading Files

For file upload questions:

1. Click **"Select file"** or drag and drop
2. Wait for upload to complete
3. You can remove files before submitting

<!-- Screenshot: File upload -->
![File Upload](screenshots/21-file-upload.png)
*File upload interface*

### Submitting

1. Review all your answers
2. Click **"Submit Form"**
3. You'll see a confirmation message

⚠️ **Note:** After submission, you cannot modify your answers.

<!-- Screenshot: Submit confirmation -->
![Submit Confirmation](screenshots/22-submit-confirmation.png)
*Submission confirmation*

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Can't access form | Check if the link is still valid (not expired) |
| Changes not saving | Check your internet connection |
| Export fails | Ensure there is at least one submitted response |
| File upload fails | Check file size (max 50MB) |

### Contact Support

If you encounter issues, contact your administrator.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next field |
| `Shift + Tab` | Move to previous field |
| `Enter` | Submit (on last field) |
| `Esc` | Close modal dialogs |

---

*DRP User Manual v1.0 | Last updated: December 2025*
