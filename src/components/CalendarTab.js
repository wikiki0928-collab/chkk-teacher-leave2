import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

const TYPE_COLORS = {
  "CUTI REHAT KHAS": "bg-blue-100 text-blue-700 border-blue-200",
  "CUTI REHAT": "bg-blue-100 text-blue-700 border-blue-200",
  "CUTI SAKIT": "bg-red-100 text-red-700 border-red-200",
  "TIME-SLIP": "bg-amber-100 text-amber-700 border-amber-200",
  "CUTI BERSALIN": "bg-pink-100 text-pink-700 border-pink-200",
  "CUTI KECEMASAN": "bg-orange-100 text-orange-700 border-orange-200",
  "BENGKEL": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "TAKLIMAT": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "TUGAS RASMI": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "CUTI TANPA REKOD KELOMPOK": "bg-purple-100 text-purple-700 border-purple-200",
  "DEFAULT": "bg-slate-100 text-slate-700 border-slate-200"
};

const CalendarTab = ({ historyRecords, bulanMelayu, hariMelayu }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [hoveredRecord, setHoveredRecord] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => setViewDate(new Date());

  // Process all records to ensure they have startDate/endDate (fallback to dateInfo parsing)
  const processedRecords = useMemo(() => {
    return historyRecords.map(rec => {
      if (rec.startDate && rec.endDate) return rec;

      // Fallback: parse from dateInfo string (format: DD.MM.YYYY)
      const dateMatches = (rec.dateInfo || '').match(/(\d{2})\.(\d{2})\.(\d{4})/g);
      if (dateMatches && dateMatches[0]) {
        const [d1, m1, y1] = dateMatches[0].split('.');
        const startDate = `${y1}-${m1}-${d1}`;
        let endDate = startDate;
        if (dateMatches[1]) {
          const [d2, m2, y2] = dateMatches[1].split('.');
          endDate = `${y2}-${m2}-${d2}`;
        }
        return { ...rec, startDate, endDate };
      }
      return rec;
    });
  }, [historyRecords]);

  // Filter and process records for the current view
  const currentMonthRecords = useMemo(() => {
    return processedRecords.filter(rec => {
      if (!rec.startDate || !rec.endDate) return false;
      
      const s = new Date(rec.startDate);
      const e = new Date(rec.endDate);
      const viewStart = new Date(year, month, 1);
      const viewEnd = new Date(year, month + 1, 0);

      // Check for overlap
      return s <= viewEnd && e >= viewStart;
    });
  }, [processedRecords, year, month]);

  const getRecordsForDate = (day) => {
    const d = new Date(year, month, day);
    const dStr = d.toISOString().split('T')[0];
    
    return currentMonthRecords.filter(rec => {
      return dStr >= rec.startDate && dStr <= rec.endDate;
    });
  };

  return (
    <>
      {/* Custom Tooltip Overlay - MOVED OUTSIDE ANIMATED CONTAINER */}
      {hoveredRecord && (
        <div 
          className="fixed z-[999] pointer-events-none hidden md:block" 
          style={{ 
            left: hoveredRecord.x > window.innerWidth / 2 ? hoveredRecord.x - 240 : hoveredRecord.x + 20, 
            top: hoveredRecord.y + 20,
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
            transform: hoveredRecord ? 'scale(1)' : 'scale(0.95)',
            opacity: hoveredRecord ? 1 : 0
          }}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-4 min-w-[220px] max-w-[280px] ring-1 ring-black/5">
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">{hoveredRecord.type}</p>
            <h4 className="text-lg font-black text-slate-800 leading-tight break-words">{hoveredRecord.teacher}</h4>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{hoveredRecord.dateInfo.split('(')[0]}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in duration-500 relative">
        {/* Calendar Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {bulanMelayu[month]} {year}
            </h2>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
              Monthly Attendance Overiew
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-6 py-2 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all">
            今天 (Today)
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-2">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div> CRK/CR
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
          <div className="w-2 h-2 rounded-full bg-red-400"></div> 病假 (Sakit)
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 公假 (Rasmi)
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div> TIME-SLIP
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-w-[700px] md:min-w-0">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {hariMelayu.map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* Empty cells for prev month offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 md:h-40 border-r border-b border-slate-50 bg-slate-50/20"></div>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const records = getRecordsForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div key={day} className={`h-32 md:h-40 border-r border-b border-slate-100 p-2 space-y-1 relative group hover:bg-blue-50/20 transition-colors ${isToday ? 'bg-blue-50/10' : ''}`}>
                <div className={`flex justify-between items-center mb-1`}>
                  <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  {records.length > 0 && (
                    <div className="md:hidden w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  )}
                </div>

                <div className="space-y-1 max-h-[85%] overflow-y-auto no-scrollbar pb-2">
                  {records.map(rec => (
                    <div 
                      key={rec.id} 
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border truncate cursor-pointer transition-all text-center hover:scale-105 hover:shadow-md ${TYPE_COLORS[rec.type] || TYPE_COLORS.DEFAULT}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRecord({ ...rec, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setHoveredRecord(null)}
                    >
                      {rec.teacher.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Fill the remaining cells */}
          {Array.from({ length: (7 - (daysInMonth + firstDayOfMonth) % 7) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-32 md:h-40 border-r border-b border-slate-50 bg-slate-50/20"></div>
          ))}
        </div>
      </div>

      {/* Info Warning */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <Info className="text-emerald-500 shrink-0" size={18} />
        <p className="text-xs font-semibold text-emerald-700 leading-relaxed">
          <b>提示：</b> 系统已自动解析所有历史记录。只要记录中包含有效的日期信息，它们都会呈现在日历上。
        </p>
      </div>
      </div>
    </>
  );
};

export default CalendarTab;
