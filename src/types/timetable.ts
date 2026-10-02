export type GradeNumber = 1 | 2 | 3;

export interface TimetableItem {
  id: string;
  date: string; // YYYYMMDD
  dayOfWeek: number; // 1 (Mon) ~ 5 (Fri)
  period: number; // 1 ~ 8
  subject: string; // Subject name (e.g. 수학, 전자회로)
  teacher?: string;
  classroom?: string;
  grade: GradeNumber;
  classNm: string;
  department?: string; // e.g. 전자통신과
  colorCategory: SubjectCategory;
}

export type SubjectCategory = 
  | 'academic'    // 국어, 영어, 수학, 사회, 한국사
  | 'science'     // 물리학, 화학, 과학
  | 'technical'   // 전자회로, 프로그래밍, 마이크로컨트롤러, 통신일반, CAD, 전기기기
  | 'pe_arts'     // 체육, 음악, 미술
  | 'foreign'     // 일본어, 중국어
  | 'career'      // 진로, 자율, 동아리, 봉사
  | 'general';    // 기타

export interface MealItem {
  date: string; // YYYYMMDD
  mealName: string; // 중식
  dishes: string[]; // ['잡곡밥', '돈육김치찌개(10)', ...]
  calories: string; // "850.4 Kcal"
  allergyInfo?: string;
  originInfo?: string; // 원산지 정보 (돼지고기: 국내산 등)
  ntrInfo?: string;    // 영양 정보 (탄수화물(g): 110.2 등)
}

export interface ScheduleEvent {
  date: string; // YYYYMMDD
  eventName: string; // e.g. "2학기 1차 지필평가"
  dayType?: string; // "휴업일", "수업일"
}

export interface StudentMemo {
  id: string;
  timetableId: string; // Key based on date + period
  text: string;
  isHomework: boolean;
  dueDate?: string;
  completed: boolean;
  createdAt: number;
}

export type ThemeMode = 'classic' | 'chalkboard' | 'dark';

export interface BellTime {
  period: number;
  startTime: string; // "09:00"
  endTime: string;   // "09:50"
  label: string;     // "1교시"
}
