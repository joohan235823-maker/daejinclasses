import React, { useState } from 'react';
import { ThemeMode } from '../types/timetable';
import { X, Key, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  theme: ThemeMode;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  apiKey,
  onSaveApiKey,
  onClearData,
  onClose,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const modalBg =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-700 text-emerald-100'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-6 rounded-3xl border ${modalBg} shadow-2xl space-y-5`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            시간표 서비스 설정
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NEIS API Key Input */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-bold opacity-80 block mb-1">
              NEIS Open API 키 (선택 사항)
            </label>
            <p className="text-[11px] opacity-60 mb-2">
              기본적으로 공공 샘플 키로 작동하며, 개인 키를 입력하면 트래픽 제한 없이 연동됩니다.
            </p>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="NEIS API Key 입력..."
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center justify-between">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 저장되었습니다
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-colors"
            >
              설정 저장
            </button>
          </div>
        </form>

        {/* Reset / Clear Data */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> 데이터 초기화
          </h4>
          <p className="text-[11px] opacity-60">
            저장된 내 학급 설정과 입력한 과제/메모를 모두 삭제합니다.
          </p>
          <button
            onClick={() => {
              if (confirm('저장된 학급과 메모 데이터를 초기화하시겠습니까?')) {
                onClearData();
                onClose();
              }
            }}
            className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> 내 저장 데이터 초기화
          </button>
        </div>
      </div>
    </div>
  );
};
