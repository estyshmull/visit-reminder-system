import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards 
} from '@nestjs/common'
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger'
import { AdminsService } from './admins.service'
import { CreateAdminDto } from './dto/create-admin.dto'
import { UpdateAdminDto } from './dto/update-admin.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Admins - מנהלי מערכת')
@Controller('admins')
// @UseGuards(JwtAuthGuard) // TODO: להוסיף אחר כך הרשאות
// @ApiBearerAuth()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'הוספת מנהל חדש',
    description: 'יצירת מנהל חדש עם שם משתמש, סיסמה ושם מלא. הסיסמה תוצפן אוטומטית.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'המנהל נוצר בהצלחה',
    schema: {
      example: {
        id: 'uuid-123',
        username: 'admin1',
        fullName: 'יוסי כהן',
        createdAt: '2026-01-18T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'שם המשתמש כבר קיים' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto)
  }

  @Get()
  @ApiOperation({ 
    summary: 'קבלת רשימת כל המנהלים',
    description: 'מחזיר רשימה של כל מנהלי המערכת (ללא סיסמאות)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'רשימת המנהלים',
    schema: {
      example: {
        total: 2,
        admins: [
          {
            id: 'uuid-123',
            username: 'admin1',
            fullName: 'יוסי כהן',
            createdAt: '2026-01-18T10:00:00.000Z'
          },
          {
            id: 'uuid-456',
            username: 'admin2',
            fullName: 'רחל לוי',
            createdAt: '2026-01-17T15:30:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async findAll() {
    return this.adminsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'קבלת מנהל לפי ID',
    description: 'מחזיר פרטי מנהל ספציפי לפי מזהה ייחודי'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'פרטי המנהל',
    schema: {
      example: {
        id: 'uuid-123',
        username: 'admin1',
        fullName: 'יוסי כהן',
        createdAt: '2026-01-18T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'מנהל לא נמצא' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'עדכון מנהל',
    description: 'עדכון פרטי מנהל קיים. ניתן לעדכן שם משתמש, שם מלא או סיסמה'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'המנהל עודכן בהצלחה',
    schema: {
      example: {
        id: 'uuid-123',
        username: 'admin1_updated',
        fullName: 'יוסי כהן',
        createdAt: '2026-01-18T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'מנהל לא נמצא' })
  @ApiResponse({ status: 409, description: 'שם המשתמש כבר קיים' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async update(
    @Param('id') id: string, 
    @Body() updateAdminDto: UpdateAdminDto
  ) {
    return this.adminsService.update(id, updateAdminDto)
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'מחיקת מנהל',
    description: 'מחיקת מנהל מהמערכת. לא ניתן למחוק את המנהל האחרון!'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'המנהל נמחק בהצלחה',
    schema: {
      example: {
        message: 'מנהל נמחק בהצלחה',
        id: 'uuid-123'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'מנהל לא נמצא' })
  @ApiResponse({ status: 409, description: 'לא ניתן למחוק את המנהל האחרון' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async remove(@Param('id') id: string) {
    return this.adminsService.remove(id)
  }
}
