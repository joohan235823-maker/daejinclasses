import React, { useState } from 'react';
import { GradeNumber, ThemeMode, TimetableItem } from '../types/timetable';
import { getWeekDays, formatDateToYMD, formatYMDToKorean } from '../utils/dateUtils';
import { X, Save, RotateCcw, Sparkles, Edit, BookOpen } from 'lucide-react';

interface ClassTimetableEditorModalProps {
  theme: ThemeMode;
  grade: GradeNumber;
  classNm: string;
  departmentName: string;
  mondayDate: Date;
  currentItems: TimetableItem[];
  onSaveClassTimetable: (grade: GradeNumber, classNm: string, slots: { dayIdx: number; period: number; subject: string }[]) => void;
  onResetToNeis: () => void;
  onClose: () => void;
}

const DAY_NAMES = ['월요일', '화요일', '수요일', '목요일', '금요일'];

// Major subject shortcuts by department for fast clicking
const DEPARTMENT_PRESETS: Record<string, string[]> = {
  'AI소프트웨어과': ['인공지능기초', '파이썬프로그래밍', 'C프로그래밍', '빅데이터분석', 'AI실습', '공통국어2', '공통수학2', '공통영어2', '미술', '체육2', '진로활동', '동아리활동', '미편성'],
  '스마트소프트웨어과': ['C프로그래밍', '자료구조', '스마트앱개발', '데이터베이스', '웹프로그래밍', '공통국어2', '공통수학2', '공통영어2', '미술', '체육2', '진로활동', '동아리활동', '미편성'],
  '전자통신과': ['디지털 논리 회로', '전자회로', '통신일반', '마이크로컨트롤러', '전자CAD', '공통국어2', '공통수학2', '공통영어2', '미술', '체육2', '진로활동', '동아리활동', '미편성'],
  '전기제어과': ['전기회로', '전기기기', '시퀀스제어', 'PLC제어', '전기설비', '공통국어2', '공통수학2', '공통영어2', '미술', '체육2', '진로활동', '동아리활동', '미편성'],
  '정보통신과': ['정보통신기초', '네트워크', '사물 인터넷과 센서 제어', '서버구축', '리눅스', '공통국어2', '공통수학2', '공통영어2', '미술', '체육2', '진로활동', '동아리활동', '미편성'],
};

export const ClassTimetableEditorModal: React.FC<ClassTimetableEditorModalProps> = ({
  theme,
  grade,
  classNm,
  departmentName,
  mondayDate,
  currentItems,
  onSaveClassTimetable,
  onResetToNeis,
  onClose,
}) => {
  const weekDays = getWeekDays(mondayDate);

  // Grid state: 5 days x 7 periods
  const [gridState, setGridState] = useState<string[][]>(() => {
    const matrix: string[][] = Array.from({ length: 5 }, () => Array(7).fill('미편성'));

    weekDays.forEach((dayDate, dayIdx) => {
      const ymd = formatDateToYMD(dayDate);
      for (let p = 1; p <= 7; p++) {
        const found = currentItems.find((it) => it.date === ymd && it.period === p);
        if (found) {
          matrix[dayIdx][p - 1] = found.subject;
        }
      }
    });

    return matrix;
  });

  const [activeCell, setActiveCell] = useState<{ dayIdx: number; periodIdx: number } | null>(null);

  const handleCellChange = (dayIdx: number, periodIdx: number, value: string) => {
    const updated = gridState.map((dayRow, d) => {
      if (d !== dayIdx) return dayRow;
      return dayRow.map((val, p) => (p === periodIdx ? value : val));
    });
    setGridState(updated);
  };

  const handleApplyPresetSubject = (subjectName: string) => {
    if (activeCell) {
      handleCellChange(activeCell.dayIdx, activeCell.periodIdx, subjectName);
    }
  };

  const handleSave = () => {
    const slots: { dayIdx: number; period: number; subject: string }[] = [];
    gridState.forEach((dayRow, dayIdx) => {
      dayRow.forEach((sub, periodIdx) => {
        slots.push({
          dayIdx,
          period: periodIdx + 1,
          subject: sub.trim() || '미편성',
        });
      });
    });

    onSaveClassTimetable(grade, classNm, slots);
    onClose();
  };

  const modalBg =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-700 text-emerald-100'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100'
      : 'bg-white border-slate-200 text-slate-900';

  const quickPresets = DEPARTMENT_PRESETS[departmentName] || DEPARTMENT_PRESETS['AI소프트웨어과'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl p-5 sm:p-6 rounded-3xl border ${modalBg} shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>대진전자통신고 학급별 시간표 커스텀 편집기</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{grade}학년 {classNm}반 ({departmentName}) 주간 시간표 등록</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetToNeis}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> NEIS 초기화
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Info */}
        <p className="text-xs opacity-80 leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/10 dark:border-white/10">
          💡 **선택하신 {grade}학년 {classNm}반의 각 교시별 과목명을 직접 수정**할 수 있습니다. 입력된 시간표는 브라우저에 저장되어 해당 반 선택 시 바로 적용됩니다.
        </p>

        {/* Quick Subject Shortcuts */}
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-80 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            {departmentName} 추천 과목 빠른 선택 {activeCell ? `(${DAY_NAMES[activeCell.dayIdx]} ${activeCell.periodIdx + 1}교시 선택 중)` : '(셀을 클릭 후 과목을 누르세요)'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => handleApplyPresetSubject(sub)}
                className="px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold transition-all"
              >
                + {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Editor Table */}
        <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-2xl">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-black/10 dark:bg-white/10 font-bold border-b border-black/10 dark:border-white/10">
                <th className="p-2 w-16">교시</th>
                {weekDays.map((d, idx) => (
                  <th key={idx} className="p-2">
                    <div>{DAY_NAMES[idx]}</div>
                    <div className="text-[10px] opacity-70 font-normal">{formatYMDToKorean(formatDateToYMD(d)).split(' ')[0]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 7 }, (_, pIdx) => (
                <tr key={pIdx} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="p-2 font-bold opacity-75 bg-black/5 dark:bg-white/5">
                    {pIdx + 1}교시
                  </td>
                  {Array.from({ length: 5 }, (_, dIdx) => {
                    const currentVal = gridState[dIdx][pIdx];
                    const isSelected = activeCell?.dayIdx === dIdx && activeCell?.periodIdx === pIdx;

                    return (
                      <td key={dIdx} className={`p-1.5 ${isSelected ? 'ring-2 ring-amber-400 bg-amber-500/10' : ''}`}>
                        <input
                          type="text"
                          value={currentVal}
                          onFocus={() => setActiveCell({ dayIdx: dIdx, periodIdx: pIdx })}
                          onChange={(e) => handleCellChange(dIdx, pIdx, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-center font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-extrabold hover:bg-black/5"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" /> {grade}학년 {classNm}반 시간표 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
