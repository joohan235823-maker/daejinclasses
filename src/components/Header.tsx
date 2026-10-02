import React from 'react';
import { ThemeMode } from '../types/timetable';
import { Moon, Sun, BookOpen, Printer, RefreshCw, Settings, Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  activeTab: 'weekly' | 'daily' | 'meal' | 'schedule' | 'memos';
  onTabChange: (tab: 'weekly' | 'daily' | 'meal' | 'schedule' | 'memos') => void;
  onOpenPrint: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isMockData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  activeTab,
  onTabChange,
  onOpenPrint,
  onOpenSettings,
  onRefresh,
  isRefreshing,
  isMockData,
}) => {
  return (
    <header className={`sticky top-0 z-30 transition-colors duration-200 border-b ${
      theme === 'chalkboard'
        ? 'bg-[#0f2d1b] border-emerald-800/60 text-emerald-100 shadow-lg shadow-black/20'
        : theme === 'dark'
        ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-md'
        : 'bg-indigo-950 border-indigo-900 text-white shadow-md'
    }`}>
      {/* Top Main Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          {/* School Emblem / Badge Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border ${
            theme === 'chalkboard'
              ? 'bg-emerald-900/80 border-emerald-600 text-emerald-200'
              : 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300/40 text-slate-950'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight font-sans">
                대진전자통신고등학교
              </h1>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1 ${
                isMockData
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {isMockData ? 'NEIS 샘플모드' : 'NEIS 실시간 연동'}
              </span>
            </div>
            <p className="text-xs opacity-75 font-medium hidden xs:block">
              Daejin Electronic Communication High School Timetable
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Selector Buttons */}
          <div className="flex items-center p-1 rounded-lg bg-black/20 border border-white/10 text-xs font-medium">
            <button
              onClick={() => onThemeChange('classic')}
              title="클래식 학원 모드"
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                theme === 'classic'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden md:inline">네이비</span>
            </button>

            <button
              onClick={() => onThemeChange('chalkboard')}
              title="칠판 학교 모드"
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                theme === 'chalkboard'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">칠판</span>
            </button>

            <button
              onClick={() => onThemeChange('dark')}
              title="다크 모드"
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">다크</span>
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="시간표 새로고침"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenPrint}
            title="시간표 인쇄 및 이미지 보관"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/10 hidden xs:flex items-center gap-1.5 text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">시간표 인쇄</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="설정 및 NEIS 키"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className={`border-t px-4 sm:px-6 lg:px-8 ${
        theme === 'chalkboard'
          ? 'border-emerald-800/40 bg-[#0d2617]'
          : theme === 'dark'
          ? 'border-slate-800 bg-slate-900/80'
          : 'border-indigo-900/60 bg-indigo-900/50'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onTabChange('weekly')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md whitespace-nowrap transition-all border ${
              activeTab === 'weekly'
                ? theme === 'chalkboard'
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-sm'
                  : 'bg-white text-indigo-950 border-white shadow-sm font-bold'
                : 'text-white/70 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            📅 주간 시간표
          </button>

          <button
            onClick={() => onTabChange('daily')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md whitespace-nowrap transition-all border ${
              activeTab === 'daily'
                ? theme === 'chalkboard'
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-sm'
                  : 'bg-white text-indigo-950 border-white shadow-sm font-bold'
                : 'text-white/70 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            📆 일간 시간표
          </button>

          <button
            onClick={() => onTabChange('meal')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md whitespace-nowrap transition-all border ${
              activeTab === 'meal'
                ? theme === 'chalkboard'
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-sm'
                  : 'bg-white text-indigo-950 border-white shadow-sm font-bold'
                : 'text-white/70 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            🍱 오늘의 급식
          </button>

          <button
            onClick={() => onTabChange('schedule')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md whitespace-nowrap transition-all border ${
              activeTab === 'schedule'
                ? theme === 'chalkboard'
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-sm'
                  : 'bg-white text-indigo-950 border-white shadow-sm font-bold'
                : 'text-white/70 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            🏫 학사 일정
          </button>

          <button
            onClick={() => onTabChange('memos')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md whitespace-nowrap transition-all border ${
              activeTab === 'memos'
                ? theme === 'chalkboard'
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-sm'
                  : 'bg-white text-indigo-950 border-white shadow-sm font-bold'
                : 'text-white/70 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            📌 과제 & 메모
          </button>
        </div>
      </div>
    </header>
  );
};
