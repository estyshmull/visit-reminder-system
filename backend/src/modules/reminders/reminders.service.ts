import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { ReminderStatus, ReminderType } from '../../common/enums'
import { YemotService } from './yemot.service'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name)

  constructor(
    private prisma: PrismaService,
    private yemotService: YemotService,
  ) {}

  async findAll() {
    // Use ReminderLog model from schema
    return this.prisma.reminderLog.findMany({
      include: { visitor: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPending() {
    return this.prisma.reminderLog.findMany({
      where: { status: ReminderStatus.PENDING },
      include: { visitor: true },
    })
  }

  async createReminder(visitId: string, type: ReminderType) {
    // Map visit -> ReminderLog. Create a reminder record linked to the visit's user.
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } })
    if (!visit) throw new Error('Visit not found')

    return this.prisma.reminderLog.create({
      data: {
        userId: visit.userId,
        scheduledDate: visit.scheduledAt,
        status: ReminderStatus.PENDING,
      },
    })
  }

  async markAsSent(id: string) {
    return this.prisma.reminderLog.update({
      where: { id },
      data: { status: ReminderStatus.SENT, sentAt: new Date() },
    })
  }

  async markAsFailed(id: string, error: string) {
    return this.prisma.reminderLog.update({
      where: { id },
      // Prisma field name for errors is `errorMessage` in the schema
      data: { status: ReminderStatus.FAILED, errorMessage: error },
    })
  }

  // שליחת תזכורת בפועל דרך ימות המשיח
  async sendReminder(reminderId: string) {
    const reminder = await this.prisma.reminderLog.findUnique({
      where: { id: reminderId },
      include: { 
        visitor: true,
      },
    })

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    if (!reminder.visitor) {
      throw new Error('Visitor not found for this reminder')
    }

    // בדיקה שיש מספר טלפון
    if (!reminder.visitor.phone) {
      this.logger.warn(`⚠️ למבקר ${reminder.visitor.name} אין מספר טלפון`)
      await this.markAsFailed(reminderId, 'אין מספר טלפון')
      throw new Error('Visitor does not have a phone number')
    }

    try {
      this.logger.log(`📞 שולח תזכורת למבקר: ${reminder.visitor.name} (${reminder.visitor.phone})`)

      // יצירת הודעה מותאמת אישית
      const message = this.createReminderMessage(
        reminder.visitor.name,
        reminder.scheduledDate,
      )

      // שליחת ההודעה דרך ימות המשיח
      const result = await this.yemotService.sendVoiceMessage({
        phoneNumber: reminder.visitor.phone,
        message: message,
      })

      if (result.success) {
        this.logger.log(`✅ תזכורת נשלחה בהצלחה ל-${reminder.visitor.name}`)
        await this.markAsSent(reminderId)
        return {
          success: true,
          message: 'תזכורת נשלחה בהצלחה',
          data: result.data,
        }
      } else {
        this.logger.error(`❌ שגיאה בשליחת תזכורת ל-${reminder.visitor.name}: ${result.error}`)
        await this.markAsFailed(reminderId, result.error || 'שגיאה לא ידועה')
        throw new Error(result.error || 'Failed to send reminder')
      }
    } catch (error) {
      this.logger.error(`❌ שגיאה בשליחת תזכורת:`, error.message)
      await this.markAsFailed(reminderId, error.message)
      throw error
    }
  }

  /**
   * יצירת הודעת תזכורת מותאמת אישית
   */
  private createReminderMessage(visitorName: string, visitDate: Date): string {
    const dateStr = format(visitDate, 'EEEE, d בMMMM', { locale: he })
    const timeStr = format(visitDate, 'HH:mm')

    return `שלום ${visitorName}. זוהי תזכורת לביקור שלך המתוכנן ל${dateStr}, בשעה ${timeStr}. אנחנו מצפים לראותך. תודה ולהתראות.`
  }

  async getVisitorsWithPhone() {
    return this.prisma.visitor.findMany({
      where: { 
        phone: { not: '' },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    })
  }

  /**
   * קבלת רשימת ביקורים מתוכננים למחר
   */
  async getUpcomingVisits() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const visits = await this.prisma.visit.findMany({
      where: {
        scheduledAt: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
      },
      include: {
        visitor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    })

    return {
      count: visits.length,
      visits: visits,
    }
  }

  /**
   * שליחת תזכורות לכל הביקורים הקרובים
   */
  async sendUpcomingReminders() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const visits = await this.prisma.visit.findMany({
      where: {
        scheduledAt: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
      },
      include: {
        visitor: true,
      },
    })

    this.logger.log(`📅 נמצאו ${visits.length} ביקורים למחר`)

    const results = {
      total: visits.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
    }

    for (const visit of visits) {
      try {
        // בדיקה אם כבר נשלחה תזכורת
        const existingReminder = await this.prisma.reminderLog.findFirst({
          where: {
            userId: visit.userId,
            scheduledDate: visit.scheduledAt,
            sentAt: { not: null },
          },
        })

        if (existingReminder) {
          this.logger.log(`⏭️  תזכורת כבר נשלחה למבקר: ${visit.visitor.name}`)
          results.skipped++
          results.details.push({
            visitor: visit.visitor.name,
            status: 'skipped',
            reason: 'כבר נשלחה תזכורת',
          })
          continue
        }

        // יצירת תזכורת חדשה
        const reminder = await this.createReminder(visit.id, ReminderType.NOTIFICATION)
        
        // שליחת התזכורת
        await this.sendReminder(reminder.id)
        
        results.sent++
        results.details.push({
          visitor: visit.visitor.name,
          phone: visit.visitor.phone,
          status: 'sent',
          visitTime: visit.scheduledAt,
        })
      } catch (error) {
        this.logger.error(`❌ שגיאה בשליחת תזכורת ל-${visit.visitor.name}:`, error.message)
        results.failed++
        results.details.push({
          visitor: visit.visitor.name,
          status: 'failed',
          error: error.message,
        })
      }
    }

    this.logger.log(`✨ סיכום: נשלחו ${results.sent} מתוך ${results.total}, נכשלו ${results.failed}, דולגו ${results.skipped}`)

    return results
  }
}
