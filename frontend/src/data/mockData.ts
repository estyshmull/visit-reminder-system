// נתונים לדוגמה לבדיקות
import { Visitor, Visit, Reminder, ActivityDataPoint } from '../types';

// נתוני פעילות לדוגמה לגרפים
const generateActivityData = (months: number, baseVisits: number): ActivityDataPoint[] => {
  const data: ActivityDataPoint[] = [];
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const currentMonth = new Date().getMonth();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const variance = Math.floor(Math.random() * 3) - 1; // -1, 0, או 1
    data.push({
      month: `${monthNames[monthIndex]} ${new Date().getFullYear()}`,
      visits: Math.max(0, baseVisits + variance)
    });
  }
  
  return data;
};

export const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'מרים כהן',
    phone: '050-1234567',
    email: 'miriam.cohen@example.com',
    status: 'active',
    lastVisit: new Date('2026-01-15'),
    visitsLastMonth: 4,
    frequency: {
      type: 'weekly',
      description: 'פעם בשבוע'
    },
    activityData: generateActivityData(6, 4),
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2026-01-15')
  },
  {
    id: '2',
    name: 'דוד לוי',
    phone: '052-9876543',
    email: 'david.levi@example.com',
    status: 'active',
    lastVisit: new Date('2026-01-12'),
    visitsLastMonth: 2,
    frequency: {
      type: 'biweekly',
      description: 'פעם בשבועיים'
    },
    activityData: generateActivityData(6, 2),
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2026-01-12')
  },
  {
    id: '3',
    name: 'שרה גולדברג',
    phone: '054-5555555',
    status: 'inactive',
    lastVisit: new Date('2025-11-20'),
    visitsLastMonth: 0,
    frequency: {
      type: 'none',
      description: 'ללא תדירות קבועה'
    },
    activityData: generateActivityData(6, 0),
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-11-20')
  },
  {
    id: '4',
    name: 'יוסף דהן',
    phone: '050-7777777',
    email: 'yosef.dahan@example.com',
    status: 'active',
    lastVisit: new Date('2026-01-18'),
    visitsLastMonth: 3,
    frequency: {
      type: 'monthly',
      description: '2-3 פעמים בחודש'
    },
    activityData: generateActivityData(6, 3),
    createdAt: new Date('2025-04-05'),
    updatedAt: new Date('2026-01-18')
  },
  {
    id: '5',
    name: 'רחל אברהם',
    phone: '053-1111111',
    status: 'active',
    lastVisit: new Date('2026-01-10'),
    visitsLastMonth: 1,
    frequency: {
      type: 'irregular',
      description: 'לא קבועה, לפי צורך'
    },
    activityData: generateActivityData(6, 1),
    createdAt: new Date('2025-09-12'),
    updatedAt: new Date('2026-01-10')
  },
  {
    id: '6',
    name: 'אברהם מזרחי',
    phone: '050-2222222',
    email: 'avraham.mizrahi@example.com',
    status: 'inactive',
    lastVisit: new Date('2025-12-05'),
    visitsLastMonth: 0,
    frequency: {
      type: 'none',
      description: 'הפסיק להגיע'
    },
    activityData: generateActivityData(6, 0),
    createdAt: new Date('2025-02-18'),
    updatedAt: new Date('2025-12-05')
  },
  {
    id: '7',
    name: 'עדנה שמעון',
    phone: '052-3333333',
    status: 'active',
    lastVisit: new Date('2026-01-16'),
    visitsLastMonth: 5,
    frequency: {
      type: 'weekly',
      description: 'כמעט כל יום'
    },
    activityData: generateActivityData(6, 5),
    createdAt: new Date('2025-07-22'),
    updatedAt: new Date('2026-01-16')
  },
  {
    id: '8',
    name: 'מאיר בן דוד',
    phone: '054-4444444',
    email: 'meir.bendavid@example.com',
    status: 'active',
    lastVisit: new Date('2026-01-14'),
    visitsLastMonth: 2,
    frequency: {
      type: 'biweekly',
      description: 'פעם בשבועיים'
    },
    activityData: generateActivityData(6, 2),
    createdAt: new Date('2025-05-30'),
    updatedAt: new Date('2026-01-14')
  }
];

export const mockVisits: Visit[] = [
  {
    id: '1',
    visitorId: '1',
    scheduledAt: new Date('2026-01-20T10:00:00'),
    status: 'scheduled',
    notes: 'ביקור רגיל שבועי',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15')
  },
  {
    id: '2',
    visitorId: '2',
    scheduledAt: new Date('2026-01-21T14:30:00'),
    status: 'scheduled',
    notes: 'ביקור דו-שבועי',
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12')
  },
  {
    id: '3',
    visitorId: '4',
    scheduledAt: new Date('2026-01-22T16:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-18')
  },
  {
    id: '4',
    visitorId: '7',
    scheduledAt: new Date('2026-01-20T09:00:00'),
    status: 'scheduled',
    notes: 'ביקור בוקר',
    createdAt: new Date('2026-01-16'),
    updatedAt: new Date('2026-01-16')
  },
  {
    id: '5',
    visitorId: '8',
    scheduledAt: new Date('2026-01-23T11:30:00'),
    status: 'scheduled',
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-14')
  },
  {
    id: '6',
    visitorId: '1',
    scheduledAt: new Date('2026-01-27T10:00:00'),
    status: 'scheduled',
    notes: 'ביקור שבועי הבא',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15')
  }
];

export const mockReminders: Reminder[] = [
  {
    id: '1',
    visitorId: '1',
    scheduledDate: new Date('2026-01-20T10:00:00'),
    type: 'voice',
    status: 'pending',
    message: 'תזכורת לביקור מחר בשעה 10:00',
    createdAt: new Date('2026-01-18')
  },
  {
    id: '2',
    visitorId: '2',
    scheduledDate: new Date('2026-01-21T14:30:00'),
    type: 'sms',
    status: 'pending',
    message: 'תזכורת לביקור מחר בשעה 14:30',
    createdAt: new Date('2026-01-18')
  },
  {
    id: '3',
    visitorId: '4',
    scheduledDate: new Date('2026-01-22T16:00:00'),
    type: 'voice',
    status: 'sent',
    message: 'תזכורת לביקור מחר בשעה 16:00',
    sentAt: new Date('2026-01-18T12:00:00'),
    createdAt: new Date('2026-01-17')
  }
];

// פונקצית עזר ליצירת נתונים לדוגמה
export const getMockData = () => {
  // חישוב סטטיסטיקות
  const activeVisitors = mockVisitors.filter(v => v.status === 'active');
  const upcomingVisits = mockVisits.filter(v => 
    new Date(v.scheduledAt) > new Date() && 
    new Date(v.scheduledAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const pendingReminders = mockReminders.filter(r => r.status === 'pending');

  return {
    statistics: {
      totalVisitors: mockVisitors.length,
      activeVisitors: activeVisitors.length,
      upcomingVisits: upcomingVisits.length,
      pendingReminders: pendingReminders.length,
    },
    visitors: mockVisitors,
    visits: mockVisits,
    reminders: mockReminders,
  };
};