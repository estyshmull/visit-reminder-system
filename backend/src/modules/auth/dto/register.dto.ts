import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  @IsNotEmpty({ message: 'אימייל הוא שדה חובה' })
  email: string

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'סיסמה היא שדה חובה' })
  @MinLength(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
  password: string

  @ApiProperty({ example: 'יוסי' })
  @IsString({ message: 'שם פרטי חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'שם פרטי הוא שדה חובה' })
  firstName: string

  @ApiProperty({ example: 'כהן' })
  @IsString({ message: 'שם משפחה חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'שם משפחה הוא שדה חובה' })
  lastName: string

  @ApiProperty({ example: '050-1234567', required: false })
  @IsString({ message: 'טלפון חייב להיות מחרוזת' })
  phone?: string
}
