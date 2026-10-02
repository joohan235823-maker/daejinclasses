import React, { useState } from 'react';
import { BellTime, StudentMemo, ThemeMode, TimetableItem } from '../types/timetable';
import { DEFAULT_BELL_TIMES, DAY_NAMES, formatDateToYMD, formatYMDToKorean, isTodayYMD } from '../utils/dateUtils';
import { Clock, MessageSquare, Plus, Sparkles, User, MapPin } from 'lucide-react';

interface DailyViewProps {
  theme: ThemeMode;
  weekDays: Date[];
  items: TimetableItem[];
  memos: StudentMemo[];
  onSelectPeriod: (item: TimetableItem | { date: string; period: number; dayOfWeek: number }) => void;
  bellTimes?: BellTime[];
}

export const DailyView: React.FC<DailyViewProps> = ({
  theme,
  weekDays,
  items,
  memos,
  onSelectPeriod,
  bellTimes = DEFAULT_BELL_TIMES,
}) => {
  // Find index of today or default to Monday (0)
  const todayIdx = weekDays.findIndex((d) => isTodayYMD(formatDateToYMD(d)));
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayIdx !== -1 ? todayIdx : 0);

  const selectedDate = weekDays[selectedDayIdx] || weekDays[0];
  const selectedYmd = formatDateToYMD(selectedDate);

  const cardStyle =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-800 text-emerald-100 shadow-md'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-md'
      : 'bg-white border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-4">
      {/* Weekday Tab Selectors */}
      <div className={`p-2 rounded-2xl border ${cardStyle} flex items-center justify-between gap-1 overflow-x-auto scrollbar-none`}>
        {weekDays.map((dateObj, idx) => {
          const ymd = formatDateToYMD(dateObj);
          const isToday = isTodayYMD(ymd);
          const isSelected = idx === selectedDayIdx;
          const dayName = DAY_NAMES[dateObj.getDay()];

          return (
            <button
              key={ymd}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 min-w-[60px] py-2 px-3 rounded-xl flex flex-col items-center transition-all ${
                isSelected
                  ? theme === 'chalkboard'
                    ? 'bg-emerald-700 text-white shadow-sm font-extrabold'
                    : 'bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">{dayName}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
              </div>
              <span className="text-[10px] opacity-75">
                {dateObj.getMonth() + 1}.{dateObj.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-extrabold flex items-center gap-2">
          <span>{formatYMDToKorean(selectedYmd)} 시간표</span>
          {isTodayYMD(selectedYmd) && (
            <span className="px-2 py-0.5 text-xs font-black rounded-full bg-amber-500 text-slate-950">
              오늘
            </span>
          )}
        </h3>
        <span className="text-xs opacity-75">
          총 {bellTimes.length}개 교시
        </span>
      </div>

      {/* Timeline List Cards */}
      <div className="space-y-3">
        {bellTimes.map((bell) => {
          const item = items.find((it) => it.date === selectedYmd && it.period === bell.period);
          const cellMemos = memos.filter((m) => m.timetableId.includes(`${selectedYmd}_P${bell.period}`));

          return (
            <div
              key={bell.period}
              onClick={() =>
                onSelectPeriod(
                  item || {
                    date: selectedYmd,
                    period: bell.period,
                    dayOfWeek: selectedDayIdx + 1,
                  }
                )
              }
              className={`p-4 rounded-2xl border ${cardStyle} hover:border-indigo-500/50 transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Time & Period Badge */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                    item
                      ? theme === 'chalkboard'
                        ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-black/5 dark:bg-white/5 opacity-50'
                  }`}>
                    <span className="text-sm font-extrabold">{bell.period}</span>
                    <span className="text-[10px] font-normal">교시</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs opacity-75 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{bell.startTime} ~ {bell.endTime}</span>
                    </div>

                    <div className="mt-1">
                      {item ? (
                        <h4 className="text-base font-extrabold group-hover:text-indigo-500 dark:group-hover:text-amber-400 transition-colors">
                          {item.subject}
                        </h4>
                      ) : (
                        <span className="text-sm font-medium opacity-50 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> 수업 정보 없음 (메모 추가)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side info & memo counter */}
                <div className="flex items-center gap-2 shrink-0">
                  {cellMemos.length > 0 && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {cellMemos.length}
                    </span>
                  )}

                  {item && (
                    <div className="text-right text-xs opacity-80 hidden xs:block">
                      {item.teacher && (
                        <span className="block font-medium flex items-center gap-1 justify-end">
                          <User className="w-3 h-3" /> {item.teacher}
                        </span>
                      )}
                      {item.department && (
                        <span className="block text-[10px] opacity-75">
                          {item.department}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
