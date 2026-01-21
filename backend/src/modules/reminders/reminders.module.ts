import { Module } from '@nestjs/common'
import { RemindersService } from './reminders.service'
import { RemindersController } from './reminders.controller'
import { RemindersCronService } from './reminders-cron.service'

@Module({
  controllers: [RemindersController],
  providers: [RemindersService, RemindersCronService],
  exports: [RemindersService],
})
export class RemindersModule {}
