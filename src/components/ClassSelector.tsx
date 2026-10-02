import React, { useState } from 'react';
import { GradeNumber, ThemeMode } from '../types/timetable';
import { ChevronLeft, ChevronRight, Calendar, Bookmark, BookmarkCheck, Sparkles, Edit3 } from 'lucide-react';
import { formatDateToDot, formatYMDToInputDate, parseInputDateToYMD } from '../utils/dateUtils';

interface ClassSelectorProps {
  theme: ThemeMode;
  grade: GradeNumber;
  classNm: string;
  departmentName: string;
  onGradeChange: (g: GradeNumber) => void;
  onClassChange: (c: string) => void;
  onDepartmentChange: (dept: string) => void;
  onOpenTimetableEditor?: () => void;
  mondayDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  onDateSelect: (d: Date) => void;
  isSavedDefault: boolean;
  onToggleSaveDefault: () => void;
}

const KNOWN_DEPARTMENTS = [
  'AI소프트웨어과',
  '스마트소프트웨어과',
  '전자통신과',
  '전기제어과',
  '정보통신과',
];

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  theme,
  grade,
  classNm,
  departmentName,
  onGradeChange,
  onClassChange,
  onDepartmentChange,
  onOpenTimetableEditor,
  mondayDate,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  onDateSelect,
  isSavedDefault,
  onToggleSaveDefault,
}) => {
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customText, setCustomText] = useState('');

  const fridayDate = new Date(mondayDate);
  fridayDate.setDate(mondayDate.getDate() + 4);

  const isCurrentWeek = () => {
    const today = new Date();
    const currentMon = new Date(today);
    const day = currentMon.getDay();
    const diff = currentMon.getDate() - day + (day === 0 ? -6 : 1);
    currentMon.setDate(diff);

    return (
      mondayDate.getFullYear() === currentMon.getFullYear() &&
      mondayDate.getMonth() === currentMon.getMonth() &&
      mondayDate.getDate() === currentMon.getDate()
    );
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const ymd = parseInputDateToYMD(e.target.value);
      const year = parseInt(ymd.substring(0, 4));
      const month = parseInt(ymd.substring(4, 6)) - 1;
      const day = parseInt(ymd.substring(6, 8));
      onDateSelect(new Date(year, month, day));
    }
  };

  const handleDepartmentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomEditing(true);
    } else {
      setIsCustomEditing(false);
      onDepartmentChange(val);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onDepartmentChange(customText.trim());
      setIsCustomEditing(false);
    }
  };

  const cardStyle =
    theme === 'chalkboard'
      ? 'bg-[#123620] border-emerald-800/80 text-emerald-100 shadow-md'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-md'
      : 'bg-white border-slate-200 text-slate-800 shadow-sm';

  const badgeStyle =
    theme === 'chalkboard'
      ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200'
      : theme === 'dark'
      ? 'bg-slate-800 border-slate-700 text-slate-200'
      : 'bg-indigo-50 border-indigo-200 text-indigo-900';

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${cardStyle} transition-all duration-200 space-y-3`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Grade & Class & Dept Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Grade Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold opacity-75 shrink-0">학년:</span>
            <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              {([1, 2, 3] as GradeNumber[]).map((g) => (
                <button
                  key={g}
                  onClick={() => onGradeChange(g)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    grade === g
                      ? theme === 'chalkboard'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {g}학년
                </button>
              ))}
            </div>
          </div>

          {/* Class Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold opacity-75 shrink-0">반:</span>
            <select
              value={classNm}
              onChange={(e) => onClassChange(e.target.value)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border focus:outline-none focus:ring-2 ${
                theme === 'chalkboard'
                  ? 'bg-emerald-900/80 border-emerald-700 text-emerald-100 focus:ring-emerald-500'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
              }`}
            >
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((c) => (
                <option key={c} value={c}>
                  {c}반
                </option>
              ))}
            </select>
          </div>

          {/* Department Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold opacity-75 shrink-0">학과:</span>
            {!isCustomEditing ? (
              <select
                value={KNOWN_DEPARTMENTS.includes(departmentName) ? departmentName : 'CUSTOM'}
                onChange={handleDepartmentSelectChange}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border focus:outline-none focus:ring-2 ${
                  theme === 'chalkboard'
                    ? 'bg-emerald-900/80 border-emerald-700 text-emerald-100 focus:ring-emerald-500'
                    : theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500'
                    : 'bg-indigo-50 border-indigo-300 text-indigo-950 focus:ring-indigo-500'
                }`}
              >
                {KNOWN_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="CUSTOM">✏️ 직접 입력...</option>
              </select>
            ) : (
              <form onSubmit={handleCustomSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="학과명 직접 입력"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-indigo-400 bg-white text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                >
                  적용
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomEditing(false)}
                  className="px-2 py-1 bg-slate-400 text-white text-xs font-bold rounded-lg"
                >
                  취소
                </button>
              </form>
            )}
          </div>

          {/* Save Default Class Bookmark */}
          <button
            onClick={onToggleSaveDefault}
            title={isSavedDefault ? '내 기본 학급 저장됨' : '이 학급을 내 기본으로 저장'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isSavedDefault
                ? 'bg-amber-500/20 text-amber-500 border-amber-400/50'
                : 'opacity-70 hover:opacity-100 border-black/10 dark:border-white/10'
            }`}
          >
            {isSavedDefault ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>내 학과/반 저장됨</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>내 반으로 지정</span>
              </>
            )}
          </button>

          {/* Class Timetable Batch Editor Button */}
          {onOpenTimetableEditor && (
            <button
              onClick={onOpenTimetableEditor}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{grade}학년 {classNm}반 시간표 일괄 편집</span>
            </button>
          )}
        </div>

        {/* Date & Week Navigator Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevWeek}
              title="지난주"
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onThisWeek}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isCurrentWeek()
                  ? theme === 'chalkboard'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-80 hover:opacity-100'
              }`}
            >
              이번 주
            </button>

            <button
              onClick={onNextWeek}
              title="다음주"
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date Range Badge & Input */}
          <div className="relative flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center gap-2 ${badgeStyle}`}>
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {formatDateToDot(mondayDate)} ~ {formatDateToDot(fridayDate)}
              </span>
            </div>

            {/* Datepicker trigger */}
            <input
              type="date"
              value={formatYMDToInputDate(
                mondayDate.getFullYear() +
                  String(mondayDate.getMonth() + 1).padStart(2, '0') +
                  String(mondayDate.getDate()).padStart(2, '0')
              )}
              onChange={handleDatePickerChange}
              aria-label="날짜 선택"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
            />
          </div>
        </div>
      </div>

      {/* Official Data Transparency Banner */}
      <div className="text-[11px] opacity-75 flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>[공식 데이터 안내]</strong> 부산광역시교육청 나이스(NEIS) Open API (학교코드 7150597 / 대진전자통신고)를 수신하며, 위 드롭다운에서 사용자가 원하는 학과를 언제든 직접 변경할 수 있습니다.
        </span>
      </div>
    </div>
  );
};
