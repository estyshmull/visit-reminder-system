import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  @IsNotEmpty({ message: 'אימייל הוא שדה חובה' })
  email: string

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'סיסמה היא שדה חובה' })
  @MinLength(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
  password: string
}
