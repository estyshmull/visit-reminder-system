import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { ReminderStatus, ReminderType } from '../../common/enums'

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name)

  constructor(
    private prisma: PrismaService,
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

  // שליחת תזכורת - להוסיף אינטגרציה עם שירות תזכורות בעתיד
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

    // TODO: להוסיף אינטגרציה עם שירות תזכורות (SMS/Voice/Email)
    this.logger.log(`📞 תזכורת למבקר: ${reminder.visitor.name}`)
    
    // לעת עתה רק נסמן את התזכורת כנשלחה
    await this.markAsSent(reminderId)
    
    return {
      success: true,
      message: 'תזכורת נרשמה (ממתין לאינטגרציה)',
      data: { reminderId, visitor: reminder.visitor.name },
    }
  }
}
