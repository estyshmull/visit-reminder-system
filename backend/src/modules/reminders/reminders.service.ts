import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { ReminderStatus, ReminderType } from '@prisma/client'

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reminder.findMany({
      include: {
        visit: {
          include: {
            caregiver: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPending() {
    return this.prisma.reminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
      },
      include: {
        visit: {
          include: {
            caregiver: true,
          },
        },
      },
    })
  }

  async createReminder(visitId: string, type: ReminderType) {
    return this.prisma.reminder.create({
      data: {
        visitId,
        type,
        status: ReminderStatus.PENDING,
      },
    })
  }

  async markAsSent(id: string) {
    return this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
      },
    })
  }

  async markAsFailed(id: string, error: string) {
    return this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.FAILED,
        error,
      },
    })
  }

  // TODO: Implement actual sending logic (SMS, Email, etc.)
  async sendReminder(reminderId: string) {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        visit: {
          include: {
            caregiver: true,
          },
        },
      },
    })

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    // TODO: Implement actual sending logic based on reminder.type
    console.log(`📧 שליחת תזכורת: ${reminder.type} לביקור ${reminder.visit.id}`)

    return this.markAsSent(reminderId)
  }
}
