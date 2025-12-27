import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'

// Create an emotion cache with RTL support
export default function createEmotionCache() {
  return createCache({ key: 'css', stylisPlugins: [rtlPlugin] })
}
