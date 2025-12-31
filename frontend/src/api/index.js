import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add session header for editor requests and auth token
api.interceptors.request.use((config) => {
  // Editor session (legacy)
  const session = localStorage.getItem('editorSession');
  if (session) {
    const sessionData = JSON.parse(session);
    config.headers['x-editor-session'] = sessionData.sessionId;
  }
  
  // JWT auth token
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('editorSession');
      // Could redirect to login here
    }
    return Promise.reject(error);
  }
);

// Questionnaire management (public)
export const createQuestionnaire = (data) => api.post('/questionnaires', data);
export const getQuestionnaires = () => api.get('/questionnaires');
export const getQuestionnairePublic = (id) => api.get(`/questionnaires/${id}`);
export const getQuestionnaireByCode = (code) => api.get(`/questionnaires/code/${code}`);
export const checkQuestionnaire = (code) => api.get(`/questionnaires/check/${code}`);
export const deleteQuestionnaire = (id) => api.delete(`/questionnaires/${id}`);
export const cloneQuestionnairePublic = (id, data) => api.post(`/questionnaires/${id}/clone`, data);
export const getRespondentsPublic = (id) => api.get(`/questionnaires/${id}/respondents`);
export const getSubmissionPublic = (id, respondentId) => api.get(`/questionnaires/${id}/submissions/${respondentId}`);
export const getDashboardPublic = (id) => api.get(`/questionnaires/${id}/dashboard`);
export const getRespondentsByCode = (code) => api.get(`/questionnaires/code/${code}/respondents`);
export const getDashboardByCode = (code) => api.get(`/questionnaires/code/${code}/dashboard`);
export const exportDataPublic = (id, format) => api.post(`/questionnaires/${id}/export`, { format }, { responseType: format === 'csv' ? 'text' : 'blob' });

// Editor auth
export const editorLogin = (code, password) => api.post(`/e/${code}/login`, { password });
export const editorLogout = () => api.post('/e/logout');

// Editor - questionnaire
export const getQuestionnaire = (id) => api.get(`/e/questionnaire/${id}`);
export const updateQuestionnaire = (id, data) => api.put(`/e/questionnaire/${id}`, data);
export const updateDefinition = (id, definition) => api.put(`/e/questionnaire/${id}/definition`, { definition });
export const publishQuestionnaire = (id) => api.post(`/e/questionnaire/${id}/publish`);
export const cloneQuestionnaire = (id, data) => api.post(`/e/questionnaire/${id}/clone`, data);
export const getDashboard = (id) => api.get(`/e/questionnaire/${id}/dashboard`);
export const exportData = (id, format) => api.post(`/e/questionnaire/${id}/export`, { format }, { responseType: format === 'csv' ? 'text' : 'blob' });

// Editor - respondents
export const getRespondents = (questionnaireId) => api.get(`/e/questionnaire/${questionnaireId}/respondents`);
export const addRespondent = (questionnaireId, data) => api.post(`/e/questionnaire/${questionnaireId}/respondents`, data);
export const updateRespondent = (respondentId, data) => api.put(`/e/respondent/${respondentId}`, data);
export const bulkUpdateRespondents = (questionnaireId, data) => api.put(`/e/questionnaire/${questionnaireId}/respondents/bulk-update`, data);
export const importRespondents = (questionnaireId, respondents) => api.post(`/e/questionnaire/${questionnaireId}/respondents/import`, { respondents });
export const deleteRespondent = (respondentId) => api.delete(`/e/respondent/${respondentId}`);
export const rotateToken = (respondentId) => api.post(`/e/respondent/${respondentId}/token/rotate`);
export const getSubmission = (questionnaireId, respondentId) => api.get(`/e/questionnaire/${questionnaireId}/submissions/${respondentId}`);

// Respondent form
export const getForm = (token) => api.get(`/r/${token}/form`);
export const logFormAccess = (token, browserInfo) => api.post(`/r/${token}/log-access`, { browserInfo });
export const getRespondentSubmission = (token) => api.get(`/r/${token}/submission`);
export const saveSubmission = (token, data) => api.put(`/r/${token}/submission`, { data });
export const submitForm = (token, data) => api.post(`/r/${token}/submit`, { data });
export const uploadFile = (token, questionId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('questionId', questionId);
  return api.post(`/r/${token}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteFile = (token, fileId) => api.delete(`/r/${token}/file/${fileId}`);

export default api;
