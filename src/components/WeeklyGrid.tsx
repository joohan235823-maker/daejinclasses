import React from 'react';
import { BellTime, StudentMemo, SubjectCategory, ThemeMode, TimetableItem } from '../types/timetable';
import { DEFAULT_BELL_TIMES, DAY_NAMES, formatDateToYMD, isTodayYMD } from '../utils/dateUtils';
import { MessageSquare, User, MapPin, Sparkles } from 'lucide-react';

interface WeeklyGridProps {
  theme: ThemeMode;
  weekDays: Date[];
  items: TimetableItem[];
  memos: StudentMemo[];
  onSelectPeriod: (item: TimetableItem | { date: string; period: number; dayOfWeek: number }) => void;
  bellTimes?: BellTime[];
}

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  theme,
  weekDays,
  items,
  memos,
  onSelectPeriod,
  bellTimes = DEFAULT_BELL_TIMES,
}) => {
  // Category Color Presets
  const getCategoryStyles = (category: SubjectCategory) => {
    if (theme === 'chalkboard') {
      switch (category) {
        case 'technical':
          return 'bg-emerald-900/90 text-emerald-100 border-emerald-500/60 hover:bg-emerald-800';
        case 'academic':
          return 'bg-teal-900/90 text-teal-100 border-teal-500/60 hover:bg-teal-800';
        case 'science':
          return 'bg-cyan-900/90 text-cyan-100 border-cyan-500/60 hover:bg-cyan-800';
        case 'pe_arts':
          return 'bg-green-900/90 text-green-100 border-green-500/60 hover:bg-green-800';
        default:
          return 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60 hover:bg-emerald-900';
      }
    } else if (theme === 'dark') {
      switch (category) {
        case 'technical':
          return 'bg-amber-950/60 text-amber-200 border-amber-700/50 hover:bg-amber-900/70';
        case 'academic':
          return 'bg-indigo-950/60 text-indigo-200 border-indigo-700/50 hover:bg-indigo-900/70';
        case 'science':
          return 'bg-cyan-950/60 text-cyan-200 border-cyan-700/50 hover:bg-cyan-900/70';
        case 'pe_arts':
          return 'bg-rose-950/60 text-rose-200 border-rose-700/50 hover:bg-rose-900/70';
        case 'foreign':
          return 'bg-purple-950/60 text-purple-200 border-purple-700/50 hover:bg-purple-900/70';
        case 'career':
          return 'bg-emerald-950/60 text-emerald-200 border-emerald-700/50 hover:bg-emerald-900/70';
        default:
          return 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-800';
      }
    } else {
      // Classic Navy Theme
      switch (category) {
        case 'technical':
          return 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/80 shadow-xs';
        case 'academic':
          return 'bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-100/80 shadow-xs';
        case 'science':
          return 'bg-cyan-50 text-cyan-950 border-cyan-200 hover:bg-cyan-100/80 shadow-xs';
        case 'pe_arts':
          return 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100/80 shadow-xs';
        case 'foreign':
          return 'bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-100/80 shadow-xs';
        case 'career':
          return 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/80 shadow-xs';
        default:
          return 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100/80 shadow-xs';
      }
    }
  };

  const getMemosForCell = (dateYmd: string, periodNum: number) => {
    return memos.filter((m) => m.timetableId.includes(`${dateYmd}_P${periodNum}`));
  };

  const tableBg =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-800/80 text-emerald-100'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100'
      : 'bg-white border-slate-200 text-slate-900';

  const headerBg =
    theme === 'chalkboard'
      ? 'bg-[#154227] text-emerald-100 border-emerald-800/80'
      : theme === 'dark'
      ? 'bg-slate-800/90 text-slate-200 border-slate-800'
      : 'bg-indigo-900 text-white border-indigo-800';

  return (
    <div className={`rounded-2xl border ${tableBg} overflow-hidden shadow-sm transition-all duration-200`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse min-w-[680px]">
          <thead>
            <tr className={`border-b ${headerBg}`}>
              {/* Period Column Header */}
              <th className="py-3 px-3 text-center text-xs font-bold w-20 border-r border-white/10 shrink-0">
                교시
              </th>

              {/* Day Columns Mon~Fri */}
              {weekDays.map((dateObj, idx) => {
                const ymd = formatDateToYMD(dateObj);
                const isToday = isTodayYMD(ymd);
                const dayName = DAY_NAMES[dateObj.getDay()];

                return (
                  <th
                    key={ymd}
                    className={`py-3 px-3 text-center border-r border-white/10 last:border-r-0 transition-colors ${
                      isToday
                        ? theme === 'chalkboard'
                          ? 'bg-emerald-800 text-amber-300 font-extrabold'
                          : 'bg-indigo-800 text-amber-300 font-extrabold'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-sm font-extrabold">
                        <span>{dayName}요일</span>
                        {isToday && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] opacity-80 font-normal">
                        {dateObj.getMonth() + 1}.{dateObj.getDate()}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-black/10 dark:divide-white/10 text-xs">
            {bellTimes.map((bell) => (
              <tr key={bell.period} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                {/* Period Time Column */}
                <td className="py-3 px-2 text-center font-bold border-r border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 align-middle">
                  <span className="block text-sm font-extrabold text-indigo-400 dark:text-emerald-400">
                    {bell.period}교시
                  </span>
                  <span className="block text-[10px] opacity-75 font-mono">
                    {bell.startTime}
                  </span>
                  <span className="block text-[10px] opacity-75 font-mono">
                    ~ {bell.endTime}
                  </span>
                </td>

                {/* Day Cells */}
                {weekDays.map((dateObj, dayIdx) => {
                  const dateYmd = formatDateToYMD(dateObj);
                  const isToday = isTodayYMD(dateYmd);

                  // Find item for this date + period
                  const matchedItem = items.find(
                    (it) => it.date === dateYmd && it.period === bell.period
                  );

                  const cellMemos = getMemosForCell(dateYmd, bell.period);

                  return (
                    <td
                      key={`${dateYmd}_${bell.period}`}
                      onClick={() =>
                        onSelectPeriod(
                          matchedItem || {
                            date: dateYmd,
                            period: bell.period,
                            dayOfWeek: dayIdx + 1,
                          }
                        )
                      }
                      className={`p-1.5 border-r border-black/10 dark:border-white/10 last:border-r-0 align-top transition-all cursor-pointer ${
                        isToday ? 'bg-indigo-500/5 dark:bg-emerald-500/5' : ''
                      }`}
                    >
                      {matchedItem ? (
                        <div
                          className={`p-2.5 rounded-xl border transition-all h-full min-h-[72px] flex flex-col justify-between group ${getCategoryStyles(
                            matchedItem.colorCategory
                          )}`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-extrabold text-sm sm:text-base leading-tight block group-hover:scale-[1.01] transition-transform">
                                {matchedItem.subject}
                              </span>

                              {cellMemos.length > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold shrink-0">
                                  <MessageSquare className="w-3 h-3" />
                                  {cellMemos.length}
                                </span>
                              )}
                            </div>

                            {/* Department / Tag if technical */}
                            {matchedItem.colorCategory === 'technical' && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold opacity-85 mt-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                전공
                              </span>
                            )}
                          </div>

                          <div className="mt-2 pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] opacity-80">
                            {matchedItem.teacher ? (
                              <span className="flex items-center gap-1 font-medium">
                                <User className="w-3 h-3" />
                                {matchedItem.teacher}
                              </span>
                            ) : (
                              <span className="text-[10px]">대진전자통신고</span>
                            )}

                            {matchedItem.classroom && (
                              <span className="flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3" />
                                {matchedItem.classroom}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl border border-dashed border-black/10 dark:border-white/10 h-full min-h-[72px] flex items-center justify-center text-center opacity-40 hover:opacity-80 transition-opacity">
                          <span className="text-[11px] font-medium">+ 메모/수업</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
