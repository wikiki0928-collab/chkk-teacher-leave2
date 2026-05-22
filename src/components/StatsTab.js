import React, { useState, useMemo } from 'react';
import { BarChart3, Database, Printer, Loader2, Search, MousePointerClick, CalendarDays, UserCheck, Calendar, X, Pencil } from 'lucide-react';
import { isDateInRange, enrichDateInfoWithDay, getRecordCategory, getTodayYMD } from '../utils/helpers';

const StatsTab = ({
  setShowBaselineModal,
  exportToPDF,
  isExporting,
  statSortMode,
  setStatSortMode,
  statSearch,
  setStatSearch,
  statMonth,
  setStatMonth,
  statYear,
  setStatYear,
  bulanMelayu,
  availableYears,
  tableRef,
  bulanString,
  sortedAndFilteredStats,
  setDetailView,
  setRecordToEdit,
  baselineCuti,
  filteredSjkcStats,
  historyRecords
}) => {
  const [dailySearchDate, setDailySearchDate] = useState(() => getTodayYMD());

  const { cutiRecords, rasmiRecords } = useMemo(() => {
    if (!dailySearchDate) return { cutiRecords: [], rasmiRecords: [] };
    const list = historyRecords.filter(rec => isDateInRange(dailySearchDate, rec.dateInfo));
    return {
      cutiRecords: list.filter(r => getRecordCategory(r.type) !== 'RASMI'),
      rasmiRecords: list.filter(r => getRecordCategory(r.type) === 'RASMI')
    };
  }, [dailySearchDate, historyRecords]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Control Bar */}
      <div className="glass-card p-6 flex flex-col xl:flex-row justify-between items-center gap-6 border border-white/60">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-150 text-indigo-650 rounded-2xl border border-indigo-100/30">
              <BarChart3 size={24}/>
           </div>
           <div>
             <h3 className="font-black text-slate-800 text-lg">考勤统计分析</h3>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Monthly Attendance Analytics</p>
           </div>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center flex-wrap justify-end">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                 <input 
                  type="text" 
                  placeholder="搜索教师姓名..." 
                  value={statSearch} 
                  onChange={e => setStatSearch(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" 
                 />
              </div>
              
              <select 
                value={statSortMode} 
                onChange={e => setStatSortMode(e.target.value)} 
                className="hidden sm:block px-4 py-3 bg-white/80 text-slate-600 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="alphabet">排序: A-Z</option>
                <option value="cuti_desc">排序: 假期多到少</option>
                <option value="rasmi_desc">排序: 公事多到少</option>
              </select>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 w-full sm:w-auto">
              <select value={statMonth} onChange={e => setStatMonth(e.target.value)} className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-800 rounded-xl font-black text-xs outline-none shadow-sm cursor-pointer border border-transparent hover:border-indigo-200 transition-all">
                {bulanMelayu.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select value={statYear} onChange={e => setStatYear(e.target.value)} className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-800 rounded-xl font-black text-xs outline-none shadow-sm cursor-pointer border border-transparent hover:border-indigo-200 transition-all ml-1">
                {availableYears.map(y => <option key={y} value={y}>{y} 年</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setShowBaselineModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs text-indigo-700 bg-indigo-50/80 border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all shadow-sm"
                title="导入上个月结转的数据"
              >
                <Database size={14} /> 导入底数
              </button>

              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs text-white shadow-lg transition-all active:scale-95 ${isExporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-teal-600/20 shadow-md'}`}
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                {isExporting ? '生成中' : 'PDF 导出'}
              </button>
            </div>
         </div>
      </div>

      {/* Daily Check Section */}
      <div className="glass-card p-8 border border-white/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-2xl border border-amber-200/30">
               <UserCheck size={24}/>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">每日考勤快查</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Quick Daily Leave Inspector</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto shadow-sm">
            <Calendar size={16} className="ml-2.5 text-slate-400"/>
            <input 
              type="date" 
              value={dailySearchDate} 
              onChange={e => setDailySearchDate(e.target.value)} 
              className="bg-transparent border-none outline-none font-bold text-slate-700 py-1.5 px-1 text-xs w-full md:w-36"
            />
            {dailySearchDate && (
              <button onClick={() => setDailySearchDate("")} className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 transition-all">
                <X size={14}/>
              </button>
            )}
          </div>
        </div>

        {dailySearchDate ? (
          <div className="space-y-10 animate-fade-in">
            {cutiRecords.length > 0 && (
              <div className="space-y-4">
                 <div className="flex items-center gap-2.5 border-l-4 border-amber-500 pl-3.5">
                    <h3 className="text-xs font-black text-slate-655 uppercase tracking-widest">📁 请假人员 (CUTI)</h3>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black">{cutiRecords.length}</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {cutiRecords.map((rec, idx) => (
                     <div key={idx} className="bg-white/60 hover:bg-white/95 p-5 rounded-[22px] border border-slate-100/80 flex items-start justify-between gap-4 hover:border-amber-200/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 group relative">
                        <div className="flex items-start gap-4 overflow-hidden">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center font-black text-amber-700 text-xs flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                             {idx + 1}
                          </div>
                          <div className="overflow-hidden">
                             <h4 className="font-black text-slate-800 text-sm truncate">{rec.teacher}</h4>
                             <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded-md mt-1 uppercase tracking-wider border border-rose-100/50 truncate max-w-full">
                               {rec.type}
                             </span>
                             <p className="text-[9px] text-slate-400 font-extrabold mt-2 uppercase italic">{enrichDateInfoWithDay(rec.dateInfo)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setRecordToEdit(rec)}
                          className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="修改记录"
                        >
                          <Pencil size={14}/>
                        </button>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {rasmiRecords.length > 0 && (
              <div className="space-y-4">
                 <div className="flex items-center gap-2.5 border-l-4 border-emerald-500 pl-3.5">
                    <h3 className="text-xs font-black text-slate-655 uppercase tracking-widest">💼 职务人员 (CUTI RASMI)</h3>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black">{rasmiRecords.length}</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {rasmiRecords.map((rec, idx) => (
                     <div key={idx} className="bg-white/60 hover:bg-white/95 p-5 rounded-[22px] border border-slate-100/80 flex items-start justify-between gap-4 hover:border-emerald-200/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 group relative">
                        <div className="flex items-start gap-4 overflow-hidden">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center font-black text-emerald-700 text-xs flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                             {idx + 1}
                          </div>
                          <div className="overflow-hidden">
                             <h4 className="font-black text-slate-800 text-sm truncate">{rec.teacher}</h4>
                             <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md mt-1 uppercase tracking-wider border border-emerald-100/50 truncate max-w-full">
                               {rec.type}
                             </span>
                             <p className="text-[9px] text-slate-400 font-extrabold mt-2 uppercase italic">{enrichDateInfoWithDay(rec.dateInfo)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setRecordToEdit(rec)}
                          className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="修改记录"
                        >
                          <Pencil size={14}/>
                        </button>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {(cutiRecords.length === 0 && rasmiRecords.length === 0) && (
              <div className="col-span-full py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 font-bold text-sm">📅 此日期暂无任何请假记录</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50/30 border border-dashed border-slate-200 rounded-3xl">
             <p className="text-slate-400 font-bold text-sm tracking-tight italic">请选择左上方的日期以开启每日快查功能</p>
          </div>
        )}
      </div>

      {/* Stats Table */}
      <div className="glass-card overflow-hidden border border-white/60 relative">
        <div ref={tableRef} className="p-8 overflow-x-auto bg-white/70" style={{ minWidth: '100%' }}>
          <table className="w-full min-w-[1000px] border-collapse text-slate-800 border-2 border-slate-900 shadow-sm rounded-lg">
            <thead>
              <tr>
                <th colSpan="11" className="bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 text-center py-6 border-2 border-slate-900">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black tracking-widest text-slate-900">ANALISIS CUTI GURU DAN AKP</span>
                    <span className="text-xs font-black mt-1 text-slate-655 tracking-wider">SJKC CHUNG HWA KOTA KINABALU BAGI BULAN {bulanString} {statYear}</span>
                  </div>
                </th>
              </tr>
              <tr className="text-center font-black text-xs">
                <th rowSpan="3" className="bg-slate-100/90 border-2 border-slate-900 w-12 px-2 py-4 text-[10px] text-slate-600">NO</th>
                <th rowSpan="3" className="bg-slate-100/90 border-2 border-slate-900 px-6 py-4 min-w-[220px] text-left text-xs uppercase text-slate-800 font-black">Nama Guru / Kakitangan</th>
                <th colSpan="6" className="bg-indigo-950 text-white border-2 border-slate-900 py-3 text-xs tracking-widest font-black uppercase">BULAN {bulanString} {statYear}</th>
                <th colSpan="3" className="bg-emerald-950 text-white border-2 border-slate-900 py-3 text-xs tracking-widest font-black uppercase">CUTI RASMI</th>
              </tr>
              <tr className="text-center font-black text-[10px]">
                <th colSpan="4" className="bg-indigo-50 text-indigo-950 border-2 border-slate-900 py-2.5">JENIS CUTI</th>
                <th rowSpan="2" className="bg-indigo-50/60 text-indigo-950 border-2 border-slate-900 px-3 py-2 w-28 leading-tight">DARI BULAN<br/>SEBELUMNYA</th>
                <th rowSpan="2" className="bg-indigo-100 text-indigo-900 border-2 border-slate-900 px-3 py-2 w-32 leading-tight font-black">JUMLAH CUTI<br/>AKHIR BULAN</th>
                <th rowSpan="2" className="bg-emerald-50 text-emerald-950 border-2 border-slate-900 px-3 py-2 w-28 leading-tight">BILANGAN<br/>RASMI</th>
                <th rowSpan="2" className="bg-emerald-55/40 text-emerald-900 border-2 border-slate-900 px-3 py-2 w-28 leading-tight text-slate-550">RASMI BULAN<br/>LEPAS</th>
                <th rowSpan="2" className="bg-emerald-100 text-emerald-900 border-2 border-slate-900 px-3 py-2 w-32 leading-tight font-black">JUMLAH RASMI<br/>TERKUMPUL</th>
              </tr>
              <tr className="text-center font-black text-[9px] uppercase tracking-tighter text-slate-600 bg-slate-50/50">
                <th className="border-2 border-slate-900 p-2 w-32">CRK/CR/CTR</th>
                <th className="border-2 border-slate-900 p-2 w-24">SAKIT</th>
                <th className="border-2 border-slate-900 p-2 w-24">TIME SLIP</th>
                <th className="border-2 border-slate-900 p-2 w-24">BERSALIN</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sortedAndFilteredStats.map((row, index) => {
                const totalCutiAkhir = row.prev_cuti + row.cur_crk_cr + row.cur_sakit + row.cur_timeslip + row.cur_bersalin; 
                const totalRasmiAkhir = row.prev_rasmi + row.cur_rasmi; 
                return (
                  <tr key={row.name} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="border border-slate-400 text-center font-extrabold py-3.5 text-xs text-slate-450 bg-slate-50/20">{index + 1}</td>
                    <td className="border border-slate-400 px-5 font-black text-sm text-slate-800 tracking-wide">{row.name}</td>
                    
                    {/* CRK/CR */}
                    <td className="border border-slate-400 text-center font-black text-base p-1">
                      {row.cur_crk_cr > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'CRK_CR', monthFilter: 'cur' })} 
                          className="w-full py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100/80 rounded-lg transition-all duration-200 flex items-center justify-center font-black shadow-sm"
                        >
                          {row.cur_crk_cr}
                        </button>
                      ) : null}
                    </td>
                    
                    {/* Sakit */}
                    <td className="border border-slate-400 text-center font-black text-base p-1">
                      {row.cur_sakit > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'SAKIT', monthFilter: 'cur' })} 
                          className="w-full py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-all duration-200 flex items-center justify-center font-black shadow-sm"
                        >
                          {row.cur_sakit}
                        </button>
                      ) : null}
                    </td>
                    
                    {/* Time Slip */}
                    <td className="border border-slate-400 text-center font-black text-base p-1">
                      {row.cur_timeslip > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'TIMESLIP', monthFilter: 'cur' })} 
                          className="w-full py-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100/80 rounded-lg transition-all duration-200 flex items-center justify-center font-black shadow-sm"
                        >
                          {row.cur_timeslip}
                        </button>
                      ) : null}
                    </td>
                    
                    {/* Bersalin */}
                    <td className="border border-slate-400 text-center font-black text-base p-1">
                      {row.cur_bersalin > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'BERSALIN', monthFilter: 'cur' })} 
                          className="w-full py-1.5 text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100/80 rounded-lg transition-all duration-200 flex items-center justify-center font-black shadow-sm italic"
                        >
                          {row.cur_bersalin}
                        </button>
                      ) : null}
                    </td>

                    {/* Dari Bulan Sebelumnya */}
                    <td className="border border-slate-400 bg-slate-50/20 text-center font-black text-xs text-slate-500 p-1">
                      {row.prev_cuti > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'prev' })} 
                          className="w-full py-1.5 text-slate-600 bg-slate-100/60 hover:bg-slate-200/50 rounded-lg transition-all duration-200 flex items-center justify-center font-black"
                        >
                          {row.prev_cuti}
                        </button>
                      ) : "-"}
                    </td>

                    {/* Jumlah Cuti Akhir Bulan */}
                    <td className="border-2 border-slate-900 bg-indigo-50/20 text-center font-black text-base text-indigo-700 p-1">
                      {totalCutiAkhir > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'total' })} 
                          className="w-full py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/90 rounded-lg transition-all duration-200 flex items-center justify-center font-black border border-indigo-200 shadow-sm hover:scale-[1.03]"
                        >
                          {totalCutiAkhir}
                        </button>
                      ) : "-"}
                    </td>

                    {/* Bilangan Rasmi */}
                    <td className="border border-slate-400 text-center font-black text-base p-1">
                      {row.cur_rasmi > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'cur' })} 
                          className="w-full py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition-all duration-200 flex items-center justify-center font-black shadow-sm"
                        >
                          {row.cur_rasmi}
                        </button>
                      ) : null}
                    </td>

                    {/* Rasmi Bulan Lepas */}
                    <td className="border border-slate-400 bg-slate-50/20 text-center font-bold text-xs text-slate-550 p-1">
                      {row.prev_rasmi > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'prev' })} 
                          className="w-full py-1.5 text-slate-600 bg-slate-100/60 hover:bg-slate-200/50 rounded-lg transition-all duration-200 flex items-center justify-center font-black"
                        >
                          {row.prev_rasmi}
                        </button>
                      ) : "-"}
                    </td>

                    {/* Jumlah Rasmi Terkumpul */}
                    <td className="border-2 border-slate-900 bg-emerald-50 text-center font-black text-base text-emerald-800 p-1">
                      {totalRasmiAkhir > 0 ? (
                        <button 
                          onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'total' })} 
                          className="w-full py-1.5 text-emerald-850 bg-emerald-100 hover:bg-emerald-200/80 rounded-lg transition-all duration-200 flex items-center justify-center font-black border border-emerald-300 shadow-sm hover:scale-[1.03]"
                        >
                          {totalRasmiAkhir}
                        </button>
                      ) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredSjkcStats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30">
            <div className="p-4 bg-slate-100 rounded-full text-slate-300 mb-4">
               <Search size={48}/>
            </div>
            <p className="text-slate-400 font-bold tracking-tight">没有找到符合条件的老师记录</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 justify-center text-slate-400 text-xs font-black uppercase tracking-wider select-none">
        <CalendarDays size={14}/>
        数据统计截止至当前云端同步时刻
      </div>
    </div>
  );
};

export default StatsTab;
