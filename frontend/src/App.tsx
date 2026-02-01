import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import './styles/custom.css';

import Dashboard from './pages/Dashboard'
import Volunteers from './pages/Volunteers'
import CalendarPage from './pages/Calendar'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const App: React.FC = () => {
  return (
    <Box sx={{ direction: 'rtl', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback */}
          <Route path="*" element={<div>לא נמצאה העמוד</div>} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App
