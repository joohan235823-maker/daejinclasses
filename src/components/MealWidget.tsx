import React, { useState } from 'react';
import { MealItem, ThemeMode } from '../types/timetable';
import { formatYMDToKorean, isTodayYMD } from '../utils/dateUtils';
import { Utensils, Flame, Info, Sparkles, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

interface MealWidgetProps {
  theme: ThemeMode;
  meals: MealItem[];
  isLoading: boolean;
  isMockMeal?: boolean;
  statusMessage?: string;
}

const ALLERGY_MAP: Record<string, string> = {
  '1': '난류', '2': '우유', '3': '메밀', '4': '땅콩', '5': '대두',
  '6': '밀', '7': '고등어', '8': '게', '9': '새우', '10': '돼지고기',
  '11': '복숭아', '12': '토마토', '13': '아황산류', '14': '호두', '15': '닭고기',
  '16': '쇠고기', '17': '오징어', '18': '조개류', '19': '잣'
};

export const MealWidget: React.FC<MealWidgetProps> = ({
  theme,
  meals,
  isLoading,
  isMockMeal,
  statusMessage,
}) => {
  const [showAllergyLegend, setShowAllergyLegend] = useState(false);
  const [expandedOriginDate, setExpandedOriginDate] = useState<string | null>(null);

  const cardStyle =
    theme === 'chalkboard'
      ? 'bg-[#0f2d1b] border-emerald-800 text-emerald-100 shadow-md'
      : theme === 'dark'
      ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-md'
      : 'bg-white border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className={`p-4 rounded-2xl border ${cardStyle} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-400/30 flex items-center justify-center font-bold shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold">대진전자통신고등학교 급식 메뉴</h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isMockMeal
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}>
                {isMockMeal ? <AlertCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {isMockMeal ? 'NEIS 예시 샘플' : 'NEIS 나이스 실시간 연동'}
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              부산광역시교육청 나이스(NEIS) 오픈 API (`C10`/`7150597`) 영양실 공식 식단 데이터
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAllergyLegend(!showAllergyLegend)}
          className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center opacity-80 hover:opacity-100"
        >
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>알레르기 번호 안내</span>
          {showAllergyLegend ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Status Notice Banner */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Allergy Legend Panel */}
      {showAllergyLegend && (
        <div className={`p-4 rounded-2xl border ${cardStyle} text-xs space-y-2`}>
          <h4 className="font-extrabold text-amber-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> 알레르기 유발물질 번호 안내 (메뉴 옆 괄호 숫자)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1 font-medium">
            {Object.entries(ALLERGY_MAP).map(([num, label]) => (
              <div key={num} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <span className="font-bold text-amber-500 mr-1">①{num}.</span> {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meals Grid */}
      {isLoading ? (
        <div className={`p-8 text-center rounded-2xl border ${cardStyle} space-y-2`}>
          <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">나이스(NEIS) 급식 서버에서 대진전자통신고 급식을 불러오는 중입니다...</p>
        </div>
      ) : meals.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border ${cardStyle}`}>
          <p className="text-sm opacity-70">선택하신 날짜에 나이스 DB에 등록된 급식 메뉴가 없습니다.</p>
          <p className="text-xs opacity-50 mt-1">주말, 공휴일, 방학 기간 또는 급식 미실시 일자일 수 있습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => {
            const isToday = isTodayYMD(meal.date);
            const isExpandedOrigin = expandedOriginDate === meal.date;

            return (
              <div
                key={meal.date}
                className={`p-5 rounded-2xl border ${cardStyle} flex flex-col justify-between relative overflow-hidden transition-all ${
                  isToday ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                {isToday && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    TODAY 오늘 급식
                  </div>
                )}

                <div>
                  <div className="border-b border-black/10 dark:border-white/10 pb-3 mb-3">
                    <span className="text-xs font-bold opacity-70 block">
                      {meal.mealName}
                    </span>
                    <h4 className="text-base font-extrabold text-indigo-400 dark:text-emerald-300">
                      {formatYMDToKorean(meal.date)}
                    </h4>
                  </div>

                  <ul className="space-y-2 text-sm font-semibold">
                    {meal.dishes.map((dish, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                        <span className="leading-snug">{dish}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Origin Info Drawer */}
                  {meal.originInfo && isExpandedOrigin && (
                    <div className="mt-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs space-y-1">
                      <span className="font-bold text-amber-400 block">🥩 식재료 원산지 정보</span>
                      <p className="opacity-80 text-[11px] leading-relaxed whitespace-pre-wrap">
                        {meal.originInfo}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-80">
                    <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                      <Flame className="w-3.5 h-3.5" />
                      {meal.calories || '칼로리 정보 준비 중'}
                    </span>

                    {meal.originInfo && (
                      <button
                        onClick={() => setExpandedOriginDate(isExpandedOrigin ? null : meal.date)}
                        className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        {isExpandedOrigin ? '원산지 닫기' : '원산지 보기'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
