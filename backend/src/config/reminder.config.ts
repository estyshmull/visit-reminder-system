import { registerAs } from '@nestjs/config'

export default registerAs('reminder', () => ({
  cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *',
  enableReminders: process.env.ENABLE_REMINDERS === 'true',
}))
