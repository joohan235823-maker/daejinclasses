import React, { useState, useEffect, useCallback } from 'react';
import { GradeNumber, MealItem, ScheduleEvent, StudentMemo, ThemeMode, TimetableItem } from './types/timetable';
import { getMonday, getWeekDays, formatDateToYMD, isTodayYMD } from './utils/dateUtils';
import { fetchTimetable, fetchMealInfo, fetchSchoolSchedule, categorizeSubject } from './services/neisApi';

import { Header } from './components/Header';
import { ClassSelector } from './components/ClassSelector';
import { LivePeriodWidget } from './components/LivePeriodWidget';
import { WeeklyGrid } from './components/WeeklyGrid';
import { DailyView } from './components/DailyView';
import { MealWidget } from './components/MealWidget';
import { AcademicCalendar } from './components/AcademicCalendar';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { PrintExportModal } from './components/PrintExportModal';
import { SettingsModal } from './components/SettingsModal';
import { ClassTimetableEditorModal } from './components/ClassTimetableEditorModal';

import { CheckCircle2, MessageSquare, Trash2, Calendar, Sparkles } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('daejin_theme') as ThemeMode) || 'classic';
  });

  // Grade & Class selection
  const [grade, setGrade] = useState<GradeNumber>(() => {
    const saved = localStorage.getItem('daejin_grade');
    return saved ? (parseInt(saved, 10) as GradeNumber) : 1;
  });

  const [classNm, setClassNm] = useState<string>(() => {
    return localStorage.getItem('daejin_class') || '5';
  });

  // Department selection
  const [userDepartment, setUserDepartment] = useState<string>(() => {
    return localStorage.getItem('daejin_department') || 'AI소프트웨어과';
  });

  // Saved default class check
  const [defaultClass, setDefaultClass] = useState<{ grade: GradeNumber; classNm: string } | null>(() => {
    const saved = localStorage.getItem('daejin_default_class');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily' | 'meal' | 'schedule' | 'memos'>('weekly');

  // Week selection
  const [mondayDate, setMondayDate] = useState<Date>(() => getMonday(new Date()));

  // Data states
  const [timetableItems, setTimetableItems] = useState<TimetableItem[]>([]);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [isMockMeal, setIsMockMeal] = useState<boolean>(false);
  const [mealMessage, setMealMessage] = useState<string>('');
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [memos, setMemos] = useState<StudentMemo[]>(() => {
    const saved = localStorage.getItem('daejin_memos');
    return saved ? JSON.parse(saved) : [];
  });

  // Custom API key
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('daejin_api_key') || '';
  });

  // Loading states
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Modals
  const [selectedPeriodForDetail, setSelectedPeriodForDetail] = useState<
    TimetableItem | { date: string; period: number; dayOfWeek: number } | null
  >(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClassEditorOpen, setIsClassEditorOpen] = useState(false);

  // Department name helper by class
  const getDepartmentName = (classNumStr: string) => {
    const num = parseInt(classNumStr, 10);
    if (num === 5 || num === 4 || num === 6) return 'AI소프트웨어과';
    if (num <= 3) return '스마트소프트웨어과';
    if (num <= 8) return '전자통신과';
    if (num <= 10) return '전기제어과';
    return '정보통신과';
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('daejin_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('daejin_grade', String(grade));
    localStorage.setItem('daejin_class', classNm);
  }, [grade, classNm]);

  useEffect(() => {
    localStorage.setItem('daejin_department', userDepartment);
  }, [userDepartment]);

  useEffect(() => {
    localStorage.setItem('daejin_memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('daejin_api_key', apiKey);
  }, [apiKey]);

  // Custom Subject Overrides
  const [subjectOverrides, setSubjectOverrides] = useState<Record<string, { subject: string; teacher?: string; classroom?: string }>>(() => {
    const saved = localStorage.getItem('daejin_subject_overrides');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('daejin_subject_overrides', JSON.stringify(subjectOverrides));
  }, [subjectOverrides]);

  // Load Timetable data
  const loadTimetable = useCallback(async () => {
    setIsLoadingTimetable(true);
    const { items, isMock, message } = await fetchTimetable(grade, classNm, mondayDate, apiKey);
    
    // Check if custom class timetable exists in localStorage
    const savedCustomClassKey = `daejin_custom_class_timetable_${grade}_${classNm}`;
    const savedCustomClass = localStorage.getItem(savedCustomClassKey);
    let baseItems = items;

    if (savedCustomClass) {
      try {
        const parsedSlots: { dayIdx: number; period: number; subject: string }[] = JSON.parse(savedCustomClass);
        baseItems = items.map((it) => {
          const dayIdx = it.dayOfWeek - 1;
          const slot = parsedSlots.find((s) => s.dayIdx === dayIdx && s.period === it.period);
          if (slot) {
            return {
              ...it,
              subject: slot.subject,
              colorCategory: categorizeSubject(slot.subject),
            };
          }
          return it;
        });
      } catch (e) {
        console.warn('Failed to parse custom class timetable', e);
      }
    }

    // Apply user single-slot overrides if any
    const merged = baseItems.map((it) => {
      const key = `${it.date}_P${it.period}`;
      if (subjectOverrides[key]) {
        const ov = subjectOverrides[key];
        return {
          ...it,
          subject: ov.subject,
          teacher: ov.teacher !== undefined ? ov.teacher : it.teacher,
          classroom: ov.classroom !== undefined ? ov.classroom : it.classroom,
          colorCategory: categorizeSubject(ov.subject),
        };
      }
      return it;
    });

    setTimetableItems(merged);
    setIsMockData(isMock);
    if (message) setStatusMessage(message);
    setIsLoadingTimetable(false);
  }, [grade, classNm, mondayDate, apiKey, subjectOverrides]);

  // Load Meals data
  const loadMeals = useCallback(async () => {
    setIsLoadingMeals(true);
    const { meals: resMeals, isMock, message } = await fetchMealInfo(mondayDate, apiKey);
    setMeals(resMeals);
    setIsMockMeal(isMock);
    if (message) setMealMessage(message);
    setIsLoadingMeals(false);
  }, [mondayDate, apiKey]);

  // Load Schedule data
  const loadSchedule = useCallback(async () => {
    setIsLoadingSchedule(true);
    const res = await fetchSchoolSchedule(mondayDate, apiKey);
    setScheduleEvents(res);
    setIsLoadingSchedule(false);
  }, [mondayDate, apiKey]);

  useEffect(() => {
    loadTimetable();
    loadMeals();
    loadSchedule();
  }, [loadTimetable, loadMeals, loadSchedule]);

  // Date/Week Handlers
  const handlePrevWeek = () => {
    const prev = new Date(mondayDate);
    prev.setDate(mondayDate.getDate() - 7);
    setMondayDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(mondayDate);
    next.setDate(mondayDate.getDate() + 7);
    setMondayDate(next);
  };

  const handleThisWeek = () => {
    setMondayDate(getMonday(new Date()));
  };

  const handleDateSelect = (d: Date) => {
    setMondayDate(getMonday(d));
  };

  // Default class toggle
  const isSavedDefault = defaultClass?.grade === grade && defaultClass?.classNm === classNm;
  const handleToggleSaveDefault = () => {
    if (isSavedDefault) {
      localStorage.removeItem('daejin_default_class');
      setDefaultClass(null);
    } else {
      const obj = { grade, classNm };
      localStorage.setItem('daejin_default_class', JSON.stringify(obj));
      setDefaultClass(obj);
    }
  };

  // Memo actions
  const handleAddMemo = (timetableId: string, text: string, isHomework: boolean) => {
    const newMemo: StudentMemo = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timetableId,
      text,
      isHomework,
      completed: false,
      createdAt: Date.now(),
    };
    setMemos((prev) => [newMemo, ...prev]);
  };

  const handleToggleMemo = (memoId: string) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === memoId ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleSaveSubjectOverride = (date: string, period: number, subject: string, teacher?: string, classroom?: string) => {
    const key = `${date}_P${period}`;
    const newOverrides = {
      ...subjectOverrides,
      [key]: { subject, teacher, classroom },
    };
    setSubjectOverrides(newOverrides);
    setTimetableItems((prev) =>
      prev.map((it) => {
        if (it.date === date && it.period === period) {
          return {
            ...it,
            subject,
            teacher,
            classroom,
          };
        }
        return it;
      })
    );
  };

  const handleSaveClassTimetable = (targetGrade: GradeNumber, targetClass: string, slots: { dayIdx: number; period: number; subject: string }[]) => {
    const key = `daejin_custom_class_timetable_${targetGrade}_${targetClass}`;
    localStorage.setItem(key, JSON.stringify(slots));
    loadTimetable();
  };

  const handleResetToNeisClassTimetable = () => {
    const key = `daejin_custom_class_timetable_${grade}_${classNm}`;
    localStorage.removeItem(key);
    loadTimetable();
  };

  const handleDeleteMemo = (memoId: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== memoId));
  };

  const handleClearData = () => {
    localStorage.clear();
    setGrade(1);
    setClassNm('1');
    setDefaultClass(null);
    setMemos([]);
    setApiKey('');
    setTheme('classic');
  };

  // Find today's items for live period widget
  const weekDays = getWeekDays(mondayDate);
  const todayYmd = formatDateToYMD(new Date());
  const isTodayInSelectedWeek = weekDays.some((d) => formatDateToYMD(d) === todayYmd);
  const todayItems = timetableItems.filter((it) => it.date === todayYmd);

  // Background style by theme
  const bodyBg =
    theme === 'chalkboard'
      ? 'bg-[#0a1e13] text-emerald-100 font-sans'
      : theme === 'dark'
      ? 'bg-slate-950 text-slate-100 font-sans'
      : 'bg-slate-100 text-slate-900 font-sans';

  return (
    <div className={`min-h-screen flex flex-col ${bodyBg} transition-colors duration-200`}>
      {/* Top Navigation Bar */}
      <Header
        theme={theme}
        onThemeChange={setTheme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={() => {
          loadTimetable();
          loadMeals();
          loadSchedule();
        }}
        isRefreshing={isLoadingTimetable}
        isMockData={isMockData}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Class & Date Controls */}
        <ClassSelector
          theme={theme}
          grade={grade}
          classNm={classNm}
          departmentName={userDepartment}
          onGradeChange={setGrade}
          onClassChange={(c) => {
            setClassNm(c);
            setUserDepartment(getDepartmentName(c));
          }}
          onDepartmentChange={setUserDepartment}
          onOpenTimetableEditor={() => setIsClassEditorOpen(true)}
          mondayDate={mondayDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onThisWeek={handleThisWeek}
          onDateSelect={handleDateSelect}
          isSavedDefault={isSavedDefault}
          onToggleSaveDefault={handleToggleSaveDefault}
        />

        {/* Real-time Current Period Widget */}
        <LivePeriodWidget
          theme={theme}
          todayItems={todayItems}
          isTodayInSelectedWeek={isTodayInSelectedWeek}
        />

        {/* Tab Views */}
        {activeTab === 'weekly' && (
          <div className="space-y-3">
            {isLoadingTimetable ? (
              <div className="p-12 text-center rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold mt-3">대진전자통신고 시간표를 불러오는 중입니다...</p>
              </div>
            ) : (
              <WeeklyGrid
                theme={theme}
                weekDays={weekDays}
                items={timetableItems}
                memos={memos}
                onSelectPeriod={setSelectedPeriodForDetail}
              />
            )}
          </div>
        )}

        {activeTab === 'daily' && (
          <DailyView
            theme={theme}
            weekDays={weekDays}
            items={timetableItems}
            memos={memos}
            onSelectPeriod={setSelectedPeriodForDetail}
          />
        )}

        {activeTab === 'meal' && (
          <MealWidget
            theme={theme}
            meals={meals}
            isLoading={isLoadingMeals}
            isMockMeal={isMockMeal}
            statusMessage={mealMessage}
          />
        )}

        {activeTab === 'schedule' && (
          <AcademicCalendar
            theme={theme}
            events={scheduleEvents}
            isLoading={isLoadingSchedule}
          />
        )}

        {activeTab === 'memos' && (
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border ${
              theme === 'chalkboard'
                ? 'bg-[#0f2d1b] border-emerald-800'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            } flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">전체 등록 과제 & 공부 메모</h3>
                  <p className="text-xs opacity-75">
                    내가 등록한 수업 메모와 제출 과제 목록입니다.
                  </p>
                </div>
              </div>
            </div>

            {memos.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${
                theme === 'chalkboard'
                  ? 'bg-[#0f2d1b] border-emerald-800'
                  : theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}>
                <p className="text-sm opacity-70">등록된 과제나 메모가 없습니다.</p>
                <p className="text-xs opacity-50 mt-1">시간표 셀을 클릭하여 메모를 작성해보세요!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {memos.map((memo) => (
                  <div
                    key={memo.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      memo.completed
                        ? 'bg-black/5 dark:bg-white/5 opacity-60 line-through'
                        : theme === 'chalkboard'
                        ? 'bg-[#0f2d1b] border-emerald-800'
                        : theme === 'dark'
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleMemo(memo.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          memo.completed
                            ? 'bg-amber-500 border-amber-500 text-slate-950'
                            : 'border-black/20 dark:border-white/20'
                        }`}
                      >
                        {memo.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        {memo.isHomework && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 mr-2">
                            과제
                          </span>
                        )}
                        <span className="text-sm font-bold">{memo.text}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMemo(memo.id)}
                      className="p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 mt-8 transition-colors ${
        theme === 'chalkboard'
          ? 'border-emerald-800/60 bg-[#0d2617] text-emerald-200/80'
          : theme === 'dark'
          ? 'border-slate-800 bg-slate-950 text-slate-400'
          : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>대진전자통신고등학교 실시간 시간표 및 급식 조회 서비스</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] opacity-80">
            <span>나이스(NEIS) Open API 연동</span>
            <span>·</span>
            <a href="https://school.busanedu.net/pdj-h/main.do" target="_blank" rel="noreferrer" className="hover:underline">
              학교 공식 홈페이지 (school.busanedu.net/pdj-h)
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedPeriodForDetail && (
        <SubjectDetailModal
          theme={theme}
          item={selectedPeriodForDetail}
          memos={memos}
          onAddMemo={handleAddMemo}
          onToggleMemo={handleToggleMemo}
          onDeleteMemo={handleDeleteMemo}
          onSaveSubjectOverride={handleSaveSubjectOverride}
          onClose={() => setSelectedPeriodForDetail(null)}
        />
      )}

      {isPrintOpen && (
        <PrintExportModal
          theme={theme}
          grade={grade}
          classNm={classNm}
          departmentName={userDepartment}
          mondayDate={mondayDate}
          items={timetableItems}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          theme={theme}
          apiKey={apiKey}
          onSaveApiKey={setApiKey}
          onClearData={handleClearData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isClassEditorOpen && (
        <ClassTimetableEditorModal
          theme={theme}
          grade={grade}
          classNm={classNm}
          departmentName={userDepartment}
          mondayDate={mondayDate}
          currentItems={timetableItems}
          onSaveClassTimetable={handleSaveClassTimetable}
          onResetToNeis={handleResetToNeisClassTimetable}
          onClose={() => setIsClassEditorOpen(false)}
        />
      )}
    </div>
  );
}
