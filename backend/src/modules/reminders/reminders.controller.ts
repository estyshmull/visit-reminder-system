import { Controller, Get, Param, Post, UseGuards, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemindersService } from './reminders.service'
import { YemotService } from './yemot.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

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

  @Get('test-yemot')
  @ApiOperation({ summary: 'בדיקת חיבור ל-Yemot' })
  async testYemot() {
    return this.yemotService.testConnection()
  }

  @Post('test-call')
  @ApiOperation({ summary: 'שליחת שיחת בדיקה ל-Yemot' })
  async sendTestCall(@Body() body: { phone: string; message: string }) {
    const { phone, message } = body
    if (!phone) {
      return { success: false, error: 'phone is required' }
    }
    if (!message) {
      return { success: false, error: 'message is required' }
    }

    return this.yemotService.sendTestCall(phone, message)
  }
}
