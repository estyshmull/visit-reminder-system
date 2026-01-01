import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../common/prisma/prisma.service'
import { RemindersService } from './reminders.service'
import { VisitStatus, ReminderType } from '../../common/enums'
import { addDays, startOfDay } from 'date-fns'

@Injectable()
export class RemindersCronService {
  private readonly logger = new Logger(RemindersCronService.name)

  constructor(
    private prisma: PrismaService,
    private remindersService: RemindersService,
  ) {}

  // Run every day at 9:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyReminders() {
    this.logger.log('🔄 התחלת סריקה לתזכורות יומיות...')

    try {
      // Find visits scheduled for tomorrow
      const tomorrow = addDays(startOfDay(new Date()), 1)
      const endOfTomorrow = addDays(tomorrow, 1)

      const upcomingVisits = await this.prisma.visit.findMany({
        where: {
          scheduledAt: {
            gte: tomorrow,
            lt: endOfTomorrow,
          },
        },
        include: { user: true },
      })

      this.logger.log(`📅 נמצאו ${upcomingVisits.length} ביקורים למחר`)

      // Create and send reminders
      for (const visit of upcomingVisits) {
        // Check if a reminder log exists for this user+date and whether it was sent
        const existing = await this.prisma.reminderLog.findFirst({
          where: {
            userId: visit.userId,
            scheduledDate: visit.scheduledAt,
          },
        })

        const hasReminder = existing && existing.sentAt !== null

        if (!hasReminder) {
          const reminder = await this.remindersService.createReminder(
            visit.id,
            ReminderType.NOTIFICATION,
          )

          await this.remindersService.sendReminder(reminder.id)
          this.logger.log(`✅ נשלחה תזכורת לביקור: ${visit.id}`)
        }
      }

      this.logger.log('✨ סיום סריקת תזכורות יומיות')
    } catch (error) {
      this.logger.error('❌ שגיאה בשליחת תזכורות:', error)
    }
  }
}
