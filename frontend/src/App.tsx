import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Box, Typography } from '@mui/material'

import Dashboard from './pages/Dashboard'
import Volunteers from './pages/Volunteers'
import CalendarPage from './pages/Calendar'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const App: React.FC = () => {
  return (
    <Box sx={{ direction: 'rtl', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            מערכת תזכורות ביקורים
          </Typography>

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
        </Box>
      </Container>
    </Box>
  )
}

export default App
