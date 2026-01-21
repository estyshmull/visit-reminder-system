import React from 'react'
import { createRoot } from 'react-dom/client'
import AppNew from './AppNew'

// Get the root element
const container = document.getElementById('root')!
const root = createRoot(container)

// Render the app
root.render(
  <React.StrictMode>
    <AppNew />
  </React.StrictMode>
)