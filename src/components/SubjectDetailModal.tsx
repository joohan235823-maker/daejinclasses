import React, { useState } from 'react';
import { StudentMemo, ThemeMode, TimetableItem } from '../types/timetable';
import { formatYMDToKorean } from '../utils/dateUtils';
import { X, MessageSquare, Plus, Check, Trash2, Calendar, User, MapPin, Sparkles, Edit3, Save } from 'lucide-react';

interface SubjectDetailModalProps {
  theme: ThemeMode;
  item: TimetableItem | { date: string; period: number; dayOfWeek: number };
  memos: StudentMemo[];
  onAddMemo: (timetableId: string, text: string, isHomework: boolean) => void;
  onToggleMemo: (memoId: string) => void;
  onDeleteMemo: (memoId: string) => void;
  onSaveSubjectOverride?: (date: string, period: number, subject: string, teacher?: string, classroom?: string) => void;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  theme,
  item,
  memos,
  onAddMemo,
  onToggleMemo,
  onDeleteMemo,
  onSaveSubjectOverride,
  onClose,
}) => {
  const [memoText, setMemoText] = useState('');
  const [isHomework, setIsHomework] = useState(false);

  // Subject Edit Mode state
  const isFullItem = 'subject' in item;
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [customSubject, setCustomSubject] = useState(isFullItem ? item.subject : '');
  const [customTeacher, setCustomTeacher] = useState(isFullItem ? item.teacher || '' : '');
  const [customClassroom, setCustomClassroom] = useState(isFullItem ? item.classroom || '' : '');

  const timetableId = isFullItem
    ? item.id
    : `${item.date}_P${item.period}_custom`;

  const cellMemos = memos.filter((m) => m.timetableId.includes(`${item.date}_P${item.period}`));

  const handleSubmitMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoText.trim()) return;
    onAddMemo(timetableId, memoText.trim(), isHomework);
    setMemoText('');
    setIsHomework(false);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSubject.trim() && onSaveSubjectOverride) {
      onSaveSubjectOverride(
        item.date,
        item.period,
        customSubject.trim(),
        customTeacher.trim() || undefined,
        customClassroom.trim() || undefined
      );
      setIsEditingSubject(false);
    }
  };

  const modalBg =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-700 text-emerald-100'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full max-w-lg p-6 rounded-3xl border ${modalBg} shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs opacity-75 font-mono mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatYMDToKorean(item.date)} {item.period}교시</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {isFullItem ? item.subject : `${item.period}교시 수업`}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Item Metadata / Custom Subject Editor */}
        {!isEditingSubject ? (
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2 text-xs font-medium relative">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-bold text-indigo-400 dark:text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                {isFullItem ? item.department || '대진전자통신고' : '대진전자통신고'}
              </span>

              {onSaveSubjectOverride && (
                <button
                  onClick={() => setIsEditingSubject(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> 과목 정보 직접 수정
                </button>
              )}
            </div>

            {isFullItem && (
              <div className="flex flex-wrap gap-4 pt-1 text-sm">
                {item.teacher && (
                  <span className="flex items-center gap-1.5 opacity-90 font-bold">
                    <User className="w-4 h-4 text-amber-400" />
                    담당 교사: {item.teacher}
                  </span>
                )}
                {item.classroom && (
                  <span className="flex items-center gap-1.5 opacity-90 font-bold">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    강의실: {item.classroom}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveSubject} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs">
            <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 text-sm">
              <Edit3 className="w-4 h-4" /> {item.period}교시 과목 정보 직접 수정
            </h4>
            
            <div className="space-y-2">
              <div>
                <label className="font-bold opacity-80 block mb-1">과목명 *</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="예: 인공지능기초실습, C프로그래밍"
                  className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold bg-white text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold opacity-80 block mb-1">담당 교사</label>
                  <input
                    type="text"
                    value={customTeacher}
                    onChange={(e) => setCustomTeacher(e.target.value)}
                    placeholder="예: 김선생님"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold opacity-80 block mb-1">강의실/실습실</label>
                  <input
                    type="text"
                    value={customClassroom}
                    onChange={(e) => setCustomClassroom(e.target.value)}
                    placeholder="예: AI 1실습실"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingSubject(false)}
                className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> 저장하기
              </button>
            </div>
          </form>
        )}

        {/* Existing Memos List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            등록된 메모 & 과제 ({cellMemos.length})
          </h4>

          {cellMemos.length === 0 ? (
            <p className="text-xs opacity-60 italic py-2">
              이 교시에 아직 등록된 개인 메모나 과제가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {cellMemos.map((memo) => (
                <div
                  key={memo.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    memo.completed
                      ? 'bg-black/5 dark:bg-white/5 opacity-60 border-transparent line-through'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => onToggleMemo(memo.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        memo.completed
                          ? 'bg-amber-500 border-amber-500 text-slate-950'
                          : 'border-black/20 dark:border-white/20'
                      }`}
                    >
                      {memo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      {memo.isHomework && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 mb-1 inline-block">
                          과제
                        </span>
                      )}
                      <p className="text-sm font-semibold">{memo.text}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMemo(memo.id)}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Memo Form */}
        <form onSubmit={handleSubmitMemo} className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold opacity-85">새 메모/과제 작성</label>
            <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isHomework}
                onChange={(e) => setIsHomework(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-amber-400">과제로 표시</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="예: 계산기 챙기기, 32페이지 실습 보고서 제출"
              className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={!memoText.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
