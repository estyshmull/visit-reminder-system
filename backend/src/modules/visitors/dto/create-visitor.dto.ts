import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, IsBoolean } from 'class-validator'

export class CreateVisitorDto {
  @ApiProperty({ 
    example: 'משה לוי', 
    description: 'שם המבקר' 
  })
  @IsString()
  @IsNotEmpty({ message: 'שם הוא שדה חובה' })
  name: string

  @ApiProperty({ 
    example: '0501234567', 
    description: 'מספר טלפון ייחודי' 
  })
  @IsString()
  @IsNotEmpty({ message: 'טלפון הוא שדה חובה' })
  @Matches(/^05\d{8}$/, { message: 'מספר טלפון לא תקין (חייב להתחיל ב-05 ולהכיל 10 ספרות)' })
  phone: string

  @ApiProperty({ 
    example: 'moshe@example.com', 
    description: 'כתובת אימייל (אופציונלי)',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email?: string

  @ApiProperty({ 
    example: 'זמין בימי ראשון ושלישי בערב', 
    description: 'הערות נוספות (אופציונלי)',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string
}
