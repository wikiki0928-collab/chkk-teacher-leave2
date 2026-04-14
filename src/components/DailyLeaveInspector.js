import React, { useState, useMemo } from 'react';
import { UserCheck, Calendar, X } from 'lucide-react';
import { isDateInRange, enrichDateInfoWithDay } from '../utils/helpers';

const DailyLeaveInspector = ({ historyRecords }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = React.useRef(null);

  const filteredRecords = useMemo(() => {
    return historyRecords
      .filter(rec => isDateInRange(selectedDate, rec.dateInfo))
      .sort((a, b) => a.teacher.localeCompare(b.teacher));
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
        <div className="relative group">
          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl group-hover:border-blue-200 transition-all cursor-pointer"
          >
            <Calendar className="text-slate-400" size={18} />
            <span className="text-sm font-black text-slate-700">{formatDate(selectedDate)}</span>
            <input 
              ref={dateInputRef}
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
            <div className="ml-2 w-px h-4 bg-slate-200" />
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedDate(new Date().toISOString().split('T')[0]); }} 
              className="relative z-30 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Absent Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((rec, index) => (
            <div 
              key={rec.id} 
              className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 p-6 rounded-[24px] transition-all flex items-start gap-5"
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
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">今天暂无任何请假记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLeaveInspector;
