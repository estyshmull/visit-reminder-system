import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { VisitStatus } from '../../common/enums'

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.visit.findMany({
      include: { user: true },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async findUpcoming() {
    return this.prisma.visit.findMany({
      where: {
        scheduledAt: {
          gte: new Date(),
        },
      },
      include: { user: true },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async findByDate(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.prisma.visit.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { user: true },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async findOne(id: string) {
    return this.prisma.visit.findUnique({
      where: { id },
      include: { user: true },
    })
  }

  // TODO: Implement create, update, remove, complete methods
}
