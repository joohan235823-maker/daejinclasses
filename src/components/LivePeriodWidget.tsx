import React, { useState, useEffect } from 'react';
import { ThemeMode, TimetableItem } from '../types/timetable';
import { getCurrentPeriodStatus } from '../utils/dateUtils';
import { Clock, Bell, ArrowRight, Utensils, Zap, Sparkles } from 'lucide-react';

interface LivePeriodWidgetProps {
  theme: ThemeMode;
  todayItems: TimetableItem[];
  isTodayInSelectedWeek: boolean;
}

export const LivePeriodWidget: React.FC<LivePeriodWidgetProps> = ({
  theme,
  todayItems,
  isTodayInSelectedWeek,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Update every 10 sec
    return () => clearInterval(timer);
  }, []);

  if (!isTodayInSelectedWeek) {
    return null; // Only show live widget when looking at current week
  }

  const periodStatus = getCurrentPeriodStatus(now);

  const getSubjectForPeriod = (pNum?: number) => {
    if (!pNum) return null;
    return todayItems.find((item) => item.period === pNum);
  };

  const currentSubjectItem = getSubjectForPeriod(periodStatus.currentPeriod);
  const nextSubjectItem = getSubjectForPeriod(periodStatus.nextPeriod);

  const cardStyle =
    theme === 'chalkboard'
      ? 'bg-[#154227] border-emerald-700/80 text-emerald-100 shadow-lg'
      : theme === 'dark'
      ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md'
      : 'bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 border-indigo-800 text-white shadow-md';

  return (
    <div className={`p-4 rounded-2xl border ${cardStyle} transition-all duration-200`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Status Area */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-3 rounded-xl shrink-0 ${
            periodStatus.status === 'class'
              ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
              : periodStatus.status === 'lunch'
              ? 'bg-emerald-500 text-white font-black'
              : 'bg-white/10 text-white'
          }`}>
            {periodStatus.status === 'lunch' ? (
              <Utensils className="w-6 h-6" />
            ) : periodStatus.status === 'class' ? (
              <Zap className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                LIVE 실시간 교시 현황
              </span>
              <span className="text-xs opacity-60">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="mt-0.5">
              {periodStatus.status === 'class' && (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-extrabold text-amber-300">
                    {periodStatus.currentPeriod}교시 진행 중
                  </span>
                  {currentSubjectItem && (
                    <span className="text-base font-bold underline decoration-amber-400 decoration-2 underline-offset-4">
                      {currentSubjectItem.subject}
                    </span>
                  )}
                  {periodStatus.timeRange && (
                    <span className="text-xs opacity-75">({periodStatus.timeRange})</span>
                  )}
                </div>
              )}

              {periodStatus.status === 'break' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-emerald-300">쉬는 시간</span>
                  <span className="text-xs opacity-80">
                    (다음: {periodStatus.nextPeriod}교시 {nextSubjectItem?.subject})
                  </span>
                </div>
              )}

              {periodStatus.status === 'lunch' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-emerald-300">점심시간 🍱</span>
                  <span className="text-xs opacity-80">(12:50 ~ 13:50)</span>
                </div>
              )}

              {periodStatus.status === 'before_school' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold">등교 시간 전</span>
                  <span className="text-xs opacity-80">(1교시 시작 09:00)</span>
                </div>
              )}

              {periodStatus.status === 'after_school' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-slate-300">방과 후 / 하교 완료 🎒</span>
                  <span className="text-xs opacity-75">오늘도 수고 많으셨습니다!</span>
                </div>
              )}

              {periodStatus.status === 'weekend' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-amber-300">즐거운 주말 ☀️</span>
                  <span className="text-xs opacity-75">다음 주 시간표를 확인해보세요</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Preview / Countdown Area */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
          {periodStatus.minutesRemaining !== undefined && (
            <div className="text-right">
              <span className="text-[11px] block opacity-75 font-medium">남은 시간</span>
              <span className="text-xl font-black text-amber-400 font-mono tracking-tight">
                {periodStatus.minutesRemaining}분
              </span>
            </div>
          )}

          {nextSubjectItem && periodStatus.status !== 'after_school' && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs">
              <div>
                <span className="block text-[10px] opacity-70">다음 {periodStatus.nextPeriod}교시</span>
                <span className="font-bold text-white max-w-[120px] truncate block">
                  {nextSubjectItem.subject}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
