import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator'

export class CreateAdminDto {
  @ApiProperty({ 
    example: 'admin1', 
    description: 'שם משתמש ייחודי למנהל' 
  })
  @IsString()
  @IsNotEmpty({ message: 'שם משתמש הוא שדה חובה' })
  @MinLength(3, { message: 'שם משתמש חייב להכיל לפחות 3 תווים' })
  username: string

  @ApiProperty({ 
    example: 'Admin123!', 
    description: 'סיסמה חזקה (לפחות 8 תווים, אותיות ומספרים)' 
  })
  @IsString()
  @IsNotEmpty({ message: 'סיסמה היא שדה חובה' })
  @MinLength(8, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'הסיסמה חייבת להכיל אותיות ומספרים',
  })
  password: string

  @ApiProperty({ 
    example: 'יוסי כהן', 
    description: 'שם מלא של המנהל' 
  })
  @IsString()
  @IsNotEmpty({ message: 'שם מלא הוא שדה חובה' })
  fullName: string
}
