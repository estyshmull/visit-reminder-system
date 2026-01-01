import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class CaregiversService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
    })
  }

  async findAvailable() {
    // The schema does not have an explicit caregiver model or `isAvailable`.
    // Return active users as a proxy for available caregivers.
    return this.prisma.user.findMany({
      where: {
        isActive: true,
      },
    })
  }

  // TODO: Implement create, update, remove methods
}
