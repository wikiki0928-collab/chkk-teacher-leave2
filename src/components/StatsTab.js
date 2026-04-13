import React, { useState, useMemo } from 'react';
import { BarChart3, Database, Printer, Loader2, Search, MousePointerClick, CalendarDays, UserCheck, Calendar, X, Pencil } from 'lucide-react';
import { isDateInRange } from '../utils/helpers';

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
  const [dailySearchDate, setDailySearchDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const dailyLeaves = useMemo(() => {
    if (!dailySearchDate) return [];
    return historyRecords.filter(rec => isDateInRange(dailySearchDate, rec.dateInfo));
  }, [dailySearchDate, historyRecords]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Control Bar */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6 flex flex-col xl:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <BarChart3 size={24}/>
           </div>
           <div>
             <h3 className="font-black text-slate-800 text-lg">考勤统计分析</h3>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Monthly Attendance Analytics</p>
           </div>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center flex-wrap justify-end">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                 <input 
                  type="text" 
                  placeholder="搜索教师姓名..." 
                  value={statSearch} 
                  onChange={e => setStatSearch(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                 />
              </div>
              
              <select 
                value={statSortMode} 
                onChange={e => setStatSortMode(e.target.value)} 
                className="hidden sm:block px-4 py-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="alphabet">排序: A-Z</option>
                <option value="cuti_desc">排序: 假期多到少</option>
                <option value="rasmi_desc">排序: 公事多到少</option>
              </select>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
              <select value={statMonth} onChange={e => setStatMonth(e.target.value)} className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-800 rounded-xl font-black text-sm outline-none shadow-sm cursor-pointer border border-transparent hover:border-indigo-200 transition-all">
                {bulanMelayu.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select value={statYear} onChange={e => setStatYear(e.target.value)} className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-800 rounded-xl font-black text-sm outline-none shadow-sm cursor-pointer border border-transparent hover:border-indigo-200 transition-all ml-1">
                {availableYears.map(y => <option key={y} value={y}>{y} 年</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setShowBaselineModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all shadow-sm"
                title="导入上个月结转的数据"
              >
                <Database size={16} /> 导入底数
              </button>

              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs text-white shadow-lg transition-all ${isExporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 active:scale-95 hover:shadow-teal-200'}`}
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                {isExporting ? '生成中' : 'PDF 导出'}
              </button>
            </div>
         </div>
      </div>

      {/* Daily Check Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
               <UserCheck size={24}/>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">每日考勤快查</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Quick Daily Leave Inspector</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
            <Calendar size={18} className="ml-2 text-slate-400"/>
            <input 
              type="date" 
              value={dailySearchDate} 
              onChange={e => setDailySearchDate(e.target.value)} 
              className="bg-transparent border-none outline-none font-black text-slate-700 py-2 px-1 text-sm w-full md:w-36"
            />
            {dailySearchDate && (
              <button onClick={() => setDailySearchDate("")} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
                <X size={14}/>
              </button>
            )}
          </div>
        </div>

        {dailySearchDate ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {dailyLeaves.length > 0 ? (
              dailyLeaves.map((rec, idx) => (
                <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-start justify-between gap-4 hover:border-orange-200 transition-all group relative">
                   <div className="flex items-start gap-4 overflow-hidden">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-orange-600 text-xs flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        {idx + 1}
                     </div>
                     <div className="overflow-hidden">
                        <h4 className="font-black text-slate-800 text-sm truncate">{rec.teacher}</h4>
                        <p className="text-xs font-bold text-orange-500 mt-0.5 uppercase tracking-tighter truncate">{rec.type}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{rec.dateInfo}</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => setRecordToEdit(rec)}
                     className="p-2 text-slate-300 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                     title="修改记录"
                   >
                     <Pencil size={16}/>
                   </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 font-bold text-sm">📅 此日期暂无任何请假记录</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
             <p className="text-slate-400 font-bold text-sm tracking-tight italic">请选择左上方的日期以开启每日快查功能</p>
          </div>
        )}
      </div>

      {/* Stats Table */}
      <div className="bg-white overflow-hidden rounded-[32px] shadow-sm border border-slate-200 relative">
        <div ref={tableRef} className="p-8 overflow-x-auto bg-white" style={{ minWidth: '100%' }}>
          <table className="w-full min-w-[1000px] border-collapse text-slate-800 border-2 border-slate-900">
            <thead>
              <tr>
                <th colSpan="11" className="bg-[#FFFFBB] text-center py-5 border-2 border-slate-900">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black tracking-widest text-slate-900">ANALISIS CUTI GURU DAN AKP</span>
                    <span className="text-sm font-bold mt-1 text-slate-600">SJKC CHUNG HWA KOTA KINABALU BAGI BULAN {bulanString} {statYear}</span>
                  </div>
                </th>
              </tr>
              <tr className="text-center font-black">
                <th rowSpan="3" className="bg-slate-100 border-2 border-slate-900 w-12 px-2 py-4 text-[11px]">NO</th>
                <th rowSpan="3" className="bg-slate-100 border-2 border-slate-900 px-6 py-4 min-w-[220px] text-left text-sm uppercase">Nama Guru / Kakitangan</th>
                <th colSpan="6" className="bg-slate-200/50 border-2 border-slate-900 py-3 text-xs tracking-widest">{bulanString} {statYear}</th>
                <th colSpan="3" className="bg-emerald-50 border-2 border-slate-900 py-3 text-xs tracking-widest">CUTI RASMI</th>
              </tr>
              <tr className="text-center font-black">
                <th colSpan="4" className="bg-blue-50/50 border-2 border-slate-900 py-2.5 text-[10px]">JENIS CUTI</th>
                <th rowSpan="2" className="bg-blue-50/50 border-2 border-slate-900 px-3 py-2 w-28 text-[10px] leading-tight">DARI BULAN<br/>SEBELUMNYA</th>
                <th rowSpan="2" className="bg-blue-50 text-blue-700 border-2 border-slate-900 px-3 py-2 w-32 text-[10px] leading-tight font-black">JUMLAH CUTI<br/>AKHIR BULAN</th>
                <th rowSpan="2" className="bg-emerald-50 border-2 border-slate-900 px-3 py-2 w-28 text-[10px] leading-tight">BILANGAN<br/>RASMI</th>
                <th rowSpan="2" className="bg-emerald-50 border-2 border-slate-900 px-3 py-2 w-28 text-[10px] leading-tight text-slate-500">RASMI BULAN<br/>LEPAS</th>
                <th rowSpan="2" className="bg-emerald-50 text-emerald-700 border-2 border-slate-900 px-3 py-2 w-32 text-[10px] leading-tight font-black">JUMLAH RASMI<br/>TERKUMPUL</th>
              </tr>
              <tr className="text-center font-black text-[9px] uppercase tracking-tighter">
                <th className="bg-white border-2 border-slate-900 p-2 w-32">CRK/CR/CTR</th>
                <th className="bg-white border-2 border-slate-900 p-2 w-24">SAKIT</th>
                <th className="bg-white border-2 border-slate-900 p-2 w-24">TIME SLIP</th>
                <th className="bg-white border-2 border-slate-900 p-2 w-24">BERSALIN</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sortedAndFilteredStats.map((row, index) => {
                const totalCutiAkhir = row.prev_cuti + row.cur_crk_cr + row.cur_sakit + row.cur_timeslip + row.cur_bersalin; 
                const totalRasmiAkhir = row.prev_rasmi + row.cur_rasmi; 
                return (
                  <tr key={row.name} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="border border-slate-400 text-center font-bold py-3 text-xs text-slate-500">{index + 1}</td>
                    <td className="border border-slate-400 px-5 font-black text-sm group-hover:text-blue-600 transition-colors">{row.name}</td>
                    
                    <td className="border border-slate-400 text-center font-black text-lg">
                      {row.cur_crk_cr > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'CRK_CR', monthFilter: 'cur' })} className="w-full h-full text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors">
                          {row.cur_crk_cr}
                        </button>
                      )}
                    </td>
                    
                    <td className="border border-slate-400 text-center font-black text-lg">
                      {row.cur_sakit > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'SAKIT', monthFilter: 'cur' })} className="w-full h-full text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors">
                          {row.cur_sakit}
                        </button>
                      )}
                    </td>
                    
                    <td className="border border-slate-400 text-center font-black text-lg">
                      {row.cur_timeslip > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'TIMESLIP', monthFilter: 'cur' })} className="w-full h-full text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                          {row.cur_timeslip}
                        </button>
                      )}
                    </td>
                    
                    <td className="border border-slate-400 text-center font-black text-lg text-purple-600 italic">
                      {row.cur_bersalin > 0 ? row.cur_bersalin : ""}
                    </td>

                    <td className="border border-slate-400 bg-slate-50/50 text-center font-black text-sm text-slate-500">
                      {row.prev_cuti > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'prev' })} className="w-full h-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                          {row.prev_cuti}
                        </button>
                      )}
                    </td>

                    <td className="border-2 border-slate-900 bg-blue-50/30 text-center font-black text-xl text-blue-700">
                      {totalCutiAkhir > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'total' })} className="w-full h-full hover:bg-blue-100 flex items-center justify-center transition-colors">
                          {totalCutiAkhir}
                        </button>
                      )}
                    </td>

                    <td className="border border-slate-400 text-center font-black text-lg">
                      {row.cur_rasmi > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'cur' })} className="w-full h-full text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors">
                          {row.cur_rasmi}
                        </button>
                      )}
                    </td>

                    <td className="border border-slate-400 bg-emerald-50/30 text-center font-bold text-sm text-emerald-800 opacity-60">
                      {row.prev_rasmi > 0 ? (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'prev' })} className="w-full h-full hover:bg-emerald-100 flex items-center justify-center transition-colors">
                          {row.prev_rasmi}
                        </button>
                      ) : "-"}
                    </td>

                    <td className="border-2 border-slate-900 bg-emerald-50 text-center font-black text-xl text-emerald-800">
                      {totalRasmiAkhir > 0 && (
                        <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'total' })} className="w-full h-full hover:bg-emerald-100 flex items-center justify-center transition-colors">
                          {totalRasmiAkhir}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredSjkcStats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50">
            <div className="p-4 bg-slate-100 rounded-full text-slate-300 mb-4">
               <Search size={48}/>
            </div>
            <p className="text-slate-400 font-bold tracking-tight">没有找到符合条件的老师记录</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        <CalendarDays size={14}/>
        数据统计截止至当前云端同步时刻
      </div>
    </div>
  );
};

export default StatsTab;
