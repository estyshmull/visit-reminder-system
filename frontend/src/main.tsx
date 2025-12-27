import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { CacheProvider } from '@emotion/react'
import App from './App'
import createEmotionCache from './theme/emotion-cache'
import theme from './theme/theme'
import './index.css'

// Create React Query client
const queryClient = new QueryClient()

// Create emotion cache (with RTL)
const cache = createEmotionCache()

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
	<React.StrictMode>
		<CacheProvider value={cache}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<QueryClientProvider client={queryClient}>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</QueryClientProvider>
			</ThemeProvider>
		</CacheProvider>
	</React.StrictMode>,
)
