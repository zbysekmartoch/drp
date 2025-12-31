import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import EditorDashboard from './pages/editor/EditorDashboard'
import QuestionnaireBuilder from './pages/editor/QuestionnaireBuilder'
import RespondentManager from './pages/editor/RespondentManager'
import ResponsesOverview from './pages/editor/ResponsesOverview'
import RespondentForm from './pages/respondent/RespondentForm'
import CreateQuestionnaire from './pages/CreateQuestionnaire'
import SubmissionView from './pages/public/SubmissionView'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Context
import { AuthProvider } from './context/AuthContext'
import { EditorProvider } from './context/EditorContext'
import { ToastProvider } from './context/ToastContext'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateQuestionnaire />
            </ProtectedRoute>
          } />
          
          {/* Questionnaire routes (protected) */}
          <Route path="/e/:code" element={
            <ProtectedRoute>
              <EditorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/e/:code/respondents" element={
            <ProtectedRoute>
              <RespondentManager />
            </ProtectedRoute>
          } />
          <Route path="/e/:code/responses" element={
            <ProtectedRoute>
              <ResponsesOverview />
            </ProtectedRoute>
          } />
          <Route path="/e/:code/submissions/:respondentId" element={
            <ProtectedRoute>
              <SubmissionView />
            </ProtectedRoute>
          } />
          <Route path="/e/:code/builder" element={
            <ProtectedRoute>
              <EditorProvider>
                <QuestionnaireBuilder />
              </EditorProvider>
            </ProtectedRoute>
          } />
          
          {/* Respondent routes - PUBLIC (no auth required) */}
          <Route path="/r/:token" element={<RespondentForm />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
