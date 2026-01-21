import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    // Development helper: disable auth entirely when DISABLE_AUTH=true
    if (process.env.DISABLE_AUTH === 'true') {
      const req = context.switchToHttp().getRequest()
      // Inject a fake admin user so RolesGuard also passes for protected endpoints
      req.user = { id: 'dev-user', role: 'ADMIN' }
      return true
    }

    return super.canActivate(context)
  }
}
