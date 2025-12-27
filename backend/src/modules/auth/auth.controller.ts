import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Public } from '../../common/decorators/public.decorator'
// import { LocalAuthGuard } from './guards/local-auth.guard'
// import { LoginDto } from './dto/login.dto'
// import { RegisterDto } from './dto/register.dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'התחברות למערכת' })
  // @UseGuards(LocalAuthGuard)
  async login(@Body() loginDto: any) {
    // TODO: Implement login
    return { message: 'Login endpoint - to be implemented' }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'רישום משתמש חדש' })
  async register(@Body() registerDto: any) {
    // TODO: Implement registration
    return { message: 'Register endpoint - to be implemented' }
  }
}
