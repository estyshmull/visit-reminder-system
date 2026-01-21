import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * יצירת לוח זמנים חדש למשתמש
   */
  async create(userId: string, createScheduleDto: CreateScheduleDto) {
    try {
      // 1. בדיקה שהמבקר קיים
      const visitor = await this.prisma.visitor.findUnique({
        where: { id: userId }
      })

      if (!visitor) {
        throw new NotFoundException('מבקר לא נמצא')
      }

      // 2. validate שהשעות תקינות (startTime < endTime)
      const startHour = this.timeToMinutes(createScheduleDto.startTime)
      const endHour = this.timeToMinutes(createScheduleDto.endTime)

      if (startHour >= endHour) {
        throw new BadRequestException('שעת התחלה חייבת להיות לפני שעת הסיום')
      }

      // 3. בדיקה שאין כבר לוח זמנים לאותו יום
      const existingSchedule = await this.prisma.visitor.findFirst({
        where: {
          id: userId,
          scheduleType: 'MANUAL',
          dayOfWeek: createScheduleDto.dayOfWeek
        }
      })

      if (existingSchedule) {
        throw new ConflictException(`כבר קיים לוח זמנים ליום ${this.getDayName(createScheduleDto.dayOfWeek)}`)
      }

      // 4. יצירת לוח הזמנים - עדכון המבקר
      const updatedVisitor = await this.prisma.visitor.update({
        where: { id: userId },
        data: {
          scheduleType: 'MANUAL',
          dayOfWeek: createScheduleDto.dayOfWeek,
          // נשמור בהערות את השעות
          notes: `${createScheduleDto.startTime}-${createScheduleDto.endTime}`
        },
        select: {
          id: true,
          name: true,
          email: true,
          scheduleType: true,
          dayOfWeek: true,
          notes: true
        }
      })

      return {
        id: `${userId}-${createScheduleDto.dayOfWeek}`,
        userId: updatedVisitor.id,
        dayOfWeek: createScheduleDto.dayOfWeek,
        startTime: createScheduleDto.startTime,
        endTime: createScheduleDto.endTime,
        dayName: this.getDayName(createScheduleDto.dayOfWeek),
        visitor: updatedVisitor
      }

    } catch (error) {
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof ConflictException) {
        throw error
      }
      throw new BadRequestException('שגיאה ביצירת לוח הזמנים')
    }
  }

  /**
   * קבלת כל לוחות הזמנים של משתמש
   */
  async findAllByUser(userId: string) {
    try {
      // בדיקה שהמבקר קיים
      const visitor = await this.prisma.visitor.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          scheduleType: true,
          dayOfWeek: true,
          notes: true
        }
      })

      if (!visitor) {
        throw new NotFoundException('מבקר לא נמצא')
      }

      // אם יש לוח זמנים מוגדר
      if (visitor.dayOfWeek !== null && visitor.notes) {
        const [startTime, endTime] = visitor.notes.split('-')
        return [{
          id: `${userId}-${visitor.dayOfWeek}`,
          userId: visitor.id,
          dayOfWeek: visitor.dayOfWeek,
          startTime: startTime || '09:00',
          endTime: endTime || '17:00',
          dayName: this.getDayName(visitor.dayOfWeek),
          visitor
        }]
      }

      return []

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('שגיאה בקבלת לוחות הזמנים')
    }
  }

  /**
   * בדיקת זמינות משתמש בתאריך ושעה מסוימים
   */
  async checkAvailability(
    userId: string, 
    date: Date, 
    startTime: string, 
    endTime: string
  ): Promise<{ available: boolean; reason?: string }> {
    try {
      // 1. בדיקה שהמבקר קיים
      const visitor = await this.prisma.visitor.findUnique({
        where: { id: userId }
      })

      if (!visitor) {
        return { available: false, reason: 'מבקר לא נמצא' }
      }

      // 2. חישוב יום בשבוע (0=ראשון, 1=שני וכו')
      const dayOfWeek = date.getDay()

      // 3. בדיקה שיש לוח זמנים ליום זה
      if (visitor.dayOfWeek !== dayOfWeek || !visitor.notes) {
        return { 
          available: false, 
          reason: `אין לוח זמנים מוגדר ליום ${this.getDayName(dayOfWeek)}` 
        }
      }

      // 4. בדיקה שהשעות בטווח של לוח הזמנים
      const [scheduleStart, scheduleEnd] = visitor.notes.split('-')
      const requestStartMinutes = this.timeToMinutes(startTime)
      const requestEndMinutes = this.timeToMinutes(endTime)
      const scheduleStartMinutes = this.timeToMinutes(scheduleStart || '09:00')
      const scheduleEndMinutes = this.timeToMinutes(scheduleEnd || '17:00')

      if (requestStartMinutes < scheduleStartMinutes || requestEndMinutes > scheduleEndMinutes) {
        return {
          available: false,
          reason: `השעות המבוקשות (${startTime}-${endTime}) לא בטווח לוח הזמנים (${scheduleStart}-${scheduleEnd})`
        }
      }

      // 5. בדיקה שאין ביקור חופף באותו זמן
      const conflictingVisit = await this.prisma.visit.findFirst({
        where: {
          userId: userId,
          scheduledAt: {
            gte: new Date(date.toDateString()),
            lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000)
          },
          // נניח שיש שדה position שמכיל את השעה
          position: {
            gte: this.timeToMinutes(startTime),
            lt: this.timeToMinutes(endTime)
          }
        }
      })

      if (conflictingVisit) {
        return {
          available: false,
          reason: `יש ביקור קיים באותו זמן`
        }
      }

      return { available: true }

    } catch (error) {
      return { available: false, reason: 'שגיאה בבדיקת הזמינות' }
    }
  }

  // ---------- פונקציות עזר ----------

  /**
   * המרת זמן מ-HH:MM לדקות
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10))
    return hours * 60 + minutes
  }

  /**
   * קבלת שם היום בעברית
   */
  private getDayName(dayOfWeek: number): string {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    return days[dayOfWeek] || 'לא מוכר'
  }

  // ---- Visits מתוך הקובץ המקורי (זמנית) ----
  
  async findAll() {
    return this.prisma.visit.findMany({
      include: { visitor: true },
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
      include: { visitor: true },
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
      include: { visitor: true },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async findOne(id: string) {
    return this.prisma.visit.findUnique({
      where: { id },
      include: { visitor: true },
    })
  }
}
