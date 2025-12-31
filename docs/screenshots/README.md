# Screenshot Guide

This document provides instructions for capturing screenshots for the DRP User Manual.

## Required Screenshots

Take screenshots at **1280x800** resolution with the browser at full width.

### Setup

1. Start the backend: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5174` in Chrome
4. Use DevTools (F12) → Toggle device toolbar → Set to 1280x800

### Screenshot List

| # | Filename | Page/URL | Description | How to capture |
|---|----------|----------|-------------|----------------|
| 01 | `01-login.png` | `/login` | Login page | Open login page, don't fill anything |
| 02 | `02-dashboard.png` | `/` | Main dashboard | Login, show list with 2-3 questionnaires |
| 03 | `03-create-questionnaire.png` | Click "New" button | Create form | Show modal with empty form |
| 04 | `04-questionnaire-overview.png` | `/e/{code}` | Overview tab | Show stats and quick actions |
| 05 | `05-question-builder.png` | `/e/{code}/builder` | Builder tab | Show with 1-2 blocks and questions |
| 06 | `06-add-block.png` | Builder | Adding block | Click "Add Block", show new empty block |
| 07 | `07-question-types.png` | Builder | Question buttons | Show the row of question type buttons |
| 08 | `08-question-settings.png` | Builder | Expanded question | Click on a question to expand settings |
| 09 | `09-choice-options.png` | Builder | Radio/checkbox options | Show options list with add button |
| 10 | `10-scale-config.png` | Builder | Scale settings | Show scale min/max/step and labels |
| 11 | `11-respondent-manager.png` | `/e/{code}/respondents` | Respondent list | Show table with 3-5 respondents |
| 12 | `12-add-respondent.png` | Click "Add" | Add modal | Show the add respondent form |
| 13 | `13-import-respondents.png` | Click "Add Multiple" | Import modal | Show bulk import textarea |
| 14 | `14-copy-link.png` | Respondents | Copy action | Hover over copy icon |
| 15 | `15-bulk-actions.png` | Respondents | Bulk menu | Select 2+ items, show dropdown |
| 16 | `16-responses-overview.png` | `/e/{code}/responses` | Responses tab | Show stats and progress bar |
| 17 | `17-view-submission.png` | Click on submission | Detail view | Show individual answers |
| 18 | `18-export-options.png` | Overview or Responses | Export buttons | Show CSV/Excel/ZIP buttons |
| 19 | `19-respondent-form.png` | `/r/{token}` | Form start | Open form as respondent |
| 20 | `20-form-progress.png` | Form | Progress bar | Show partially filled form |
| 21 | `21-file-upload.png` | Form | File question | Show file upload area |
| 22 | `22-submit-confirmation.png` | After submit | Thank you | Show confirmation message |

### Tips

- Use **dark mode off** (light theme)
- Set language to **English** for international docs (or Czech for Czech manual)
- **Blur or redact** any sensitive data
- Keep content realistic but not containing real company names

### Tools

- **macOS:** Cmd + Shift + 4 (area selection)
- **Windows:** Win + Shift + S (Snipping Tool)
- **Linux:** gnome-screenshot -a or Flameshot
- **Chrome DevTools:** Ctrl + Shift + P → "Capture screenshot"

### Post-processing

1. Crop to content (remove browser chrome)
2. Add subtle border if needed (1px gray)
3. Optimize with TinyPNG or similar
4. Save as PNG

### Image Optimization

```bash
# Using pngquant
pngquant --quality=65-80 screenshots/*.png

# Using optipng
optipng -o5 screenshots/*.png
```
