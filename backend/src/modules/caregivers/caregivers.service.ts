import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class CaregiversService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.caregiver.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    return this.prisma.caregiver.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
    })
  }

  async findAvailable() {
    return this.prisma.caregiver.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
    })
  }

  // TODO: Implement create, update, remove methods
}
