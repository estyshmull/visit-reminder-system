import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { VisitStatus } from '@prisma/client'
import { startOfMonth, endOfMonth } from 'date-fns'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalCaregivers, totalVisits, pendingVisits] = await Promise.all([
      this.prisma.caregiver.count({ where: { isActive: true } }),
      this.prisma.visit.count(),
      this.prisma.visit.count({ where: { status: VisitStatus.SCHEDULED } }),
    ])

    return {
      totalCaregivers,
      totalVisits,
      pendingVisits,
    }
  }

  async getMonthlyStats(year: number, month: number) {
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(startDate)

    const visits = await this.prisma.visit.groupBy({
      by: ['status'],
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    })

    return {
      period: { year, month, startDate, endDate },
      visitsByStatus: visits.map(v => ({
        status: v.status,
        count: v._count,
      })),
    }
  }

  async getCaregiverStats() {
    const caregivers = await this.prisma.caregiver.findMany({
      where: { isActive: true },
      include: {
        visits: {
          where: {
            status: VisitStatus.COMPLETED,
          },
        },
      },
    })

    return caregivers.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      completedVisits: c.visits.length,
      isAvailable: c.isAvailable,
    }))
  }

  // Elder-specific history removed — system no longer models multiple elders.

  // TODO: Add more report methods
}
