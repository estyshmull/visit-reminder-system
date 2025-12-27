import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemindersService } from './reminders.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

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
}
