# Respondent Guide

## How to Complete a Questionnaire in the DRP System

**National Competition Authority (NCA)**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Accessing the Questionnaire](#accessing-the-questionnaire)
3. [Form Interface](#form-interface)
4. [Completing Questions](#completing-questions)
5. [Uploading Files](#uploading-files)
6. [Saving and Pausing Work](#saving-and-pausing-work)
7. [Submitting the Form](#submitting-the-form)
8. [Frequently Asked Questions](#frequently-asked-questions)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide will walk you through the process of completing a questionnaire in the DRP (Data Request Portal) system. The system is designed to be as user-friendly as possible and to securely save your responses.

### What You'll Need

- ✅ Access link (received via email or other means)
- ✅ Web browser (Chrome, Firefox, Safari, Edge)
- ✅ Stable internet connection
- ✅ Files to upload (if required by the questionnaire)

### Supported Browsers

| Browser | Version | Support |
|---------|---------|---------|
| Google Chrome | 90+ | ✅ Full |
| Mozilla Firefox | 88+ | ✅ Full |
| Microsoft Edge | 90+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Internet Explorer | - | ❌ Not supported |

---

## Accessing the Questionnaire

### Step 1: Opening the Link

1. Find the email or message containing your access link
2. The link format is: `https://[address]/r/[your-unique-code]`
3. Click the link or copy it into your browser

<!-- Screenshot: Example of link in email -->
![Link in email](screenshots/respondent-01-email-link.png)
*Example of access link in an email*

### Step 2: Loading the Form

After clicking the link, you'll see:
- Questionnaire title
- Optional introductory text
- Your identification (organization name)
- Form with questions

<!-- Screenshot: Form start screen -->
![Start screen](screenshots/respondent-02-form-start.png)
*Questionnaire start screen*

### Checking Access Validity

Your access to the questionnaire may be time-limited. If you see one of these messages:

| Message | Meaning | What to do |
|---------|---------|------------|
| "This form is not yet available" | The questionnaire opens later | Try again later, contact NCA |
| "This form has expired" | The deadline has passed | Contact NCA |
| "Invalid access link" | Link is incorrect or deactivated | Verify the link, contact NCA |

---

## Form Interface

### Main Parts of the Screen

<!-- Screenshot: Form parts description -->
![Form parts](screenshots/respondent-03-form-layout.png)
*Form interface with labeled parts*

1. **Header** - Questionnaire title and your identification
2. **Progress indicator** - Percentage completed
3. **Question blocks** - Questions grouped by topic
4. **Questions** - Individual questions to answer
5. **Submit button** - At the end of the form

### Progress Indicator

At the top of the form you'll see:

```
Progress: ████████░░░░░░░░░░░░ 40%
```

- Shows how many **required** questions you've answered
- Updates automatically as you fill out the form
- 100% means all required questions are answered

### Auto-save Indicator

In the top right corner you'll see:

| Status | Meaning |
|--------|---------|
| 💾 "Automatically saved" | Your answers are safely saved |
| ⏳ "Saving..." | Save in progress |
| ⚠️ "Save error" | Connection problem, try refreshing the page |

---

## Completing Questions

### Required vs. Optional Questions

- **Required questions** are marked with a red asterisk *****
- The form cannot be submitted without answering all required questions
- Optional questions can be skipped

### Type 1: Short Text

Single-line text field for short answers.

<!-- Screenshot: Short text -->
![Short text](screenshots/respondent-04-short-text.png)
*Short text field*

**How to fill out:**
1. Click in the field
2. Type your answer
3. Move to the next question (Tab key or click)

**Tips:**
- Maximum length is usually 255 characters
- If you need to write more, use a "Long text" field

### Type 2: Long Text

Multi-line text field for longer answers.

<!-- Screenshot: Long text -->
![Long text](screenshots/respondent-05-long-text.png)
*Long text field*

**How to fill out:**
1. Click in the field
2. Type as much text as needed
3. The field automatically expands with content

**Tips:**
- You can use Enter for new lines
- Copy and paste (Ctrl+C, Ctrl+V) works normally
- No length limit (practically up to tens of thousands of characters)

### Type 3: Single Choice (Radio)

Select exactly one option from a list.

<!-- Screenshot: Radio buttons -->
![Single choice](screenshots/respondent-06-radio.png)
*Single choice question*

**How to fill out:**
1. Read all options
2. Click the circle next to your chosen answer
3. The selected option will be highlighted

**Important:**
- You can only select **one** option
- To change, click on a different option
- If the question is required, you must select

### Type 4: Multiple Choice (Checkbox)

Select any number of options (including none, if not required).

<!-- Screenshot: Checkboxes -->
![Multiple choice](screenshots/respondent-07-checkbox.png)
*Multiple choice question*

**How to fill out:**
1. Click the checkbox for each relevant option
2. Checked options show ✓
3. Click again to deselect

**Tips:**
- You can select all, some, or none
- The order of selection doesn't matter

### Type 5: Scale

Select a value on a numeric scale.

<!-- Screenshot: Scale -->
![Scale](screenshots/respondent-08-scale.png)
*Scale question*

**How to fill out:**
1. Read the labels at the ends of the scale (e.g., "Strongly disagree" ... "Strongly agree")
2. Click the value that best matches your answer
3. Or use the slider

**Scale variations:**
- Numeric (1-5, 1-10, 0-100)
- With labels at values
- With decimal numbers (e.g., 0, 0.25, 0.5, 0.75, 1)

### Type 6: File Upload

Attach one or more files.

<!-- Screenshot: File upload -->
![File upload](screenshots/respondent-09-file-upload.png)
*File upload field*

For detailed instructions, see section [Uploading Files](#uploading-files).

---

## Uploading Files

### Supported Formats

These formats are typically supported (may vary by settings):

| Category | Formats |
|----------|---------|
| Documents | PDF, DOC, DOCX, XLS, XLSX, TXT |
| Images | JPG, JPEG, PNG, GIF |
| Archives | ZIP, RAR |
| Other | As configured by NCA |

### Size Limits

- **Maximum file size:** 50 MB (may be lower)
- **Maximum number of files:** Depends on question settings (typically 1-10)

### Upload Methods

#### Method 1: Drag & Drop

1. Open the folder containing your file on your computer
2. Drag the file with your mouse into the designated area
3. Release the mouse button

<!-- Screenshot: Drag and drop -->
![Drag file](screenshots/respondent-10-drag-drop.png)
*Dragging a file into the upload area*

#### Method 2: File Selection

1. Click the link **"select from computer"** or button **"Select file"**
2. Find the desired file in the dialog window
3. Click **"Open"**

<!-- Screenshot: File selection dialog -->
![File selection](screenshots/respondent-11-file-dialog.png)
*File selection dialog window*

### Upload Progress

After selecting a file you'll see:

1. **File name** and size
2. **Progress bar** for upload
3. After completion: ✅ green checkmark

<!-- Screenshot: Upload progress -->
![Upload progress](screenshots/respondent-12-upload-progress.png)
*File upload progress indicator*

### Removing a File

If you want to upload a different file or uploaded the wrong one:

1. Find the uploaded file in the list
2. Click the **"Remove"** button or 🗑️ icon
3. Confirm removal

<!-- Screenshot: Remove file -->
![Remove file](screenshots/respondent-13-remove-file.png)
*Button for removing a file*

### Troubleshooting Uploads

| Problem | Cause | Solution |
|---------|-------|----------|
| "File is too large" | Size limit exceeded | Reduce file size or contact NCA |
| "Unsupported format" | Format not allowed | Convert to a supported format |
| "Upload failed" | Connection dropped | Try again, refresh the page |
| Upload is slow | Large file or slow connection | Be patient, don't close the page |

---

## Saving and Pausing Work

### Automatic Saving

**Your answers are saved automatically** with every change. You don't need to do anything.

How it works:
1. You fill in or change an answer
2. After 1-2 seconds, saving starts
3. "Saving..." appears, then "Automatically saved"

<!-- Screenshot: Save indicator -->
![Auto-save](screenshots/respondent-14-autosave.png)
*Auto-save indicator*

### Pausing Work

You can safely:
- ✅ Close the browser
- ✅ Turn off your computer
- ✅ Navigate to another page
- ✅ Continue after an hour, a day, a week

**Your answers will remain saved.**

### Continuing Your Work

1. Open the same link again
2. The form will load with your saved answers
3. Continue where you left off

<!-- Screenshot: Continue -->
![Continue filling](screenshots/respondent-15-continue.png)
*Form with previously filled answers*

### Important Notice

⚠️ **Watch the deadline!** 

If the questionnaire has a deadline, you must:
1. **Complete** all required questions
2. **Submit** the form before the deadline

Simply saving answers is not enough – the form must be **submitted**.

---

## Submitting the Form

### Before Submitting

Check that:

1. ✅ All required questions are answered (100% progress)
2. ✅ Files are uploaded (if required)
3. ✅ Answers are correct and complete

### Submission Process

1. Go to the end of the form
2. Click the **"Submit Form"** button

<!-- Screenshot: Submit button -->
![Submit button](screenshots/respondent-16-submit-button.png)
*Form submission button*

### Missing Answers

If you haven't filled in all required questions:

1. A warning will appear
2. The form will scroll to the first unanswered question
3. Fill in the missing answers
4. Try submitting again

<!-- Screenshot: Missing answers -->
![Missing answers](screenshots/respondent-17-validation-error.png)
*Warning about unanswered required questions*

### Submission Confirmation

After successful submission you'll see:

- ✅ Confirmation message
- Date and time of submission
- Option to download a copy (if available)

<!-- Screenshot: Confirmation -->
![Submission confirmation](screenshots/respondent-18-confirmation.png)
*Successful submission confirmation*

### After Submission

⚠️ **Important:** After submitting the form:

- ❌ You **cannot** edit answers
- ❌ You **cannot** add or delete files
- ❌ You **cannot** submit again

If you need to make changes, contact NCA.

---

## Frequently Asked Questions

### General Questions

**Q: Can I fill out the form on my phone?**
A: Yes, the form is responsive and works on mobile devices. For the best experience, we recommend a tablet or computer.

**Q: Do I need to log in somewhere?**
A: No, your access link contains a unique identifier. You don't need a username or password.

**Q: Can I share my link with a colleague?**
A: The link is assigned to your organization. Consult with NCA about sharing.

**Q: What language can I use to fill out the questionnaire?**
A: The interface supports Czech, Slovak, and English. You can switch languages in the top right corner. You can write your answers in any language.

### Saving Questions

**Q: Will I lose my answers if I close the browser?**
A: No, answers are saved automatically. They'll be there when you return.

**Q: How do I know my answers are saved?**
A: You'll see "Automatically saved" with a green checkmark in the corner.

**Q: What if I lose internet while filling out?**
A: Answers will save once the connection is restored. Don't close the page.

### File Questions

**Q: What files can I upload?**
A: Depends on questionnaire settings. Typically PDF, Word, Excel, images.

**Q: Can I upload multiple files to one question?**
A: Yes, if the question allows it. You'll see the maximum at the question.

**Q: Can I upload a ZIP archive?**
A: Usually yes, verify with the specific questionnaire.

### Submission Questions

**Q: Can I edit answers after submitting?**
A: No, answers are locked after submission. Contact NCA.

**Q: Will I receive email confirmation?**
A: Depends on settings. You always see confirmation on screen.

**Q: What if I submit by mistake?**
A: Contact NCA as soon as possible.

---

## Troubleshooting

### Problem: Page Won't Load

**Symptoms:** White page, 404 error, "Page not found"

**Solution:**
1. Check the link is correct (typos, missing characters)
2. Try refreshing the page (F5 or Ctrl+R)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try a different browser
5. Contact NCA

### Problem: Form Shows but Can't Fill Out

**Symptoms:** Fields are inactive, can't type

**Solution:**
1. You may have already submitted – check status
2. The deadline may have passed – contact NCA
3. Try refreshing the page
4. Disable ad blocker/extensions

### Problem: Changes Aren't Saving

**Symptoms:** "Automatically saved" doesn't appear, answers missing after refresh

**Solution:**
1. Check your internet connection
2. Wait and try again
3. Don't use private/incognito mode (may block saving)
4. Try a different browser

### Problem: Can't Upload File

**Symptoms:** Error message when uploading, file doesn't appear

**Solution:**
1. Check file size (max 50 MB)
2. Verify file format
3. Try renaming the file (remove special characters)
4. Try a different file

### Problem: "Submit" Button Won't Click

**Symptoms:** Button is gray, unclickable

**Solution:**
1. Fill in all required questions (marked with *)
2. Get progress to 100%
3. Refresh the page and try again

### Contact Support

If problems persist, prepare:

- 📝 Description of the problem
- 📸 Screenshot of the error (if possible)
- 🔗 Access link (or part of it)
- 💻 Browser and operating system used

Contact the National Competition Authority through the contact details in the original email.

---

## Keyboard Shortcuts

For faster filling, you can use:

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next field |
| `Shift + Tab` | Move to previous field |
| `Space` | Select/deselect checkbox |
| `↑` `↓` | Move between options (radio/checkbox) |
| `Enter` | Confirm (in single-line field) |
| `Ctrl + V` | Paste copied text |

---

## Summary

### 5-Step Process

1. **Open the link** from your email
2. **Fill out questions** – answers save automatically
3. **Upload files** (if required)
4. **Review answers** – go back and correct
5. **Submit the form** with the button at the end

### Remember

✅ Answers save automatically
✅ You can pause and continue anytime
✅ Required questions are marked with *
⚠️ Cannot change after submission
⚠️ Don't forget to submit before the deadline!

---

*Respondent Guide v1.0 | DRP – Data Request Portal | NCA | December 2025*
