# מערכת תזכורות אוטומטית לביקורי קשישים

מערכת ניהול מתקדמת לתיאום ביקורים אצל סבא וסבתא עם תזכורות אוטומטיות.

## 🎯 תכונות עיקריות

- ניהול רשימת מבקרים אצל קשיש
- תזכורות אוטומטיות לביקורים מתוכננים
- ממשק משתמש ידידותי עם תמיכה מלאה ב-RTL
- דוחות וסטטיסטיקות

## 🏗️ מבנה הפרויקט

```
visit-reminder-system/
├── frontend/          # React + TypeScript + Vite
├── backend/           # NestJS + Prisma
├── database/          # Prisma schema & migrations
└── docs/              # תיעוד
```

## 🛠️ טכנולוגיות

### Frontend
- React 18 + TypeScript
- Vite
- Material-UI v5 (תמיכה RTL)
- React Query
- React Router v6
- date-fns

### Backend
- Node.js 18+ + TypeScript
- NestJS 10
- Prisma 5
- SQL Server 2022
- node-cron
- Swagger API Documentation

## 📋 דרישות מקדימות

- Node.js 18 ומעלה
- SQL Server 2022
- npm או yarn

## 🚀 התקנה

1. שכפל את הריפו:
```bash
git clone <repository-url>
cd visit-reminder-system
```

2. התקן תלויות:
```bash
npm run install:all
```

3. הגדר משתני סביבה:
```bash
# העתק את קבצי .env.example
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# ערוך את הקבצים עם הערכים המתאימים
```

4. הגדר את המסד נתונים:
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

5. הרץ את הפרויקט:
```bash
# מהתיקייה הראשית
npm run dev
```

## 📦 סקריפטים זמינים

### Root
- `npm run install:all` - התקנת כל התלויות
- `npm run dev` - הרצת Frontend + Backend במקביל
- `npm run build` - בנייה לפרודקשן
- `npm run lint` - בדיקת קוד
- `npm run format` - עיצוב קוד

### Frontend
- `npm run dev` - הרצת dev server (port 3000)
- `npm run build` - בנייה לפרודקשן
- `npm run preview` - תצוגה מקדימה של build

### Backend
- `npm run start:dev` - הרצת dev server (port 3001)
- `npm run build` - בנייה לפרודקשן
- `npm run prisma:studio` - פתיחת Prisma Studio

## 🌐 כתובות

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## 📝 מבנה התיקיות

### Frontend
```
frontend/
├── src/
│   ├── components/    # קומפוננטות React
│   ├── pages/        # עמודים
│   ├── services/     # API calls
│   ├── hooks/        # Custom hooks
│   ├── utils/        # פונקציות עזר
│   ├── types/        # TypeScript types
│   └── App.tsx       # קומפוננטה ראשית
```

### Backend
```
backend/
├── src/
│   ├── modules/      # מודולים עסקיים
│   ├── common/       # קוד משותף
│   ├── config/       # הגדרות
│   └── main.ts       # Entry point
├── prisma/
│   ├── schema.prisma # DB schema
│   └── seed.ts       # נתוני התחלה
```

## 🔒 אבטחה

- Validation עם class-validator
- Environment variables
- CORS configuration
- SQL Injection protection (Prisma)

## 🧪 בדיקות

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## 📚 תיעוד נוסף

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./docs/API.md)

## 🤝 תרומה

נשמח לקבל תרומות! אנא צור Pull Request או פתח Issue.

## 📄 רישיון

MIT

## 👥 צוות הפיתוח

- תאריך יצירה: דצמבר 2025
- גרסה: 1.0.0
