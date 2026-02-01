import { registerAs } from '@nestjs/config'

export default registerAs('yemot', () => ({
  phone: process.env.YEMOT_PHONE,
  password: process.env.YEMOT_PASSWORD,
  token: process.env.YEMOT_TOKEN, // אפשרות לטוכן קבוע
  apiBaseUrl: process.env.YEMOT_API_BASE || 'https://www.call2all.co.il/ym/api',
  
  // Default settings for voice calls
  defaultSettings: {
    voice: 'Shira',  // קול ברירת מחדל
    lang: 'he',      // עברית
    volume: 5,       // עוצמה
    speed: 0,        // מהירות רגילה
  },
  
  // API endpoints
  endpoints: {
    send: '/SendSMS',
    voice: '/GetTokens', // נעדכן לפי הצורך
    status: '/GetSmsStatus',
  },
}))