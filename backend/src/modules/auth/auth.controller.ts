import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Public } from '../../common/decorators/public.decorator'
import { IsString, IsNotEmpty, MinLength } from 'class-validator'

class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string
}

class SetupFirstAdminDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiProperty({ example: 'אסתי אסבן' })
  @IsString()
  @IsNotEmpty()
  fullName: string
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'התחברות מנהל למערכת' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password)
  }

  @Public()
  @Post('setup-first-admin')
  @ApiOperation({ summary: 'יצירת מנהל ראשון במערכת (פעם אחת בלבד)' })
  async setupFirstAdmin(@Body() setupDto: SetupFirstAdminDto) {
    return this.authService.setupFirstAdmin(
      setupDto.username,
      setupDto.password,
      setupDto.fullName
    )
  }
}
