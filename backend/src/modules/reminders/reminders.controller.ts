import { Controller, Get, Param, Post, UseGuards, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemindersService } from './reminders.service'
import { YemotService } from './yemot.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly yemotService: YemotService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'קבלת כל התזכורות' })
  findAll() {
    return this.remindersService.findAll()
  }

  @Get('pending')
  @ApiOperation({ summary: 'קבלת תזכורות ממתינות' })
  findPending() {
    return this.remindersService.findPending()
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'שליחת תזכורת ידנית' })
  send(@Param('id') id: string) {
    return this.remindersService.sendReminder(id)
  }

  @Public()
  @Get('debug/env')
  @ApiOperation({ summary: 'הצגת משתני סביבה של ימות המשיח (לבדיקה)' })
  getEnvDebug() {
    return {
      YEMOT_PHONE: process.env.YEMOT_PHONE,
      YEMOT_PASSWORD: process.env.YEMOT_PASSWORD ? 'SET' : 'NOT_SET',
      YEMOT_API_BASE: process.env.YEMOT_API_BASE,
      NODE_ENV: process.env.NODE_ENV,
    }
  }

  @Public()
  @Get('yemot/config')
  @ApiOperation({ summary: 'הצגת קונפיגורציית ימות המשיח (לבדיקה)' })
  getYemotConfig() {
    return {
      phone: this.yemotService['phone'] ? '***' + this.yemotService['phone'].substring(this.yemotService['phone'].length-3) : 'NOT_SET',
      password: this.yemotService['password'] ? 'SET' : 'NOT_SET',
      apiBaseUrl: this.yemotService['apiBaseUrl'],
    }
  }

  @Public()
  @Get('yemot/test')
  @ApiOperation({ summary: 'בדיקת חיבור לימות המשיח' })
  testYemotConnection() {
    return this.yemotService.testConnection()
  }

  @Public()
  @Get('yemot/test-detailed')
  @ApiOperation({ summary: 'בדיקת חיבור מפורטת עם פרטי הבקשה' })
  async testYemotDetailed() {
    return this.yemotService.testConnectionDetailed()
  }

  @Public()
  @Post('yemot/test-voice')
  @ApiOperation({ summary: 'שליחת הודעה קולית לבדיקה' })
  testVoiceMessage(@Body() body: { phoneNumber: string; message?: string }) {
    const message = body.message || 'זוהי הודעת בדיקה מהמערכת. תודה ולהתראות.'
    return this.yemotService.sendVoiceMessage({
      phoneNumber: body.phoneNumber,
      message: message,
    })
  }

  @Get('visitors-with-phone')
  @ApiOperation({ summary: 'קבלת רשימת מבקרים עם מספר טלפון' })
  async getVisitorsWithPhone() {
    // נעזור לראות איך המספרים נשמרים במערכת
    const visitors = await this.remindersService.getVisitorsWithPhone()
    return visitors
  }

  @Post('send-upcoming-reminders')
  @ApiOperation({ summary: 'שליחת תזכורות לכל הביקורים הקרובים (למחר)' })
  async sendUpcomingReminders() {
    return this.remindersService.sendUpcomingReminders()
  }

  @Get('upcoming-visits')
  @ApiOperation({ summary: 'קבלת רשימת ביקורים מתוכננים למחר' })
  async getUpcomingVisits() {
    return this.remindersService.getUpcomingVisits()
  }
}
