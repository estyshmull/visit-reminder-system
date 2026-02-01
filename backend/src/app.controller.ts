import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return this.appService.getHealth()
  }

  @Get()
  @ApiOperation({ summary: 'Default endpoint' })
  getDefault() {
    return { message: 'Welcome to the Visit Reminder System API!' }
  }
}
