import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { VisitStatus } from '../../common/enums'
import { startOfMonth, endOfMonth } from 'date-fns'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    // ספירת מבקרים פעילים
    const [totalVisitors, totalVisits, pendingVisits] = await Promise.all([
      this.prisma.visitor.count({ where: { isActive: true } }),
      this.prisma.visit.count(),
      // Count upcoming visits (scheduled in the future) as "pending"
      this.prisma.visit.count({ where: { scheduledAt: { gte: new Date() } } }),
    ])

    return { totalVisitors, totalVisits, pendingVisits }
  }

  async getMonthlyStats(year: number, month: number) {
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(startDate)
    // For SQL Server schema without a visit status, return simple counts.
    const total = await this.prisma.visit.count({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    return { period: { year, month, startDate, endDate }, totalVisits: total }
  }

  async getVisitorStats() {
    // סטטיסטיקות מבקרים
    const visitors = await this.prisma.visitor.findMany({
      where: { isActive: true },
      include: {
        visits: true,
      },
    })

    const now = new Date()
    return visitors.map((v: any) => ({
      id: v.id,
      name: v.name,
      completedVisits: v.visits.filter((visit: any) => visit.scheduledAt < now).length,
      isAvailable: true,
    }))
  }

  // Elder-specific history removed — system no longer models multiple elders.

  // TODO: Add more report methods
}
