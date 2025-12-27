# Backend - Visit Reminder System

מערכת Backend מבוססת NestJS עם TypeScript, Prisma ORM ו-SQL Server.

## 🏗️ מבנה התיקיות

```
backend/
├── src/
│   ├── main.ts                 # נקודת כניסה
│   ├── app.module.ts           # מודול ראשי
│   ├── app.controller.ts       # Controller ראשי
│   ├── app.service.ts          # Service ראשי
│   │
│   ├── config/                 # קבצי הגדרות
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── reminder.config.ts
│   │
│   ├── common/                 # קוד משותף
│   │   ├── prisma/            # Prisma service
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   └── interceptors/      # Interceptors
│   │
│   └── modules/               # מודולים עסקיים
│       ├── auth/              # אימות והרשאות
│       ├── users/             # משתמשים
│       ├── elders/            # (הוסר) קשישים — המודול הוסר מהמערכת
│       ├── caregivers/        # מטפלים
│       ├── schedules/         # ביקורים מתוכננים
│       ├── reminders/         # תזכורות
│       └── reports/           # דוחות
│
├── prisma/
│   └── schema.prisma          # סכימת DB
│
└── package.json
```

## 📦 מודולים

### Auth Module
- JWT Authentication
- Login/Register endpoints
- Guards & Strategies
- Role-based access control

### Users Module
- ניהול משתמשי המערכת
- תפקידים: ADMIN, MANAGER, USER

### Elders Module (Removed)
- המערכת אינה משתמשת במודל 'Elders' — ניהול מבוצע דרך `schedules`/`visits`

### Caregivers Module
- ניהול רשימת מטפלים
- מעקב אחר זמינות

### Schedules Module
- ניהול ביקורים מתוכננים
- סטטוסים: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, MISSED
- שאילתות לפי תאריך

### Reminders Module
- תזכורות אוטומטיות
- Cron job יומי (9:00)
- שליחה ידנית
- סוגים: SMS, EMAIL, NOTIFICATION

### Reports Module
- סקירה כללית
- סטטיסטיקות חודשיות
- דוחות מטפלים
- היסטוריית ביקורים

## 🚀 הרצה

### התקנה
```bash
npm install
```

### הגדרת משתני סביבה
```bash
cp .env.example .env
# ערוך את קובץ .env עם הערכים המתאימים
```

### Prisma
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### הרצה
```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📚 API Documentation

לאחר הרצת השרת:
```
http://localhost:3001/api/docs
```

## 🔒 Authentication

כל ה-endpoints מוגנים ב-JWT למעט:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/health`

### Headers
```
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Schema

### Tables
- `users` - משתמשי המערכת (מתנדבים / אנשי צוות)
- `caregivers` - מטפלים
- `schedules` / `visits` - תורנויות וביקורים מתוזמנים
- `reminder_logs` - היסטוריית תזכורות

### Relations
- User/Caregiver → Schedule/Visit (1:N)
- Visit → ReminderLog (1:N)

## ⚙️ Environment Variables

```env
DATABASE_URL          # חיבור למסד נתונים
PORT                  # פורט השרת (3001)
JWT_SECRET            # מפתח JWT
JWT_EXPIRES_IN        # תוקף token
FRONTEND_URL          # כתובת Frontend
REMINDER_CRON_SCHEDULE # תזמון cron
ENABLE_REMINDERS      # הפעלת תזכורות
```

## 🔄 Cron Jobs

### Daily Reminders (9:00 AM)
- סריקת ביקורים למחר
- יצירת תזכורות
- שליחה אוטומטית

## 🛡️ Guards

- **JwtAuthGuard** - בדיקת JWT token
- **RolesGuard** - בדיקת הרשאות
- **LocalAuthGuard** - התחברות

## 📝 DTOs & Validation

כל ה-DTOs כוללים:
- `class-validator` decorators
- Swagger documentation
- הודעות שגיאה בעברית

## 🧪 Testing

```bash
npm run test
```

## 📄 License

MIT
