import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * התחברות למנהל מערכת
   */
  async login(username: string, password: string) {
    // חיפוש מנהל לפי שם משתמש
    const admin = await this.prisma.adminUser.findUnique({
      where: { username }
    })

    // DEBUG - זמני לבדיקה
    console.log('🔍 Login attempt:', { username, password })
    console.log('👤 Admin found:', admin ? { id: admin.id, username: admin.username, passwordHash: admin.passwordHash } : 'null')

    // בדיקה שהמנהל קיים
    if (!admin) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים')
    }

    // בדיקת סיסמה (בינתיים ללא הצפנה)
    console.log('🔑 Password check:', { provided: password, stored: admin.passwordHash, match: admin.passwordHash === password })
    if (admin.passwordHash !== password) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים')
    }

    // יצירת JWT token
    const payload = { 
      username: admin.username, 
      sub: admin.id, 
      fullName: admin.fullName 
    }

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
      },
    }
  }

  /**
   * יצירת מנהל ראשון (setup)
   */
  async setupFirstAdmin(username: string, password: string, fullName: string) {
    // בדוק שאין מנהלים במערכת
    const existingAdmins = await this.prisma.adminUser.count()
    
    if (existingAdmins > 0) {
      throw new UnauthorizedException('כבר קיימים מנהלים במערכת')
    }

    // יצירת המנהל הראשון
    const admin = await this.prisma.adminUser.create({
      data: {
        username,
        passwordHash: password, // בינתיים ללא הצפנה
        fullName,
      }
    })

    return {
      message: 'מנהל ראשון נוצר בהצלחה',
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
      }
    }
  }
}
