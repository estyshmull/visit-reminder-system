import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './AppNew'
import './styles/globals.css'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

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
