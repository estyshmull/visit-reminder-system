import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'מערכת תזכורות ביקורים פועלת תקין',
      timestamp: new Date().toISOString(),
    }
  }
}
