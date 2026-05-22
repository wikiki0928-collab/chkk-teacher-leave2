import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

const TYPE_COLORS = {
  "CUTI REHAT KHAS": "bg-blue-50/80 text-blue-700 border-blue-200/50 hover:bg-blue-100",
  "CUTI REHAT": "bg-blue-50/80 text-blue-700 border-blue-200/50 hover:bg-blue-100",
  "CUTI SAKIT": "bg-red-50/80 text-red-700 border-red-200/50 hover:bg-red-100",
  "TIME-SLIP": "bg-amber-50/80 text-amber-700 border-amber-200/50 hover:bg-amber-100",
  "CUTI BERSALIN": "bg-pink-50/80 text-pink-700 border-pink-200/50 hover:bg-pink-100",
  "CUTI KECEMASAN": "bg-orange-50/80 text-orange-700 border-orange-200/50 hover:bg-orange-100",
  "BENGKEL": "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100",
  "TAKLIMAT": "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100",
  "TUGAS RASMI": "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100",
  "CUTI TANPA REKOD KELOMPOK": "bg-purple-50/80 text-purple-700 border-purple-200/50 hover:bg-purple-100",
  "DEFAULT": "bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100"
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
    const yStr = year;
    const mStr = String(month + 1).padStart(2, '0');
    const viewStartStr = `${yStr}-${mStr}-01`;
    
    const lastDay = new Date(year, month + 1, 0).getDate();
    const viewEndStr = `${yStr}-${mStr}-${String(lastDay).padStart(2, '0')}`;

    return processedRecords.filter(rec => {
      if (!rec.startDate || !rec.endDate) return false;
      
      // Check for overlap: record starts before/on view end AND ends after/on view start
      return rec.startDate <= viewEndStr && rec.endDate >= viewStartStr;
    });
  }, [processedRecords, year, month]);

  const getRecordsForDate = (day) => {
    const yStr = year;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const currentDateStr = `${yStr}-${mStr}-${dStr}`;
    
    return currentMonthRecords.filter(rec => {
      return currentDateStr >= rec.startDate && currentDateStr <= rec.endDate;
    });
  };

  return (
    <>
      {/* Custom Tooltip Overlay */}
      {hoveredRecord && createPortal(
        <div 
          className="fixed z-[999] pointer-events-none hidden md:block" 
          style={{ 
            left: hoveredRecord.x > window.innerWidth / 2 ? hoveredRecord.x - 300 : hoveredRecord.x + 20, 
            top: hoveredRecord.y + 20,
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
            transform: hoveredRecord ? 'scale(1)' : 'scale(0.95)',
            opacity: hoveredRecord ? 1 : 0
          }}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl p-4 min-w-[240px] max-w-[300px] ring-1 ring-black/5 animate-fade-in">
            <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-750 text-[9px] font-black rounded-md uppercase tracking-wider border border-indigo-100/50 mb-2">
              {hoveredRecord.type}
            </span>
            <h4 className="text-base font-black text-slate-800 leading-tight break-words">{hoveredRecord.teacher}</h4>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{hoveredRecord.dateInfo.split('(')[0]}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="space-y-6 animate-fade-in relative">
        {/* Calendar Header */}
        <div className="glass-card p-6 border border-white/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-650 rounded-2xl border border-indigo-200/30">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                {bulanMelayu[month]} {year}
              </h2>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
                Monthly Attendance Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-655 active:scale-90">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToToday} className="px-5 py-2 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl font-black text-xs text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
              今天 (Today)
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-655 active:scale-90">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-2 select-none">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-455">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> CRK / CR
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-455">
            <div className="w-2 h-2 rounded-full bg-red-400"></div> 病假 (Sakit)
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-455">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 公假 (Rasmi)
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-455">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div> TIME-SLIP
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-455">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div> 产假 (Bersalin)
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card border border-white/60 overflow-hidden min-w-[700px] md:min-w-0 shadow-lg">
          <div className="grid grid-cols-7 border-b border-slate-150/80 bg-slate-50/50">
            {hariMelayu.map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-slate-450 uppercase tracking-widest border-r border-slate-100 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-white/30 backdrop-blur-md">
            {/* Empty cells for prev month offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-32 md:h-40 border-r border-b border-slate-100/50 bg-slate-50/10"></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const records = getRecordsForDate(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div 
                  key={day} 
                  className={`h-32 md:h-40 border-r border-b border-slate-100 p-2 space-y-1 relative group hover:bg-indigo-50/20 transition-all duration-300 ${
                    isToday ? 'bg-indigo-50/10' : ''
                  }`}
                >
                  <div className={`flex justify-between items-center mb-1`}>
                    <span 
                      className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                        isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-105' : 'text-slate-450 font-bold'
                      }`}
                    >
                      {day}
                    </span>
                    {records.length > 0 && (
                      <div className="md:hidden w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-[80%] overflow-y-auto no-scrollbar pb-2">
                    {records.map(rec => (
                      <div 
                        key={rec.id} 
                        className={`px-2 py-1 rounded-[10px] text-[9px] font-black border truncate cursor-pointer transition-all duration-200 text-center hover:scale-[1.03] shadow-sm ${
                          TYPE_COLORS[rec.type] || TYPE_COLORS.DEFAULT
                        }`}
                        onMouseEnter={(e) => {
                          setHoveredRecord({ ...rec, x: e.clientX, y: e.clientY });
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
              <div key={`empty-end-${i}`} className="h-32 md:h-40 border-r border-b border-slate-100/50 bg-slate-50/10"></div>
            ))}
          </div>
        </div>

        {/* Info Warning */}
        <div className="flex items-start gap-3 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100/80 backdrop-blur-md">
          <Info className="text-emerald-500 shrink-0" size={16} />
          <p className="text-xs font-semibold text-emerald-700 leading-relaxed">
            <b>提示：</b> 系统已自动解析所有历史记录。只要记录中包含有效的日期信息，它们都会呈现在日历上。
          </p>
        </div>
      </div>
    </>
  );
};

export default CalendarTab;
