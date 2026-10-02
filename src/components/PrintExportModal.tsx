import React from 'react';
import { GradeNumber, ThemeMode, TimetableItem } from '../types/timetable';
import { DAY_NAMES, formatDateToDot } from '../utils/dateUtils';
import { Printer, X, Download } from 'lucide-react';

interface PrintExportModalProps {
  theme: ThemeMode;
  grade: GradeNumber;
  classNm: string;
  departmentName?: string;
  mondayDate: Date;
  items: TimetableItem[];
  onClose: () => void;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  grade,
  classNm,
  departmentName,
  mondayDate,
  items,
  onClose,
}) => {
  const fridayDate = new Date(mondayDate);
  fridayDate.setDate(mondayDate.getDate() + 4);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b pb-4 print:hidden">
          <div>
            <h3 className="text-lg font-extrabold text-indigo-950">
              시간표 인쇄 및 보관 미리보기
            </h3>
            <p className="text-xs text-slate-500">
              책상에 붙이거나 인쇄하기에 적합한 시간표 카드입니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-900 text-white hover:bg-indigo-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" /> 인쇄하기
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-timetable" className="p-6 border-2 border-indigo-900 rounded-2xl bg-white space-y-4">
          <div className="flex items-center justify-between border-b-2 border-indigo-900 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                DAEJIN ELECTRONIC COMMUNICATION HIGH SCHOOL
              </span>
              <h2 className="text-2xl font-black text-indigo-950">
                대진전자통신고등학교 시간표
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-indigo-900 block">
                {grade}학년 {classNm}반
              </span>
              <span className="text-xs font-semibold text-slate-600 block">
                {departmentName || '전공학과'}
              </span>
            </div>
          </div>

          {/* Date range */}
          <div className="text-xs text-slate-500 font-semibold text-right">
            적용 기간: {formatDateToDot(mondayDate)} ~ {formatDateToDot(fridayDate)}
          </div>

          {/* Timetable Grid */}
          <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
            <thead>
              <tr className="bg-indigo-950 text-white font-bold border-b-2 border-slate-900">
                <th className="p-2 border-r border-slate-700 w-16">교시</th>
                {DAY_NAMES.slice(1, 6).map((day) => (
                  <th key={day} className="p-2 border-r border-slate-700 last:border-r-0">
                    {day}요일
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y border-slate-900 font-medium">
              {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                <tr key={period} className="divide-x border-slate-900">
                  <td className="p-2 bg-slate-100 font-bold border-slate-900">{period}교시</td>
                  {[1, 2, 3, 4, 5].map((dayOfWeek) => {
                    const matched = items.find(
                      (it) => it.dayOfWeek === dayOfWeek && it.period === period
                    );
                    return (
                      <td key={dayOfWeek} className="p-2 border-slate-900 align-middle font-extrabold text-sm">
                        {matched ? matched.subject : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t">
            <span>발급: 대진전자통신고등학교 실시간 시간표 조회 웹</span>
            <span>창의 · 지성 · 실능을 갖춘 전자통신 명문 고등학교</span>
          </div>
        </div>
      </div>
    </div>
  );
};
