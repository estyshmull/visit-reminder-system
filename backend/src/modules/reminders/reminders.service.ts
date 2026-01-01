import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { ReminderStatus, ReminderType } from '../../common/enums'

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Use ReminderLog model from schema
    return this.prisma.reminderLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPending() {
    return this.prisma.reminderLog.findMany({
      where: { status: ReminderStatus.PENDING },
      include: { user: true },
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

  // TODO: Implement actual sending logic (SMS, Email, etc.)
  async sendReminder(reminderId: string) {
    const reminder = await this.prisma.reminderLog.findUnique({
      where: { id: reminderId },
      include: { user: true },
    })

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    // TODO: Implement actual sending logic based on reminder.type
    console.log(`📧 שליחת תזכורת ל־user ${reminder.userId} (reminder ${reminder.id})`)

    return this.markAsSent(reminderId)
  }
}
