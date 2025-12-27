import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { SchedulesService } from './schedules.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'קבלת כל הביקורים' })
  findAll() {
    return this.schedulesService.findAll()
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'קבלת ביקורים עתידיים' })
  findUpcoming() {
    return this.schedulesService.findUpcoming()
  }

  @Get('by-date')
  @ApiOperation({ summary: 'קבלת ביקורים לפי תאריך' })
  @ApiQuery({ name: 'date', type: String, example: '2025-12-25' })
  findByDate(@Query('date') date: string) {
    return this.schedulesService.findByDate(new Date(date))
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת ביקור לפי ID' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id)
  }
}
