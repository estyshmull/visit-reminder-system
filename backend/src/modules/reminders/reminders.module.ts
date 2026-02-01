import { Module } from '@nestjs/common'
import { RemindersService } from './reminders.service'
import { RemindersController } from './reminders.controller'
import { RemindersCronService } from './reminders-cron.service'
import { YemotService } from './yemot.service'
import { PrismaModule } from '../../common/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersCronService, YemotService],
  exports: [RemindersService, YemotService],
})
export class RemindersModule {}
