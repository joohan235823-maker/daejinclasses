import React from 'react';
import { ScheduleEvent, ThemeMode } from '../types/timetable';
import { formatYMDToKorean, isTodayYMD } from '../utils/dateUtils';
import { Calendar, Flag, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface AcademicCalendarProps {
  theme: ThemeMode;
  events: ScheduleEvent[];
  isLoading: boolean;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  theme,
  events,
  isLoading,
}) => {
  const cardStyle =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-800 text-emerald-100 shadow-md'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-md'
      : 'bg-white border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className={`p-4 rounded-2xl border ${cardStyle} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <span>대진전자통신고등학교 학사 일정</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs opacity-75">
              시험, 휴업일, 축제 및 행사 일정
            </p>
          </div>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className={`p-8 text-center rounded-2xl border ${cardStyle}`}>
          <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium mt-2">학사 일정을 불러오는 중입니다...</p>
        </div>
      ) : events.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border ${cardStyle}`}>
          <p className="text-sm opacity-70">이 달의 주요 학사 일정이 없거나 휴업일이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, idx) => {
            const isToday = isTodayYMD(event.date);
            const isHoliday = event.dayType === '휴업일' || event.eventName.includes('휴업') || event.eventName.includes('절');
            const isExam = event.eventName.includes('평가') || event.eventName.includes('고사') || event.eventName.includes('시험');

            return (
              <div
                key={`${event.date}_${idx}`}
                className={`p-4 rounded-2xl border ${cardStyle} transition-all flex items-center justify-between gap-3 ${
                  isToday ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    isHoliday
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
                      : isExam
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                  }`}>
                    {isHoliday ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : isExam ? (
                      <Flag className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs opacity-75 font-mono block">
                      {formatYMDToKorean(event.date)}
                    </span>
                    <h4 className="text-base font-extrabold">{event.eventName}</h4>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {event.dayType && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      isHoliday
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {event.dayType}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
