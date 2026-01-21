import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  UseGuards,
  ParseBoolPipe
} from '@nestjs/common'
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger'
import { VisitorsService } from './visitors.service'
import { CreateVisitorDto } from './dto/create-visitor.dto'
import { UpdateVisitorDto } from './dto/update-visitor.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Visitors - מבקרים')
@Controller('visitors')
// @UseGuards(JwtAuthGuard) // TODO: להוסיף אחר כך הרשאות
// @ApiBearerAuth()
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'הוספת מבקר חדש',
    description: 'יצירת מבקר חדש עם שם, טלפון והערות. מבקרים לא יכולים להתחבר למערכת.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'המבקר נוצר בהצלחה',
    schema: {
      example: {
        id: 'uuid-123',
        name: 'משה לוי',
        phone: '0501234567',
        email: 'moshe@example.com',
        notes: 'זמין בימי ראשון ושלישי',
        isActive: true,
        createdAt: '2026-01-18T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'מספר הטלפון כבר קיים' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async create(@Body() createVisitorDto: CreateVisitorDto) {
    return this.visitorsService.create(createVisitorDto)
  }

  @Get()
  @ApiOperation({ 
    summary: 'קבלת רשימת כל המבקרים',
    description: 'מחזיר רשימה של כל המבקרים עם אפשרות לסינון'
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'סינון לפי סטטוס פעיל/לא פעיל' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'חיפוש לפי שם או טלפון' })
  @ApiResponse({ 
    status: 200, 
    description: 'רשימת המבקרים',
    schema: {
      example: {
        total: 2,
        visitors: [
          {
            id: 'uuid-123',
            name: 'משה לוי',
            phone: '0501234567',
            email: 'moshe@example.com',
            notes: 'זמין בימי ראשון',
            isActive: true,
            createdAt: '2026-01-18T10:00:00.000Z',
            _count: { visits: 5 }
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {}
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true'
    }
    
    if (search) {
      filters.search = search
    }

    return this.visitorsService.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'קבלת מבקר לפי ID',
    description: 'מחזיר פרטי מבקר ספציפי לפי מזהה ייחודי'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'פרטי המבקר',
    schema: {
      example: {
        id: 'uuid-123',
        name: 'משה לוי',
        phone: '0501234567',
        email: 'moshe@example.com',
        notes: 'זמין בימי ראשון',
        isActive: true,
        createdAt: '2026-01-18T10:00:00.000Z',
        updatedAt: '2026-01-18T10:00:00.000Z',
        _count: { visits: 5 }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'מבקר לא נמצא' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'עדכון מבקר',
    description: 'עדכון פרטי מבקר קיים'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'המבקר עודכן בהצלחה'
  })
  @ApiResponse({ status: 404, description: 'מבקר לא נמצא' })
  @ApiResponse({ status: 409, description: 'מספר הטלפון כבר קיים' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async update(
    @Param('id') id: string, 
    @Body() updateVisitorDto: UpdateVisitorDto
  ) {
    return this.visitorsService.update(id, updateVisitorDto)
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'מחיקת מבקר (Soft Delete)',
    description: 'סימון מבקר כלא פעיל (לא מוחק לצמיתות)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'המבקר הוסר בהצלחה',
    schema: {
      example: {
        message: 'מבקר הוסר בהצלחה (סומן כלא פעיל)',
        id: 'uuid-123'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'מבקר לא נמצא' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async remove(@Param('id') id: string) {
    return this.visitorsService.remove(id)
  }

  @Delete(':id/permanent')
  @ApiOperation({ 
    summary: 'מחיקה קבועה של מבקר',
    description: 'מחיקת מבקר לצמיתות מהמערכת (שימוש זהיר!)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'המבקר נמחק לצמיתות'
  })
  @ApiResponse({ status: 404, description: 'מבקר לא נמצא' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async permanentDelete(@Param('id') id: string) {
    return this.visitorsService.permanentDelete(id)
  }

  @Patch(':id/activate')
  @ApiOperation({ 
    summary: 'הפעלה מחדש של מבקר',
    description: 'הפעלת מבקר שהיה לא פעיל'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'המבקר הופעל מחדש'
  })
  @ApiResponse({ status: 404, description: 'מבקר לא נמצא' })
  @ApiResponse({ status: 401, description: 'לא מורשה - נדרשת התחברות' })
  async activate(@Param('id') id: string) {
    return this.visitorsService.activate(id)
  }
}
