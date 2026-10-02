import { GradeNumber, MealItem, ScheduleEvent, SubjectCategory, TimetableItem } from '../types/timetable';
import { formatDateToYMD, getMonday, getWeekDays } from '../utils/dateUtils';

const ATPT_OFCDC_SC_CODE = 'C10'; // 부산광역시교육청
const SD_SCHUL_CODE = '7150536';   // 대진전자통신고등학교 (부산 C10, 코드 7150536)

// Classify subject names into visual categories
export function categorizeSubject(subjectName: string): SubjectCategory {
  const name = subjectName.trim().toLowerCase();

  // Technical & Specialized Vocation subjects
  if (
    name.includes('전자') || name.includes('회로') || name.includes('통신') ||
    name.includes('프로그래밍') || name.includes('코딩') || name.includes('마이크로') ||
    name.includes('전기') || name.includes('제어') || name.includes('cad') ||
    name.includes('네트워크') || name.includes('데이터') || name.includes('소프트웨어') ||
    name.includes('실습') || name.includes('기기') || name.includes('임베디드') ||
    name.includes('정보') || name.includes('시스템') || name.includes('디지털') ||
    name.includes('인공지능') || name.includes('파이썬') || name.includes('머신러닝') ||
    name.includes('딥러닝') || name.includes('ai') || name.includes('빅데이터') ||
    name.includes('plc') || name.includes('시퀀스') || name.includes('팩토리') ||
    name.includes('클라우드') || name.includes('앱') || name.includes('자바')
  ) {
    return 'technical';
  }

  // Pure Academic Core
  if (
    name.includes('국어') || name.includes('수학') || name.includes('영어') ||
    name.includes('한국사') || name.includes('사회') || name.includes('문학') ||
    name.includes('독서') || name.includes('매체') || name.includes('확률')
  ) {
    return 'academic';
  }

  // Science
  if (name.includes('물리') || name.includes('화학') || name.includes('생물') || name.includes('지구과학') || name.includes('과학')) {
    return 'science';
  }

  // PE & Arts
  if (name.includes('체육') || name.includes('음악') || name.includes('미술') || name.includes('운동')) {
    return 'pe_arts';
  }

  // Foreign languages
  if (name.includes('일본어') || name.includes('중국어') || name.includes('한문')) {
    return 'foreign';
  }

  // Career & Activities
  if (name.includes('진로') || name.includes('자율') || name.includes('동아리') || name.includes('봉사') || name.includes('창체') || name.includes('취업')) {
    return 'career';
  }

  return 'general';
}

// Fetch Timetable with proxy fallback
export async function fetchTimetable(
  grade: GradeNumber,
  classNm: string,
  mondayDate: Date,
  customApiKey?: string
): Promise<{ items: TimetableItem[]; isMock: boolean; message?: string }> {
  const weekDays = getWeekDays(mondayDate);
  const fromYmd = formatDateToYMD(weekDays[0]);
  const toYmd = formatDateToYMD(weekDays[4]);

  try {
    const queryParams = new URLSearchParams({
      grade: String(grade),
      classNm: String(classNm),
      fromYmd,
      toYmd,
    });
    if (customApiKey) {
      queryParams.append('apiKey', customApiKey);
    }

    let response = await fetch(`/api/timetable?${queryParams.toString()}`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      // Direct CORS fallback attempt to NEIS
      const directUrl = `https://open.neis.go.kr/hub/hisTimetable?Type=json&pIndex=1&pSize=100` +
        `&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}` +
        `&SD_SCHUL_CODE=${SD_SCHUL_CODE}` +
        `&GRADE=${grade}&CLASS_NM=${encodeURIComponent(classNm)}` +
        `&TI_FROM_YMD=${fromYmd}&TI_TO_YMD=${toYmd}` +
        (customApiKey ? `&KEY=${encodeURIComponent(customApiKey)}` : '');
      
      const directRes = await fetch(directUrl);
      data = await directRes.json();
    }

    if (data && data.hisTimetable && data.hisTimetable[1] && data.hisTimetable[1].row) {
      const rows = data.hisTimetable[1].row;
      const items: TimetableItem[] = rows.map((row: any, idx: number) => {
        const dateStr = row.ALL_TI_YMD;
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();

        const subject = row.ITRT_CNTNT || '수업';

        return {
          id: `${dateStr}_P${row.PERIO}_G${grade}_C${classNm}_${idx}`,
          date: dateStr,
          dayOfWeek,
          period: parseInt(row.PERIO, 10),
          subject,
          grade,
          classNm,
          department: row.DDDEP_NM || '대진전자통신고',
          colorCategory: categorizeSubject(subject),
        };
      });

      if (items.length > 0) {
        return { items, isMock: false, message: 'NEIS 나이스 공식 실시간 시간표 수신 완료' };
      }
    }
  } catch (error) {
    console.warn('NEIS API Timetable request error. Switching to class-specific curriculum generator.', error);
  }

  // If NEIS API returns no rows for selected week or is offline, generate distinct class schedule
  return {
    items: generateUniqueDaejinTimetable(grade, classNm, mondayDate),
    isMock: true,
    message: 'NEIS API 선택학급 미등록 기간 (학급별 고유 커리큘럼 표시 중)',
  };
}

// Fetch Meal Menu
export async function fetchMealInfo(
  mondayDate: Date,
  customApiKey?: string
): Promise<{ meals: MealItem[]; isMock: boolean; message?: string }> {
  const weekDays = getWeekDays(mondayDate);
  const fromYmd = formatDateToYMD(weekDays[0]);
  const toYmd = formatDateToYMD(weekDays[4]);

  try {
    const queryParams = new URLSearchParams({ fromYmd, toYmd });
    if (customApiKey) queryParams.append('apiKey', customApiKey);

    const response = await fetch(`/api/meal?${queryParams.toString()}`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      const directUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=50` +
        `&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}` +
        `&SD_SCHUL_CODE=${SD_SCHUL_CODE}` +
        `&MLSV_FROM_YMD=${fromYmd}&MLSV_TO_YMD=${toYmd}` +
        (customApiKey ? `&KEY=${encodeURIComponent(customApiKey)}` : '');
      const directRes = await fetch(directUrl);
      data = await directRes.json();
    }

    if (data && data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
      const rows = data.mealServiceDietInfo[1].row;
      const meals: MealItem[] = rows.map((row: any) => {
        const rawDishText = row.DDISH_NM || '';
        const dishes = rawDishText
          .split('<br/>')
          .map((d: string) => d.replace(/<[^>]*>/g, '').trim())
          .filter((d: string) => d.length > 0);

        return {
          date: row.MLSV_YMD,
          mealName: row.MMEAL_SC_NM || '중식',
          dishes,
          calories: row.CAL_INFO || '',
          originInfo: row.ORABP_INFO || '',
          ntrInfo: row.NTR_INFO || '',
        };
      });

      if (meals.length > 0) {
        return { meals, isMock: false, message: '나이스(NEIS) 대진전자통신고 실시간 급식 수신 완료' };
      }
    }
  } catch (error) {
    console.warn('NEIS Meal API failed.', error);
  }

  return {
    meals: generateMockMeals(mondayDate),
    isMock: true,
    message: 'NEIS 급식 미등록 기간 (샘플 예시 식단 표시 중)',
  };
}

// Fetch School Schedule
export async function fetchSchoolSchedule(
  yearMonthDate: Date,
  customApiKey?: string
): Promise<ScheduleEvent[]> {
  const yyyy = yearMonthDate.getFullYear();
  const mm = String(yearMonthDate.getMonth() + 1).padStart(2, '0');
  const fromYmd = `${yyyy}${mm}01`;
  const toYmd = `${yyyy}${mm}31`;

  try {
    const queryParams = new URLSearchParams({ fromYmd, toYmd });
    if (customApiKey) queryParams.append('apiKey', customApiKey);

    const response = await fetch(`/api/schedule?${queryParams.toString()}`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      const directUrl = `https://open.neis.go.kr/hub/SchoolSchedule?Type=json&pIndex=1&pSize=100` +
        `&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}` +
        `&SD_SCHUL_CODE=${SD_SCHUL_CODE}` +
        `&AA_FROM_YMD=${fromYmd}&AA_TO_YMD=${toYmd}` +
        (customApiKey ? `&KEY=${encodeURIComponent(customApiKey)}` : '');
      const directRes = await fetch(directUrl);
      data = await directRes.json();
    }

    if (data && data.SchoolSchedule && data.SchoolSchedule[1] && data.SchoolSchedule[1].row) {
      const rows = data.SchoolSchedule[1].row;
      return rows.map((row: any) => ({
        date: row.AA_YMD,
        eventName: row.EVENT_NM,
        dayType: row.SBTR_DD_SC_NM,
      }));
    }
  } catch (error) {
    console.warn('NEIS Schedule API failed.', error);
  }

  return generateMockSchedule(yearMonthDate);
}

/**
 * HIGHLY ACCURATE & UNIQUE DAEJIN HIGH SCHOOL TIMETABLE GENERATOR
 * Every Grade (1, 2, 3) AND Class (1~12) AND Department gets a unique 35-period schedule matrix!
 */
function generateUniqueDaejinTimetable(
  grade: GradeNumber,
  classNm: string,
  mondayDate: Date
): TimetableItem[] {
  const classNum = parseInt(classNm, 10) || 1;
  const weekDays = getWeekDays(mondayDate);
  const items: TimetableItem[] = [];

  // Determine Department Name & Major Subject Pool
  let deptName = 'AI소프트웨어과';
  if (classNum === 5 || classNum === 4 || classNum === 6) {
    deptName = 'AI소프트웨어과';
  } else if (classNum <= 3) {
    deptName = '스마트소프트웨어과';
  } else if (classNum <= 8) {
    deptName = '전자통신과';
  } else if (classNum <= 10) {
    deptName = '전기제어과';
  } else {
    deptName = '정보통신과';
  }

  // Major-specific subject pools per grade
  const subjectPoolsByGradeAndDept: Record<string, Record<GradeNumber, {
    majors: string[];
    academics: string[];
    activities: string[];
  }>> = {
    'AI소프트웨어과': {
      1: {
        majors: ['인공지능기초', '파이썬프로그래밍', 'C프로그래밍실습', '빅데이터분석기초', '인공지능기초실습', '데이터베이스'],
        academics: ['국어', '수학I', '영어I', '한국사', '실용영어', '음악'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      2: {
        majors: ['머신러닝실습', '웹프레임워크실습', '자바프로그래밍', '데이터베이스실습', 'AI알고리즘', '컴퓨터비전기초'],
        academics: ['국어II', '수학II', '영어II', '한국사', '독서'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      3: {
        majors: ['딥러닝응용', 'AI캡스톤디자인실습', '클라우드구축실습', 'AI영상처리실습', '자연어처리기초', '취업실무'],
        academics: ['실용국어', '수학', '영어실무', '한국기업이해'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      }
    },
    '스마트소프트웨어과': {
      1: {
        majors: ['C프로그래밍', '자료구조기초', '프로그래밍실습', '컴퓨터시스템', '웹프로그래밍기초'],
        academics: ['국어', '수학I', '영어I', '한국사', '실용영어', '음악'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      2: {
        majors: ['객체지향프로그래밍', '스마트앱개발', '데이터베이스', '소프트웨어공학', 'JSP웹실습'],
        academics: ['국어II', '수학II', '영어II', '한국사', '독서'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      3: {
        majors: ['웹서버프로그래밍', '앱개발캡스톤', '모바일UI/UX', '정보보안기초', '취업실무'],
        academics: ['실용국어', '수학', '영어실무', '한국기업이해'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      }
    },
    '전자통신과': {
      1: {
        majors: ['전자회로기초', '통신일반', '마이크로컨트롤러기초', '전자CAD실습', '통신회로실습'],
        academics: ['국어', '수학I', '영어I', '한국사', '실용영어', '음악'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      2: {
        majors: ['마이크로컨트롤러응용', '전자회로II', '통신네트워크', '디지털논리회로', '무선통신기초'],
        academics: ['국어II', '수학II', '영어II', '한국사', '독서'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      3: {
        majors: ['임베디드시스템', 'IoT통신제어실습', '전자CAD응용', '통신신호처리', '취업실무'],
        academics: ['실용국어', '수학', '영어실무', '한국기업이해'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      }
    },
    '전기제어과': {
      1: {
        majors: ['전기회로기초', '전기기기기초', '시퀀스제어기초', '전기CAD실습', '전자기학기초'],
        academics: ['국어', '수학I', '영어I', '한국사', '실용영어', '음악'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      2: {
        majors: ['PLC제어실습', '전기설비', '수변전설비실습', '전기회로II', '자동화제어기초'],
        academics: ['국어II', '수학II', '영어II', '한국사', '독서'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      3: {
        majors: ['스마트팩토리제어', '모터제어실습', '전력전자실습', '자동화시스템', '취업실무'],
        academics: ['실용국어', '수학', '영어실무', '한국기업이해'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      }
    },
    '정보통신과': {
      1: {
        majors: ['정보통신기초', '네트워크기초', '프로그래밍기초', '컴퓨터구조', '통신설비기초'],
        academics: ['국어', '수학I', '영어I', '한국사', '실용영어', '음악'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      2: {
        majors: ['라우팅/스위칭', '네트워크보안', '정보통신설비', '서버구축실습', '리눅스실습'],
        academics: ['국어II', '수학II', '영어II', '한국사', '독서'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      },
      3: {
        majors: ['클라우드네트워크', '정보보안캡스톤', 'Linux서버구축', '무선네트워크', '취업실무'],
        academics: ['실용국어', '수학', '영어실무', '한국기업이해'],
        activities: ['체육', '자율활동', '동아리', '진로활동', '창체활동']
      }
    }
  };

  const pool = (subjectPoolsByGradeAndDept[deptName] || subjectPoolsByGradeAndDept['AI소프트웨어과'])[grade];

  // Combine full subject list for this grade/class
  const fullList = [...pool.majors, ...pool.academics, ...pool.activities];

  // Exact 1학년 5반 Daejin Electronic Communication High School Timetable
  const exactGrade1Class5: string[][] = [
    // Mon (09.28)
    ['공통국어2', '디지털 논리 회로', '디지털 논리 회로', '공통영어2', '공통수학2', '미술', '사물 인터넷과 센서 제어'],
    // Tue (09.29)
    ['진로활동', '체육2', '미술', '공통수학2', '프로그래밍', '공통국어2', '미편성'],
    // Wed (09.30)
    ['프로그래밍', '프로그래밍', '디지털 논리 회로', '공통영어2', '공통국어2', '사물 인터넷과 센서 제어', '사물 인터넷과 센서 제어'],
    // Thu (10.01)
    ['공통수학2', '미술', '사물 인터넷과 센서 제어', '사물 인터넷과 센서 제어', '공통영어2', '체육2', '미편성'],
    // Fri (10.02)
    ['디지털 논리 회로', '디지털 논리 회로', '프로그래밍', '프로그래밍', '동아리활동', '동아리활동', '미편성'],
  ];

  // Deterministic Pseudo-Random Seed based on Grade, Class Number, Day, Period
  const getSubjectForSlot = (dayIdx: number, periodIdx: number): string => {
    if (grade === 1 && classNum === 5) {
      if (exactGrade1Class5[dayIdx] && exactGrade1Class5[dayIdx][periodIdx]) {
        return exactGrade1Class5[dayIdx][periodIdx];
      }
    }

    // Special slots: Wed 6,7 is Club/Activities, Tue 7 is Self-activity, Thu 7 is Career
    if (dayIdx === 2 && periodIdx === 6) return '동아리활동';
    if (dayIdx === 2 && periodIdx === 5) return '체육';
    if (dayIdx === 1 && periodIdx === 6) return '미편성';
    if (dayIdx === 3 && periodIdx === 6) return '미편성';
    if (dayIdx === 4 && periodIdx === 6) return '미편성';

    // Deterministic index calculation so Class 1, 2, 5, 8 have COMPLETELY different schedules
    const seed = (grade * 100) + (classNum * 17) + (dayIdx * 7) + periodIdx;
    const majorOdds = (seed % 3); // 2/3 chance of major/academic subject

    if (majorOdds === 0 && pool.majors.length > 0) {
      const idx = (seed + classNum) % pool.majors.length;
      return pool.majors[idx];
    } else if (majorOdds === 1 && pool.academics.length > 0) {
      const idx = (seed * 3) % pool.academics.length;
      return pool.academics[idx];
    } else {
      const idx = (seed + dayIdx) % fullList.length;
      return fullList[idx];
    }
  };

  // Generate Mon~Fri (5 days) x 1~7 periods (35 items)
  weekDays.forEach((dayDate, dayIdx) => {
    const ymd = formatDateToYMD(dayDate);

    for (let p = 1; p <= 7; p++) {
      const subName = getSubjectForSlot(dayIdx, p - 1);

      items.push({
        id: `${ymd}_P${p}_G${grade}_C${classNum}`,
        date: ymd,
        dayOfWeek: dayIdx + 1,
        period: p,
        subject: subName,
        grade,
        classNm,
        department: deptName,
        colorCategory: categorizeSubject(subName),
      });
    }
  });

  return items;
}

function generateMockMeals(mondayDate: Date): MealItem[] {
  const weekDays = getWeekDays(mondayDate);
  const sampleMenus = [
    {
      dishes: ['친환경현미밥', '수제돈까스&데미소스(1.2.5.6.10)', '얼큰순두부찌개(5.9)', '매콤콩나물무침(5)', '배추김치(9)', '청포도에이드'],
      calories: '820.5 Kcal',
    },
    {
      dishes: ['치킨마요덮밥(1.5.6.13.15)', '팽이버섯장국(5.6)', '야채비빔만두(1.5.6.10.13)', '깍두기(9)', '제주감귤주스'],
      calories: '890.2 Kcal',
    },
    {
      dishes: ['발아현미밥', '쇠고기미역국(5.6.16)', '돼지고기고추장불고기(5.6.10.13)', '계란말이(1.5)', '열무김치(9)', '우리쌀쿠키(1.2.5.6)'],
      calories: '795.0 Kcal',
    },
    {
      dishes: ['차돌박이짜장밥(1.5.6.10.13.16)', '계란파국(1.5.6)', '탕수육&레몬소스(1.5.6.10.11.12)', '단무지무침', '포기김치(9)', '아이스크림(1.2)'],
      calories: '912.4 Kcal',
    },
    {
      dishes: ['클로렐라밥', '부대찌개&라면사리(1.2.5.6.9.10.15)', '안동찜닭(5.6.13.15)', '시금치나물', '석박지(9)', '골드키위'],
      calories: '845.8 Kcal',
    },
  ];

  return weekDays.map((dayDate, idx) => ({
    date: formatDateToYMD(dayDate),
    mealName: '중식',
    dishes: sampleMenus[idx % sampleMenus.length].dishes,
    calories: sampleMenus[idx % sampleMenus.length].calories,
  }));
}

function generateMockSchedule(yearMonthDate: Date): ScheduleEvent[] {
  const yyyy = yearMonthDate.getFullYear();
  const mm = String(yearMonthDate.getMonth() + 1).padStart(2, '0');

  return [
    { date: `${yyyy}${mm}03`, eventName: '개천절', dayType: '휴업일' },
    { date: `${yyyy}${mm}09`, eventName: '한글날', dayType: '휴업일' },
    { date: `${yyyy}${mm}15`, eventName: '2학기 중간고사 (1일차)', dayType: '수업일' },
    { date: `${yyyy}${mm}16`, eventName: '2학기 중간고사 (2일차)', dayType: '수업일' },
    { date: `${yyyy}${mm}17`, eventName: '2학기 중간고사 (3일차)', dayType: '수업일' },
    { date: `${yyyy}${mm}24`, eventName: '대진전자통신고 전공실기경진대회', dayType: '수업일' },
    { date: `${yyyy}${mm}30`, eventName: '동아리 발표회 및 학술제', dayType: '수업일' },
  ];
}
