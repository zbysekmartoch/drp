/**
 * Export utilities - CSV, XLSX, ZIP bundle
 */

const ExcelJS = require('exceljs');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

/**
 * Get option value (technical) for a given answer
 */
const getOptionValue = (question, answerLabel) => {
  if (!question.options) return answerLabel;
  const option = question.options.find(o => o.label === answerLabel || o.id === answerLabel);
  return option?.value || option?.label || answerLabel;
};

/**
 * Transform answer to use technical values
 */
const transformAnswer = (question, answer) => {
  if (answer === null || answer === undefined) return '';
  
  if (question.type === 'radio') {
    return getOptionValue(question, answer);
  }
  
  if (question.type === 'checkbox' && Array.isArray(answer)) {
    return answer.map(a => getOptionValue(question, a));
  }
  
  return answer;
};

/**
 * Generate CSV export - uses variable names and option values
 */
const generateCSV = (submissions, questions) => {
  // Use variable or fallback to id
  const headers = ['respondent', 'ico', 'status', 'submitted_at', ...questions.map(q => q.variable || q.id)];
  const rows = [headers.join(',')];
  
  for (const submission of submissions) {
    const row = [
      `"${(submission.respondentName || '').replace(/"/g, '""')}"`,
      submission.ico || '',
      submission.status,
      submission.submittedAt || ''
    ];
    
    for (const question of questions) {
      let value = submission.answers[question.id];
      
      // Transform to technical values
      value = transformAnswer(question, value);
      
      if (Array.isArray(value)) {
        value = value.join(';');
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      } else if (value === null || value === undefined) {
        value = '';
      }
      
      // Escape for CSV
      value = String(value).replace(/"/g, '""');
      row.push(`"${value}"`);
    }
    
    rows.push(row.join(','));
  }
  
  // Add BOM for UTF-8
  return '\ufeff' + rows.join('\n');
};

/**
 * Generate XLSX export - uses variable names and option values
 */
const generateXLSX = async (submissions, questions, definition) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DRP - Data Request Portal';
  workbook.created = new Date();
  
  // Sheet 1: Submissions (technical - uses variables and values)
  const submissionsSheet = workbook.addWorksheet('Data');
  
  // Headers - use variable names
  const headers = ['respondent', 'ico', 'status', 'submitted_at', ...questions.map(q => q.variable || q.id)];
  submissionsSheet.addRow(headers);
  
  // Style header row
  const headerRow = submissionsSheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Data rows
  for (const submission of submissions) {
    const row = [
      submission.respondentName || '',
      submission.ico || '',
      submission.status,
      submission.submittedAt ? new Date(submission.submittedAt) : ''
    ];
    
    for (const question of questions) {
      let value = submission.answers[question.id];
      
      // Transform to technical values
      value = transformAnswer(question, value);
      
      if (Array.isArray(value)) {
        value = value.join('; ');
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      } else if (value === null || value === undefined) {
        value = '';
      }
      
      row.push(value);
    }
    
    submissionsSheet.addRow(row);
  }
  
  // Auto-width columns
  submissionsSheet.columns.forEach(column => {
    column.width = 20;
  });
  
  // Sheet 2: Questions metadata (mapping between variable and label)
  const questionsSheet = workbook.addWorksheet('Codebook');
  questionsSheet.addRow(['Variable', 'Type', 'Label', 'Required', 'Block', 'Options']);
  const qHeaderRow = questionsSheet.getRow(1);
  qHeaderRow.font = { bold: true };
  qHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  for (const question of questions) {
    // Build options string (value=label pairs)
    let optionsStr = '';
    if (question.options) {
      optionsStr = question.options.map(o => `${o.value || o.id}="${o.label}"`).join('; ');
    }
    
    questionsSheet.addRow([
      question.variable || question.id,
      question.type,
      question.label || '',
      question.required ? 'Yes' : 'No',
      question.blockTitle || '',
      optionsStr
    ]);
  }
  
  questionsSheet.columns.forEach(column => {
    column.width = 25;
  });
  
  // Sheet 3: File metadata
  const filesSheet = workbook.addWorksheet('Soubory');
  filesSheet.addRow(['Respondent', 'Otázka', 'Název souboru', 'Typ', 'Velikost (bytes)']);
  const fHeaderRow = filesSheet.getRow(1);
  fHeaderRow.font = { bold: true };
  fHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  for (const submission of submissions) {
    if (submission.files) {
      for (const file of submission.files) {
        filesSheet.addRow([
          submission.respondentName || '',
          file.questionId,
          file.originalName,
          file.mimeType || '',
          file.sizeBytes || 0
        ]);
      }
    }
  }
  
  filesSheet.columns.forEach(column => {
    column.width = 25;
  });
  
  return workbook;
};

/**
 * Generate ZIP bundle with all exports and files
 */
const generateBundle = async (submissions, questions, definition, template, files, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => resolve(outputPath));
    archive.on('error', reject);
    
    archive.pipe(output);
    
    // Add questionnaire definition
    archive.append(JSON.stringify(definition, null, 2), { name: 'questionnaire-definition.json' });
    
    // Add template CSS
    if (template && template.css) {
      archive.append(template.css, { name: 'template.css' });
    }
    
    // Add CSV
    const csv = generateCSV(submissions, questions);
    archive.append(csv, { name: 'export.csv' });
    
    // Add uploaded files organized by respondent
    for (const submission of submissions) {
      if (submission.files) {
        const respondentDir = `files/${submission.respondentName || submission.respondentId}`;
        
        for (const file of submission.files) {
          if (fs.existsSync(file.storagePath)) {
            archive.file(file.storagePath, { 
              name: `${respondentDir}/${file.questionId}/${file.originalName}` 
            });
          }
        }
      }
    }
    
    archive.finalize();
  });
};

/**
 * Get all questions from definition in flat array
 */
const flattenQuestions = (definition) => {
  const questions = [];
  
  if (!definition || !definition.blocks) {
    return questions;
  }
  
  for (const block of definition.blocks) {
    if (block.questions) {
      for (const question of block.questions) {
        questions.push({
          ...question,
          blockId: block.id,
          blockTitle: block.title
        });
      }
    }
  }
  
  return questions;
};

module.exports = {
  generateCSV,
  generateXLSX,
  generateBundle,
  flattenQuestions
};
