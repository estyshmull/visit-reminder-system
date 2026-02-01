import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosResponse } from 'axios'
// Use runtime require for form-data to avoid build-time type issues
// form-data is commonly available; if not, install with: npm i form-data

export interface VoiceCallOptions {
  phoneNumber: string
  message: string
  voice?: string
  lang?: string
  volume?: number
  speed?: number
}

export interface YemotResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

@Injectable()
export class YemotService {
  private readonly logger = new Logger(YemotService.name)
  private readonly phone: string
  private readonly password: string
  private readonly token: string | undefined
  private readonly apiBaseUrl: string
  private readonly defaultSettings: any

  constructor(private configService: ConfigService) {
    this.phone = this.configService.get<string>('yemot.phone') || ''
    this.password = this.configService.get<string>('yemot.password') || ''
    this.token = this.configService.get<string>('yemot.token')
    this.apiBaseUrl = this.configService.get<string>('yemot.apiBaseUrl') || 'https://www.call2all.co.il/ym/api'
    this.defaultSettings = this.configService.get('yemot.defaultSettings')

    // הוספת לוגים לבדיקה
    this.logger.log(`📱 Yemot phone: ${this.phone}`)
    this.logger.log(`🔐 Yemot password: ${this.password ? '***' + this.password.substring(this.password.length-3) : 'NOT_SET'}`)
    this.logger.log(`🎫 Yemot token: ${this.token ? 'SET (using fixed token)' : 'NOT_SET (will request dynamically)'}`)
    this.logger.log(`🌐 Yemot API URL: ${this.apiBaseUrl}`)

    if (!this.phone || (!this.password && !this.token)) {
      this.logger.error('❌ חסרים פרטי התחברות לימות המשיח - phone ו-(password או token)')
    }
  }

  /**
   * יצירת קמפיין חדש ב-Yemot
   * @param name - שם הקמפיין
   */
  async createCampaign(name: string): Promise<YemotResponse> {
    try {
      const token = await this.getSessionToken()
      if (!token) throw new Error('Failed to obtain session token')

      const url = `${this.apiBaseUrl}/CreateCampaign`
      const params = { token, name }
      this.logger.log(`➡️ Creating campaign: ${name}`)

      const response = await axios.post(url, null, { params, timeout: 15000 })
      this.logger.debug('🗂 CreateCampaign response:', response.data)

      if (response.data && response.data.responseStatus === 'OK') {
        return { success: true, data: response.data }
      }

      return { success: false, error: 'CreateCampaign returned non-OK', data: response.data }
    } catch (error) {
      this.logger.error('❌ createCampaign error:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * העלאת קובץ שמע (multipart/form-data) לשרת Yemot וקשירתו לקמפיין
   * @param campaignId
   * @param fileBuffer - buffer של הקובץ
   * @param filename - שם הקובץ
   */
  async uploadAudio(campaignId: string, fileBuffer: Buffer, filename: string): Promise<YemotResponse> {
    try {
      const token = await this.getSessionToken()
      if (!token) throw new Error('Failed to obtain session token')

      const FormData = require('form-data')
      const form = new FormData()
      form.append('token', token)
      form.append('campaignId', campaignId)
      form.append('file', fileBuffer, { filename })

      const url = `${this.apiBaseUrl}/UploadAudio`
      const headers = form.getHeaders()

      this.logger.log(`⬆️ Uploading audio to campaign ${campaignId} (${filename})`)

      const response = await axios.post(url, form, { headers, timeout: 30000 })
      this.logger.debug('📨 UploadAudio response:', response.data)

      if (response.data && response.data.responseStatus === 'OK') {
        return { success: true, data: response.data }
      }

      return { success: false, error: 'UploadAudio returned non-OK', data: response.data }
    } catch (error) {
      this.logger.error('❌ uploadAudio error:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * הוספת מספר טלפון לקמפיין
   */
  async addPhoneNumber(campaignId: string, phoneNumber: string): Promise<YemotResponse> {
    try {
      const token = await this.getSessionToken()
      if (!token) throw new Error('Failed to obtain session token')

      const url = `${this.apiBaseUrl}/AddPhoneToCampaign`
      const params = { token, campaignId, phone: phoneNumber }

      this.logger.log(`➕ Adding phone ${phoneNumber} to campaign ${campaignId}`)

      const response = await axios.post(url, null, { params, timeout: 15000 })
      this.logger.debug('📨 AddPhoneToCampaign response:', response.data)

      if (response.data && response.data.responseStatus === 'OK') {
        return { success: true, data: response.data }
      }

      return { success: false, error: 'AddPhoneToCampaign returned non-OK', data: response.data }
    } catch (error) {
      this.logger.error('❌ addPhoneNumber error:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * הפעלת הקמפיין
   */
  async runCampaign(campaignId: string): Promise<YemotResponse> {
    try {
      const token = await this.getSessionToken()
      if (!token) throw new Error('Failed to obtain session token')

      const url = `${this.apiBaseUrl}/RunCampaign`
      const params = { token, campaignId }

      this.logger.log(`▶️ Running campaign ${campaignId}`)

      const response = await axios.post(url, null, { params, timeout: 15000 })
      this.logger.debug('📨 RunCampaign response:', response.data)

      if (response.data && response.data.responseStatus === 'OK') {
        return { success: true, data: response.data }
      }

      return { success: false, error: 'RunCampaign returned non-OK', data: response.data }
    } catch (error) {
      this.logger.error('❌ runCampaign error:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * בדיקת סטטוס קמפיין
   */
  async getCampaignStatus(campaignId: string): Promise<YemotResponse> {
    try {
      const token = await this.getSessionToken()
      if (!token) throw new Error('Failed to obtain session token')

      const url = `${this.apiBaseUrl}/GetCampaignStatus`
      const params = { token, campaignId }

      const response = await axios.get(url, { params, timeout: 10000 })
      this.logger.debug('📊 GetCampaignStatus response:', response.data)

      return { success: true, data: response.data }
    } catch (error) {
      this.logger.error('❌ getCampaignStatus error:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * פונקציית בדיקה שמריצה את רצף הפעולות לשליחת שיחת בדיקה.
   * מנסה ליצור קמפיין, להעלות שמע/להשתמש ב-TTS, להוסיף מספר ולהפעיל.
   * במידה ולא מתאים ל-API הנוכחי, נשתמש ב-fallback שדי פשוט שולח הודעה ישירה.
   */
  async sendTestCall(phoneNumber: string, message: string): Promise<YemotResponse> {
    const timestamp = new Date().toISOString()
    const campaignName = `בדיקה - ${timestamp}`

    try {
      // 1) create campaign
      const createRes = await this.createCampaign(campaignName)
      if (!createRes.success) {
        this.logger.warn('⚠️ createCampaign failed, falling back to direct SendVoiceMessage')
        // fallback: send single voice message
        return this.sendVoiceMessage({ phoneNumber, message })
      }

      const campaignId = createRes.data?.campaignId || createRes.data?.id || null
      if (!campaignId) {
        this.logger.warn('⚠️ createCampaign did not return campaignId, falling back to direct SendVoiceMessage')
        return this.sendVoiceMessage({ phoneNumber, message })
      }

      // 2) For TTS we assume the API can take text when running campaign or upload audio.
      // Here we skip uploadAudio and rely on campaign settings, but keep the method available.

      // 3) add phone
      const addPhoneRes = await this.addPhoneNumber(campaignId, phoneNumber)
      if (!addPhoneRes.success) {
        this.logger.warn('⚠️ addPhoneNumber failed, falling back to direct SendVoiceMessage')
        return this.sendVoiceMessage({ phoneNumber, message })
      }

      // 4) run campaign
      const runRes = await this.runCampaign(campaignId)
      if (!runRes.success) {
        this.logger.warn('⚠️ runCampaign failed, returning result')
        return runRes
      }

      // 5) optionally check status
      const status = await this.getCampaignStatus(campaignId)

      return {
        success: true,
        message: 'Campaign started (or SendVoiceMessage used)',
        data: { campaignId, createRes, addPhoneRes, runRes, status },
      }
    } catch (error) {
      this.logger.error('❌ sendTestCall error:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * שליחת הודעה קולית דרך ימות המשיח
   */
  async sendVoiceMessage(options: VoiceCallOptions): Promise<YemotResponse> {
    try {
      this.logger.log(`📞 שולח הודעה קולית ל-${options.phoneNumber}`)

      // קבלת session token
      const sessionToken = await this.getSessionToken()
      if (!sessionToken) {
        throw new Error('לא הצלחנו לקבל session token')
      }

      // בניית הפרמטרים לשליחת הודעה קולית
      const params = {
        token: sessionToken,
        phones: options.phoneNumber,
        text: options.message,
        voice: options.voice || this.defaultSettings.voice,
        lang: options.lang || this.defaultSettings.lang,
      }

      this.logger.debug('📋 פרמטרים לשליחה:', { 
        phone: options.phoneNumber, 
        voice: params.voice,
        messageLength: options.message.length,
        token: sessionToken.substring(0, 10) + '...',
      })

      // שליחת ההודעה הקולית
      const response = await axios.get(`${this.apiBaseUrl}/SendVoiceMessage`, {
        params,
        timeout: 15000,
      })

      this.logger.log(`✅ הודעה נשלחה בהצלחה ל-${options.phoneNumber}`)
      this.logger.debug('📨 תגובת השרת:', response.data)

      return {
        success: true,
        message: 'הודעה קולית נשלחה בהצלחה',
        data: response.data,
      }
    } catch (error) {
      this.logger.error(`❌ שגיאה בשליחת הודעה ל-${options.phoneNumber}:`, error.message)
      
      return {
        success: false,
        error: error.message,
        message: 'שגיאה בשליחת הודעה קולית',
      }
    }
  }

  /**
   * בדיקת חיבור לשרתי ימות המשיח - קבלת session token
   */
  async testConnection(): Promise<YemotResponse> {
    try {
      this.logger.log('🔍 בודק חיבור לימות המשיח...')

      // קבלת session token
      const sessionToken = await this.getSessionToken()
      
      if (sessionToken) {
        this.logger.log('✅ החיבור לימות המשיח תקין')
        return {
          success: true,
          message: 'החיבור תקין - קיבלנו session token',
          data: { sessionToken: sessionToken.substring(0, 20) + '...' },
        }
      } else {
        this.logger.error('❌ לא הצלחנו לקבל session token')
        return {
          success: false,
          error: 'לא הצלחנו לקבל session token',
          message: 'בעיה באימות עם ימות המשיח',
        }
      }
    } catch (error) {
      this.logger.error('❌ שגיאה בחיבור לימות המשיח:', error.message)
      return {
        success: false,
        error: error.message,
        message: 'שגיאה בחיבור',
      }
    }
  }

  /**
   * בדיקת חיבור מפורטת עם פרטי הבקשה
   */
  async testConnectionDetailed(): Promise<any> {
    try {
      this.logger.log('🔍 בודק חיבור מפורט...')

      const params = {
        username: this.phone,
        password: this.password,
      }

      const url = `${this.apiBaseUrl}/GetTokens`
      
      this.logger.log(`📞 שולח בקשה ל: ${url}`)
      this.logger.log(`📋 פרמטרים: username=${this.phone}, password=***`)

      const response = await axios.get(url, {
        params,
        timeout: 10000,
      })

      return {
        success: true,
        request: {
          url: url,
          params: {
            username: this.phone,
            password: '***' + this.password.substring(this.password.length - 3),
          },
        },
        response: response.data,
        status: response.status,
      }
    } catch (error) {
      return {
        success: false,
        request: {
          url: `${this.apiBaseUrl}/GetTokens`,
          params: {
            username: this.phone,
            password: '***',
          },
        },
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      }
    }
  }

  /**
   * קבלת session token מימות המשיח
   */
  private async getSessionToken(): Promise<string | null> {
    // אם יש טוכן קבוע, השתמש בו
    if (this.token) {
      this.logger.log('🎫 משתמש בטוכן קבוע מההגדרות')
      return this.token
    }

    try {
      const params = {
        username: this.phone,
        password: this.password,
      }

      this.logger.log(`🔐 מבקש session token עבור: ${this.phone}`)
      this.logger.debug(`📞 API URL: ${this.apiBaseUrl}/GetTokens`)

      const response = await axios.get(`${this.apiBaseUrl}/GetTokens`, {
        params,
        timeout: 10000,
      })

      this.logger.debug('📨 תגובת GetTokens:', JSON.stringify(response.data, null, 2))

      // חילוץ ה-session token מהתגובה
      if (response.data && response.data.responseStatus === 'OK' && response.data.token) {
        this.logger.log('✅ קיבלנו session token בהצלחה')
        return response.data.token
      }

      this.logger.error('❌ תגובה לא תקינה מהשרת:', response.data)
      return null
    } catch (error) {
      this.logger.error('❌ שגיאה בקבלת session token:', error.message)
      if (error.response) {
        this.logger.error('📨 תגובת שרת עם שגיאה:', error.response.data)
        this.logger.error('📊 סטטוס:', error.response.status)
      }
      throw error
    }
  }

  /**
   * יצירת הודעה סטנדרטית לתזכורת ביקור
   */
  createVisitReminderMessage(visitorName: string, visitDate: string, visitTime: string): string {
    return `שלום ${visitorName}. זוהי תזכורת לביקור שלך המתוכנן למחר, ${visitDate}, בשעה ${visitTime}. תודה ולהתראות.`
  }
}