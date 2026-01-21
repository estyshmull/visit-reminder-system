import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateAdminDto } from './dto/create-admin.dto'
import { UpdateAdminDto } from './dto/update-admin.dto'

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  /**
   * יצירת מנהל חדש
   */
  async create(createAdminDto: CreateAdminDto) {
    // בדיקה אם שם המשתמש כבר קיים
    const existing = await this.prisma.adminUser.findUnique({
      where: { username: createAdminDto.username }
    })

    if (existing) {
      throw new ConflictException('שם המשתמש כבר קיים במערכת')
    }

    // יצירת המנהל (סיסמה כרגע ללא הצפנה)
    const admin = await this.prisma.adminUser.create({
      data: {
        username: createAdminDto.username,
        passwordHash: createAdminDto.password, // בינתיים ללא הצפנה
        fullName: createAdminDto.fullName,
      }
    })

    // החזרת התוצאה ללא הסיסמה
    return {
      id: admin.id,
      username: admin.username,
      fullName: admin.fullName,
      createdAt: admin.createdAt,
    }
  }

  /**
   * קבלת כל המנהלים (ללא סיסמאות!)
   */
  async findAll() {
    const admins = await this.prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        createdAt: true,
        // לא מחזירים את passwordHash!
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      total: admins.length,
      admins
    }
  }

  /**
   * קבלת מנהל אחד לפי ID
   */
  async findOne(id: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        createdAt: true,
      }
    })

    if (!admin) {
      throw new NotFoundException('מנהל לא נמצא')
    }

    return admin
  }

  /**
   * עדכון מנהל
   */
  async update(id: string, updateAdminDto: UpdateAdminDto) {
    // בדיקה שהמנהל קיים
    await this.findOne(id)

    // אם יש שינוי בשם משתמש - בדוק שהוא לא תפוס
    if (updateAdminDto.username) {
      const existing = await this.prisma.adminUser.findUnique({
        where: { username: updateAdminDto.username }
      })

      if (existing && existing.id !== id) {
        throw new ConflictException('שם המשתמש כבר קיים במערכת')
      }
    }

    // הכנת הדאטה לעדכון
    const dataToUpdate: any = {}

    if (updateAdminDto.username) {
      dataToUpdate.username = updateAdminDto.username
    }

    if (updateAdminDto.fullName) {
      dataToUpdate.fullName = updateAdminDto.fullName
    }

    // אם יש סיסמה חדשה - שמור אותה (בינתיים ללא הצפנה)
    if (updateAdminDto.password) {
      dataToUpdate.passwordHash = updateAdminDto.password
    }

    // עדכון במסד
    const admin = await this.prisma.adminUser.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        fullName: true,
        createdAt: true,
      }
    })

    return admin
  }

  /**
   * מחיקת מנהל
   */
  async remove(id: string) {
    // בדיקה שהמנהל קיים
    await this.findOne(id)

    // ספירת מנהלים
    const totalAdmins = await this.prisma.adminUser.count()

    // אסור למחוק את המנהל האחרון!
    if (totalAdmins <= 1) {
      throw new ConflictException('לא ניתן למחוק את המנהל האחרון במערכת')
    }

    // מחיקה
    await this.prisma.adminUser.delete({
      where: { id }
    })

    return {
      message: 'מנהל נמחק בהצלחה',
      id
    }
  }

  /**
   * חיפוש מנהל לפי שם משתמש (לצורך התחברות)
   */
  async findByUsername(username: string) {
    return this.prisma.adminUser.findUnique({
      where: { username }
    })
  }
}
