import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateAdminDto } from './create-admin.dto'
import { IsString, IsOptional, MinLength, Matches } from 'class-validator'

export class UpdateAdminDto {
  @ApiProperty({ 
    example: 'admin1', 
    description: 'שם משתמש ייחודי למנהל',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'שם משתמש חייב להכיל לפחות 3 תווים' })
  username?: string

  @ApiProperty({ 
    example: 'NewPassword123!', 
    description: 'סיסמה חדשה (אופציונלי)',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'הסיסמה חייבת להכיל אותיות ומספרים',
  })
  password?: string

  @ApiProperty({ 
    example: 'יוסי כהן', 
    description: 'שם מלא של המנהל',
    required: false 
  })
  @IsOptional()
  @IsString()
  fullName?: string
}
