import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { SchedulesService } from './schedules.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { CheckAvailabilityDto } from './dto/check-availability.dto'

@ApiTags('Schedules - לוחות זמנים')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'יצירת לוח זמנים חדש' })
  @ApiResponse({ status: 201, description: 'לוח הזמנים נוצר בהצלחה' })
  @ApiResponse({ status: 400, description: 'נתונים לא תקינים' })
  @ApiResponse({ status: 409, description: 'כבר קיים לוח זמנים לאותו יום' })
  create(@Request() req: any, @Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(req.user.id, createScheduleDto)
  }

  @Get()
  @ApiOperation({ summary: 'קבלת לוחות הזמנים של המשתמש המחובר' })
  @ApiResponse({ status: 200, description: 'רשימת לוחות זמנים' })
  findMySchedules(@Request() req: any) {
    return this.schedulesService.findAllByUser(req.user.id)
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'בדיקת זמינות במועד מסוים' })
  @ApiResponse({ status: 200, description: 'תוצאת בדיקת הזמינות' })
  async checkAvailability(@Request() req: any, @Query() checkAvailabilityDto: CheckAvailabilityDto) {
    const date = new Date(checkAvailabilityDto.date)
    return this.schedulesService.checkAvailability(
      req.user.id,
      date,
      checkAvailabilityDto.startTime,
      checkAvailabilityDto.endTime
    )
  }

  // ---- Visits endpoints (זמני - עד שניצור visits module) ----
  
  @Get('visits')
  @ApiOperation({ summary: 'קבלת כל הביקורים' })
  findAll() {
    return this.schedulesService.findAll()
  }

  @Get('visits/upcoming')
  @ApiOperation({ summary: 'קבלת ביקורים עתידיים' })
  findUpcoming() {
    return this.schedulesService.findUpcoming()
  }

  @Get('visits/by-date')
  @ApiOperation({ summary: 'קבלת ביקורים לפי תאריך' })
  @ApiQuery({ name: 'date', type: String, example: '2025-12-25' })
  findByDate(@Query('date') date: string) {
    return this.schedulesService.findByDate(new Date(date))
  }

  @Get('visits/:id')
  @ApiOperation({ summary: 'קבלת ביקור לפי ID' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id)
  }
}
