import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateVisitorDto } from './dto/create-visitor.dto'
import { UpdateVisitorDto } from './dto/update-visitor.dto'

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * יצירת מבקר חדש
   */
  async create(createVisitorDto: CreateVisitorDto) {
    // בדיקה אם הטלפון כבר קיים
    const existing = await this.prisma.visitor.findUnique({
      where: { phone: createVisitorDto.phone }
    })

    if (existing) {
      throw new ConflictException('מספר הטלפון כבר קיים במערכת')
    }

    // יצירת המבקר
    const visitor = await this.prisma.visitor.create({
      data: {
        name: createVisitorDto.name,
        phone: createVisitorDto.phone,
        email: createVisitorDto.email,
        notes: createVisitorDto.notes,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
      }
    })

    return visitor
  }

  /**
   * קבלת כל המבקרים
   */
  async findAll(filters?: { isActive?: boolean; search?: string }) {
    const where: any = {}

    // פילטר לפי סטטוס פעיל/לא פעיל
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    // חיפוש לפי שם או טלפון
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ]
    }

    const visitors = await this.prisma.visitor.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { visits: true } // ספירת ביקורים
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      total: visitors.length,
      visitors
    }
  }

  /**
   * קבלת מבקר אחד לפי ID
   */
  async findOne(id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { visits: true }
        }
      }
    })

    if (!visitor) {
      throw new NotFoundException('מבקר לא נמצא')
    }

    return visitor
  }

  /**
   * עדכון מבקר
   */
  async update(id: string, updateVisitorDto: UpdateVisitorDto) {
    // בדיקה שהמבקר קיים
    await this.findOne(id)

    // אם יש שינוי בטלפון - בדוק שהוא לא תפוס
    if (updateVisitorDto.phone) {
      const existing = await this.prisma.visitor.findUnique({
        where: { phone: updateVisitorDto.phone }
      })

      if (existing && existing.id !== id) {
        throw new ConflictException('מספר הטלפון כבר קיים במערכת')
      }
    }

    // עדכון במסד
    const visitor = await this.prisma.visitor.update({
      where: { id },
      data: updateVisitorDto,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return visitor
  }

  /**
   * מחיקת מבקר (soft delete)
   */
  async remove(id: string) {
    // בדיקה שהמבקר קיים
    await this.findOne(id)

    // Soft delete - סימון כלא פעיל
    await this.prisma.visitor.update({
      where: { id },
      data: { isActive: false }
    })

    return {
      message: 'מבקר הוסר בהצלחה (סומן כלא פעיל)',
      id
    }
  }

  /**
   * מחיקה קבועה (hard delete)
   */
  async permanentDelete(id: string) {
    // בדיקה שהמבקר קיים
    await this.findOne(id)

    // מחיקה קבועה
    await this.prisma.visitor.delete({
      where: { id }
    })

    return {
      message: 'מבקר נמחק לצמיתות',
      id
    }
  }

  /**
   * הפעלה מחדש של מבקר
   */
  async activate(id: string) {
    await this.findOne(id)

    const visitor = await this.prisma.visitor.update({
      where: { id },
      data: { isActive: true }
    })

    return {
      message: 'מבקר הופעל מחדש',
      visitor
    }
  }
}
