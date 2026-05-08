import React, { useState, useMemo } from 'react';
import { UserCheck, Calendar, X, Trash2 } from 'lucide-react';
import { isDateInRange, enrichDateInfoWithDay, getRecordCategory, getTodayYMD } from '../utils/helpers';

const DailyLeaveInspector = ({ historyRecords, setRecordToDelete }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayYMD());
  const dateInputRef = React.useRef(null);

  const { cutiRecords, rasmiRecords } = useMemo(() => {
    const list = historyRecords
      .filter(rec => isDateInRange(selectedDate, rec.dateInfo))
      .sort((a, b) => a.teacher.localeCompare(b.teacher));
    
    return {
      cutiRecords: list.filter(r => getRecordCategory(r.type) !== 'RASMI'),
      rasmiRecords: list.filter(r => getRecordCategory(r.type) === 'RASMI')
    };
  }, [historyRecords, selectedDate]);

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative z-20 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <UserCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">每日考勤快查</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
              Quick Daily Leave Inspector
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-300 transition-all">
          {/* Custom Visual Label */}
          <div className="flex items-center gap-3 px-6 py-4 pointer-events-none">
            <Calendar className="text-slate-400" size={18} />
            <span className="text-sm font-black text-slate-700">{formatDate(selectedDate)}</span>
          </div>

          {/* Actual Invisible Date Input Overlay */}
          <input 
            ref={dateInputRef}
            type="date" 
            value={selectedDate}
            onClick={(e) => {
              try {
                if (typeof e.target.showPicker === 'function') {
                  e.target.showPicker();
                }
              } catch (err) {}
            }}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="full-cover-date-indicator absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
          />

          {/* Vertical Divider */}
          <div className="w-px h-4 bg-slate-200" />

          {/* Reset to Today Button - Higher Z-Index */}
          <button 
            type="button"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              setSelectedDate(getTodayYMD()); 
            }} 
            className="relative z-20 px-4 py-4 text-slate-400 hover:text-blue-600 transition-colors"
            title="回今天"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Grid of Absent Teachers */}
      <div className="space-y-10">
        {cutiRecords.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">📁 请假人员 (CUTI)</h3>
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black">{cutiRecords.length}</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {cutiRecords.map((rec, index) => (
                 <div 
                   key={rec.id} 
                    className="group relative bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-500/5 p-6 rounded-[24px] transition-all flex items-start gap-5"
                 >
                   <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                     {index + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="text-[15px] font-black text-slate-800 truncate mb-1 uppercase">
                       {rec.teacher}
                     </h3>
                     <p className="text-[11px] font-black text-orange-500 uppercase tracking-wide leading-tight line-clamp-2">
                       {rec.type}
                     </p>
                     <p className="text-[10px] font-bold text-slate-400 mt-2 font-sans italic">
                       {enrichDateInfoWithDay(rec.dateInfo)}
                     </p>
                   </div>
                    <button
                      onClick={() => setRecordToDelete?.(rec)}
                      className="absolute right-4 top-4 p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="删除记录"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {rasmiRecords.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">💼 职务人员 (CUTI RASMI)</h3>
                <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black">{rasmiRecords.length}</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {rasmiRecords.map((rec, index) => (
                 <div 
                   key={rec.id} 
                    className="group relative bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 p-6 rounded-[24px] transition-all flex items-start gap-5"
                 >
                   <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                     {index + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="text-[15px] font-black text-slate-800 truncate mb-1 uppercase">
                       {rec.teacher}
                     </h3>
                     <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wide leading-tight line-clamp-2">
                       {rec.type}
                     </p>
                     <p className="text-[10px] font-bold text-slate-400 mt-2 font-sans italic">
                       {enrichDateInfoWithDay(rec.dateInfo)}
                     </p>
                   </div>
                    <button
                      onClick={() => setRecordToDelete?.(rec)}
                      className="absolute right-4 top-4 p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="删除记录"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {(cutiRecords.length === 0 && rasmiRecords.length === 0) && (
          <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">此日期暂无任何请假记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLeaveInspector;
