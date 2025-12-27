import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CaregiversService } from './caregivers.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Caregivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('caregivers')
export class CaregiversController {
  constructor(private readonly caregiversService: CaregiversService) {}

  @Get()
  @ApiOperation({ summary: 'קבלת כל המטפלים' })
  findAll() {
    return this.caregiversService.findAll()
  }

  @Get('available')
  @ApiOperation({ summary: 'קבלת מטפלים זמינים' })
  findAvailable() {
    return this.caregiversService.findAvailable()
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת מטפל לפי ID' })
  findOne(@Param('id') id: string) {
    return this.caregiversService.findOne(id)
  }
}
