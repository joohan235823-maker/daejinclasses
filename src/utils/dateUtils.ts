import { BellTime } from '../types/timetable';

export const DEFAULT_BELL_TIMES: BellTime[] = [
  { period: 1, startTime: '09:00', endTime: '09:50', label: '1교시' },
  { period: 2, startTime: '10:00', endTime: '10:50', label: '2교시' },
  { period: 3, startTime: '11:00', endTime: '11:50', label: '3교시' },
  { period: 4, startTime: '12:00', endTime: '12:50', label: '4교시' },
  { period: 5, startTime: '13:50', endTime: '14:40', label: '5교시' },
  { period: 6, startTime: '14:50', endTime: '15:40', label: '6교시' },
  { period: 7, startTime: '15:50', endTime: '16:40', label: '7교시' },
];

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// Get Monday of the week for a given date
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // If Sunday (0), move back 6 days. Otherwise move back (day - 1) days
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Get Monday to Friday dates for a given date's week
export function getWeekDays(mondayDate: Date): Date[] {
  const week: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(mondayDate);
    nextDay.setDate(mondayDate.getDate() + i);
    week.push(nextDay);
  }
  return week;
}

// Format Date object to YYYYMMDD
export function formatDateToYMD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// Format Date object to YYYY.MM.DD
export function formatDateToDot(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

// Format YYYYMMDD string to "M월 D일 (요일)"
export function formatYMDToKorean(ymd: string): string {
  if (!ymd || ymd.length !== 8) return ymd;
  const year = parseInt(ymd.substring(0, 4));
  const month = parseInt(ymd.substring(4, 6));
  const day = parseInt(ymd.substring(6, 8));
  
  const date = new Date(year, month - 1, day);
  const dayOfWeek = DAY_NAMES[date.getDay()];
  
  return `${month}월 ${day}일 (${dayOfWeek})`;
}

// Format YYYYMMDD to YYYY-MM-DD for <input type="date">
export function formatYMDToInputDate(ymd: string): string {
  if (!ymd || ymd.length !== 8) return '';
  return `${ymd.substring(0, 4)}-${ymd.substring(4, 6)}-${ymd.substring(6, 8)}`;
}

// Parse YYYY-MM-DD input date to YYYYMMDD
export function parseInputDateToYMD(inputDate: string): string {
  return inputDate.replace(/-/g, '');
}

// Check if a date string YYYYMMDD is today
export function isTodayYMD(ymd: string): boolean {
  return ymd === formatDateToYMD(new Date());
}

export interface CurrentPeriodStatus {
  status: 'before_school' | 'class' | 'break' | 'lunch' | 'after_school' | 'weekend';
  currentPeriod?: number;
  nextPeriod?: number;
  minutesRemaining?: number;
  timeRange?: string;
}

// Calculate current active period based on local time
export function getCurrentPeriodStatus(now: Date = new Date(), bellTimes: BellTime[] = DEFAULT_BELL_TIMES): CurrentPeriodStatus {
  const day = now.getDay();
  if (day === 0 || day === 6) {
    return { status: 'weekend' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const firstPeriodStart = 9 * 60; // 09:00
  const lastPeriodEnd = 16 * 60 + 40; // 16:40

  if (currentMinutes < firstPeriodStart) {
    return {
      status: 'before_school',
      nextPeriod: 1,
      minutesRemaining: firstPeriodStart - currentMinutes,
    };
  }

  if (currentMinutes > lastPeriodEnd) {
    return { status: 'after_school' };
  }

  // Lunch time check (12:50 ~ 13:50)
  const lunchStart = 12 * 60 + 50;
  const lunchEnd = 13 * 60 + 50;
  if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
    return {
      status: 'lunch',
      nextPeriod: 5,
      minutesRemaining: lunchEnd - currentMinutes,
      timeRange: '12:50 ~ 13:50',
    };
  }

  // Check periods
  for (let i = 0; i < bellTimes.length; i++) {
    const bt = bellTimes[i];
    const [sH, sM] = bt.startTime.split(':').map(Number);
    const [eH, eM] = bt.endTime.split(':').map(Number);
    
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;

    if (currentMinutes >= startMin && currentMinutes < endMin) {
      return {
        status: 'class',
        currentPeriod: bt.period,
        nextPeriod: bt.period < 7 ? bt.period + 1 : undefined,
        minutesRemaining: endMin - currentMinutes,
        timeRange: `${bt.startTime} ~ ${bt.endTime}`,
      };
    }

    // Check break time before next period
    if (i < bellTimes.length - 1) {
      const nextBt = bellTimes[i + 1];
      const [nsH, nsM] = nextBt.startTime.split(':').map(Number);
      const nextStartMin = nsH * 60 + nsM;

      if (currentMinutes >= endMin && currentMinutes < nextStartMin) {
        return {
          status: 'break',
          currentPeriod: bt.period,
          nextPeriod: nextBt.period,
          minutesRemaining: nextStartMin - currentMinutes,
        };
      }
    }
  }

  return { status: 'after_school' };
}
