import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './modules/auth/auth.module'
import { AdminsModule } from './modules/admins/admins.module'
import { VisitorsModule } from './modules/visitors/visitors.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { RemindersModule } from './modules/reminders/reminders.module'
import { ReportsModule } from './modules/reports/reports.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import yemotConfig from './config/yemot.config'

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [yemotConfig],
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,        // התחברות מנהל
    AdminsModule,      // ניהול מנהלים
    VisitorsModule,    // ניהול מבקרים
    SchedulesModule,   // ניהול ביקורים מתוזמנים
    RemindersModule,   // תזכורות אוטומטיות
    ReportsModule,     // דוחות
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
