import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../../common/enums'

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'סקירה כללית של המערכת' })
  getOverview() {
    return this.reportsService.getOverview()
  }

  @Get('monthly')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'סטטיסטיקות חודשיות' })
  @ApiQuery({ name: 'year', type: Number, example: 2025 })
  @ApiQuery({ name: 'month', type: Number, example: 12 })
  getMonthlyStats(@Query('year') year: string, @Query('month') month: string) {
    return this.reportsService.getMonthlyStats(parseInt(year), parseInt(month))
  }

  @Get('caregivers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'סטטיסטיקות מטפלים' })
  getCaregiverStats() {
    return this.reportsService.getCaregiverStats()
  }

}
