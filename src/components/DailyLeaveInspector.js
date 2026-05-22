import React, { useState, useMemo } from 'react';
import { UserCheck, Calendar, X, Trash2, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { isDateInRange, enrichDateInfoWithDay, getRecordCategory, getTodayYMD } from '../utils/helpers';

const DailyLeaveInspector = ({ historyRecords, setRecordToDelete }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayYMD());
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
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

  const shiftDate = (days) => {
    if (!selectedDate) return;
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + days);
    
    // Format back to YYYY-MM-DD
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const getBadgeStyle = (type) => {
    const category = getRecordCategory(type);
    if (category === 'SAKIT') return 'bg-rose-50/70 text-rose-600 border border-rose-100/50';
    if (category === 'CRK_CR') return 'bg-amber-50/70 text-amber-600 border border-amber-100/50';
    if (category === 'TIMESLIP') return 'bg-sky-50/70 text-sky-650 border border-sky-100/50';
    if (category === 'BERSALIN') return 'bg-fuchsia-50/70 text-fuchsia-600 border border-fuchsia-100/50';
    if (category === 'RASMI') return 'bg-emerald-50/70 text-emerald-600 border border-emerald-100/50';
    return 'bg-slate-50 text-slate-600 border border-slate-200/50';
  };

  return (
    <div className="relative z-20 glass-card rounded-[32px] p-8 border border-white/60 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-650 rounded-2xl border border-indigo-200/30">
            <UserCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-805 tracking-tight">每日考勤快查</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
              Quick Daily Leave Inspector
            </p>
          </div>
        </div>

        {/* Controls Container */}
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100/80 p-1 rounded-[18px] border border-slate-200/40">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 py-2 px-4 rounded-[14px] font-black text-xs transition-all whitespace-nowrap active:scale-95 ${
                viewMode === 'table' 
                  ? 'bg-white text-indigo-650 shadow-sm shadow-indigo-100/30 border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="表格视图 (清晰精简，适合人多)"
            >
              <List size={14} /> 紧凑表格
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 py-2 px-4 rounded-[14px] font-black text-xs transition-all whitespace-nowrap active:scale-95 ${
                viewMode === 'card' 
                  ? 'bg-white text-indigo-650 shadow-sm shadow-indigo-100/30 border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="卡片视图"
            >
              <LayoutGrid size={14} /> 详情卡片
            </button>
          </div>

          {/* Date Selector Group with Stepping Chevrons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-[18px] text-slate-400 shadow-sm hover:shadow active:scale-90 transition-all duration-200"
              title="前一天"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="relative flex items-center bg-white border border-slate-200 rounded-[20px] hover:border-indigo-300 hover:shadow-sm transition-all duration-300">
              {/* Custom Visual Label */}
              <div className="flex items-center gap-3 px-6 py-3.5 pointer-events-none">
                <Calendar className="text-indigo-500" size={18} />
                <span className="text-sm font-black text-slate-750">{formatDate(selectedDate)}</span>
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

              {/* Reset to Today Button */}
              <button 
                type="button"
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation(); 
                  setSelectedDate(getTodayYMD()); 
                }} 
                className="relative z-20 px-4 py-3.5 text-slate-450 hover:text-rose-500 transition-colors"
                title="回今天"
              >
                <X size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-[18px] text-slate-400 shadow-sm hover:shadow active:scale-90 transition-all duration-200"
              title="后一天"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Absent Teachers */}
      <div className="space-y-10">
        {cutiRecords.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">📁 请假人员 (CUTI)</h3>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black">{cutiRecords.length}</span>
             </div>
             
             {viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-[20px] border border-slate-100 shadow-sm bg-white/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">姓名</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">请假种类</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">日期与详情</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {cutiRecords.map((rec, index) => (
                        <tr key={rec.id} className="hover:bg-white/60 transition-colors">
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                          <td className="py-3.5 px-4 text-sm font-black text-slate-800 uppercase">{rec.teacher}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${getBadgeStyle(rec.type)}`}>
                              {rec.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-400 font-sans italic">{enrichDateInfoWithDay(rec.dateInfo)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setRecordToDelete?.(rec)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="删除记录"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cutiRecords.map((rec, index) => (
                    <div 
                      key={rec.id} 
                      className="group relative bg-white/40 hover:bg-white border border-slate-100 hover:border-indigo-100/80 hover:shadow-lg hover:shadow-indigo-100/30 p-6 rounded-[24px] transition-all duration-300 flex items-start gap-5 hover:-translate-y-0.5"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-indigo-500 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-black text-slate-800 truncate mb-2.5 uppercase">
                          {rec.teacher}
                        </h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${getBadgeStyle(rec.type)}`}>
                          {rec.type}
                        </span>
                        <p className="text-[10px] font-bold text-slate-450 mt-3 font-sans italic">
                          {enrichDateInfoWithDay(rec.dateInfo)}
                        </p>
                      </div>
                      <button
                        onClick={() => setRecordToDelete?.(rec)}
                        className="absolute right-4 top-4 p-2 rounded-xl text-slate-350 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="删除记录"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {rasmiRecords.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">💼 职务人员 (CUTI RASMI)</h3>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black">{rasmiRecords.length}</span>
             </div>

             {viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-[20px] border border-slate-100 shadow-sm bg-white/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">姓名</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">职务内容</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">日期与详情</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {rasmiRecords.map((rec, index) => (
                        <tr key={rec.id} className="hover:bg-white/60 transition-colors">
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                          <td className="py-3.5 px-4 text-sm font-black text-slate-800 uppercase">{rec.teacher}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${getBadgeStyle(rec.type)}`}>
                              {rec.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-400 font-sans italic">{enrichDateInfoWithDay(rec.dateInfo)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setRecordToDelete?.(rec)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="删除记录"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rasmiRecords.map((rec, index) => (
                    <div 
                      key={rec.id} 
                      className="group relative bg-white/40 hover:bg-white border border-slate-100 hover:border-indigo-100/80 hover:shadow-lg hover:shadow-indigo-100/30 p-6 rounded-[24px] transition-all duration-300 flex items-start gap-5 hover:-translate-y-0.5"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-indigo-500 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-black text-slate-800 truncate mb-2.5 uppercase">
                          {rec.teacher}
                        </h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${getBadgeStyle(rec.type)}`}>
                          {rec.type}
                        </span>
                        <p className="text-[10px] font-bold text-slate-450 mt-3 font-sans italic">
                          {enrichDateInfoWithDay(rec.dateInfo)}
                        </p>
                      </div>
                      <button
                        onClick={() => setRecordToDelete?.(rec)}
                        className="absolute right-4 top-4 p-2 rounded-xl text-slate-350 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="删除记录"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {(cutiRecords.length === 0 && rasmiRecords.length === 0) && (
          <div className="py-12 flex flex-col items-center justify-center bg-white/40 rounded-[24px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">此日期暂无任何请假记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLeaveInspector;
