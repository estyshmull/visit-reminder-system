import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, Min, Max, Matches } from 'class-validator'

export class CreateScheduleDto {
  @ApiProperty({
    description: 'יום בשבוע (0=ראשון, 1=שני, 2=שלישי, 3=רביעי, 4=חמישי, 5=שישי, 6=שבת)',
    minimum: 0,
    maximum: 6,
    example: 1
  })
  @IsInt({ message: 'יום השבוע חייב להיות מספר שלם' })
  @Min(0, { message: 'יום השבוע חייב להיות בין 0 ל-6' })
  @Max(6, { message: 'יום השבוע חייב להיות בין 0 ל-6' })
  dayOfWeek: number

  @ApiProperty({
    description: 'שעת התחלה (פורמט HH:MM)',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'שעת התחלה חייבת להיות מחרוזת' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'שעת התחלה חייבת להיות בפורמט HH:MM (למשל: 09:30)'
  })
  startTime: string

  @ApiProperty({
    description: 'שעת סיום (פורמט HH:MM)',
    example: '17:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'שעת סיום חייבת להיות מחרוזת' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'שעת סיום חייבת להיות בפורמט HH:MM (למשל: 17:00)'
  })
  endTime: string
}