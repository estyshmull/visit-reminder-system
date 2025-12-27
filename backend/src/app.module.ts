import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { CaregiversModule } from './modules/caregivers/caregivers.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { RemindersModule } from './modules/reminders/reminders.module'
import { ReportsModule } from './modules/reports/reports.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CaregiversModule,
    SchedulesModule,
    RemindersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
