import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Survey from './pages/Survey'
import Journals from './pages/Journals'
import Dashboard from './pages/Dashboard'
import WritingPanel from './pages/WritingPanel'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route path="survey" element={<Survey />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="journals" element={<Journals />} />
          <Route path="writing" element={<WritingPanel />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App