import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsEmail, Matches, IsBoolean } from 'class-validator'

export class UpdateVisitorDto {
  @ApiProperty({ 
    example: 'משה לוי', 
    description: 'שם המבקר',
    required: false 
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ 
    example: '0501234567', 
    description: 'מספר טלפון ייחודי',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Matches(/^05\d{8}$/, { message: 'מספר טלפון לא תקין (חייב להתחיל ב-05 ולהכיל 10 ספרות)' })
  phone?: string

  @ApiProperty({ 
    example: 'moshe@example.com', 
    description: 'כתובת אימייל',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email?: string

  @ApiProperty({ 
    example: 'זמין בימי ראשון ושלישי בערב', 
    description: 'הערות נוספות',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ 
    example: true, 
    description: 'האם המבקר פעיל',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
