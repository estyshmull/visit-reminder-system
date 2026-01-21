import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsString, Matches } from 'class-validator'

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'תאריך לבדיקה (פורמט YYYY-MM-DD)',
    example: '2026-01-15'
  })
  @IsDateString({}, { message: 'תאריך חייב להיות בפורמט YYYY-MM-DD' })
  date: string

  @ApiProperty({
    description: 'שעת התחלה (פורמט HH:MM)',
    example: '10:00'
  })
  @IsString({ message: 'שעת התחלה חייבת להיות מחרוזת' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'שעת התחלה חייבת להיות בפורמט HH:MM'
  })
  startTime: string

  @ApiProperty({
    description: 'שעת סיום (פורמט HH:MM)',
    example: '11:00'
  })
  @IsString({ message: 'שעת סיום חייבת להיות מחרוזת' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'שעת סיום חייבת להיות בפורמט HH:MM'
  })
  endTime: string
}