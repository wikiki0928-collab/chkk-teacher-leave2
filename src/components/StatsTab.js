import React from 'react';
import { BarChart3, Database, Printer, Loader2, Search, MousePointerClick } from 'lucide-react';

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
  baselineCuti,
  filteredSjkcStats
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6 flex flex-col xl:flex-row justify-between items-center gap-4">
         <h3 className="font-black text-slate-800 text-xl flex items-center gap-2 whitespace-nowrap">
           <BarChart3 className="text-indigo-600" size={26}/> 月度考勤分析
         </h3>
         
         <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center flex-wrap justify-end">
            <button 
              onClick={() => setShowBaselineModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-indigo-700 bg-indigo-100 hover:bg-indigo-200 active:scale-95 w-full sm:w-auto transition-all"
            >
              <Database size={18} /> 导入旧账底数
            </button>

            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-white w-full sm:w-auto shadow-md transition-all ${isExporting ? 'bg-slate-400' : 'bg-teal-500 hover:bg-teal-600 active:scale-95'}`}
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              {isExporting ? '生成中...' : '下载报表 (PDF)'}
            </button>

            <select 
              value={statSortMode} 
              onChange={e => setStatSortMode(e.target.value)} 
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="alphabet">🔤 名字 A-Z 顺序</option>
              <option value="cuti_desc">📉 私假总数排行榜 (多到少)</option>
              <option value="rasmi_desc">📉 公事总数排行榜 (多到少)</option>
            </select>

            <div className="relative w-full sm:w-40">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
               <input type="text" placeholder="搜寻老师..." value={statSearch} onChange={e => setStatSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <select value={statMonth} onChange={e => setStatMonth(e.target.value)} className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white border border-indigo-700 rounded-xl font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                {bulanMelayu.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select value={statYear} onChange={e => setStatYear(e.target.value)} className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white border border-indigo-700 rounded-xl font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                {availableYears.map(y => <option key={y} value={y}>{y} 年</option>)}
              </select>
            </div>
         </div>
      </div>

      <div ref={tableRef} className="bg-white p-2 sm:p-4 rounded-[32px] shadow-lg border border-slate-200 overflow-x-auto relative" style={{ backgroundColor: 'white' }}>
        <table className="w-full min-w-[1000px] border-collapse text-sm text-black border-2 border-black">
          <thead>
            <tr>
              <th colSpan="11" className="bg-[#ffff00] text-center py-3 border-2 border-black text-lg uppercase font-black tracking-wide">
                ANALISIS CUTI GURU DAN AKP SJKC CHUNG HWA KOTA KINABALU BAGI BULAN {bulanString} {statYear}
              </th>
            </tr>
            <tr className="text-center font-black">
              <th rowSpan="3" className="bg-[#f6b26b] border-2 border-black w-12 px-2 py-2">NO</th>
              <th rowSpan="3" className="bg-[#f6b26b] border-2 border-black px-4 py-2 min-w-[200px]">NAMA GURU</th>
              <th colSpan="6" className="bg-[#f6b26b] border-2 border-black py-2">{bulanString} {statYear}</th>
              <th colSpan="3" className="bg-[#d9ead3] border-2 border-black py-2">CUTI RASMI</th>
            </tr>
            <tr className="text-center font-black">
              <th colSpan="4" className="bg-[#bde5f8] border-2 border-black py-1.5">CUTI</th>
              <th rowSpan="2" className="bg-[#bde5f8] border-2 border-black px-3 py-2 w-28 leading-snug">CUTI DARI<br/>BULAN<br/>SEBELUMNYA</th>
              <th rowSpan="2" className="bg-[#bde5f8] border-2 border-black px-3 py-2 w-32 leading-snug">JUMLAH CUTI AKHIR<br/>BULAN {bulanString} {statYear}</th>
              <th rowSpan="2" className="bg-[#d9ead3] border-2 border-black px-3 py-2 w-28 leading-snug">CUTI RASMI</th>
              <th rowSpan="2" className="bg-[#d9ead3] border-2 border-black px-3 py-2 w-28 leading-snug">CUTI RASMI<br/>DARI BULAN<br/>SEBELUMNYA</th>
              <th rowSpan="2" className="bg-[#d9ead3] border-2 border-black px-3 py-2 w-32 leading-snug">JUMLAH CUTI RASMI<br/>AKHIR BULAN {bulanString} {statYear}</th>
            </tr>
            <tr className="text-center font-black text-xs leading-snug">
              <th className="bg-[#bde5f8] border-2 border-black p-2 w-36">CRK/CR/CUTI<br/>KECEMASAN /<br/>CTR</th>
              <th className="bg-[#bde5f8] border-2 border-black p-2 w-24">CUTI SAKIT</th>
              <th className="bg-[#bde5f8] border-2 border-black p-2 w-24">TIME SLIP</th>
              <th className="bg-[#bde5f8] border-2 border-black p-2 w-24">CUTI BERSALIN</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedAndFilteredStats.map((row, index) => {
              const totalCutiAkhir = row.prev_cuti + row.cur_crk_cr + row.cur_sakit + row.cur_timeslip + row.cur_bersalin; 
              const totalRasmiAkhir = row.prev_rasmi + row.cur_rasmi; 
              return (
                <tr key={row.name} className="hover:bg-slate-100 transition-colors">
                  <td className="border border-black text-center font-medium py-2">{index + 1}</td>
                  <td className="border border-black px-3 font-bold">{row.name}</td>
                  
                  <td className="border border-black text-center font-bold text-lg">
                    {row.cur_crk_cr > 0 ? (
                      isExporting ? <span className="text-red-600">{row.cur_crk_cr}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'CRK_CR', monthFilter: 'cur' })} className="text-red-600 hover:bg-red-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                        {row.cur_crk_cr} <MousePointerClick size={12} className="opacity-50"/>
                      </button>
                    ) : ""}
                  </td>
                  
                  <td className="border border-black text-center font-bold text-lg">
                    {row.cur_sakit > 0 ? (
                      isExporting ? <span className="text-blue-600">{row.cur_sakit}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'SAKIT', monthFilter: 'cur' })} className="text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                        {row.cur_sakit} <MousePointerClick size={12} className="opacity-50"/>
                      </button>
                    ) : ""}
                  </td>
                  
                  <td className="border border-black text-center font-bold text-lg">
                    {row.cur_timeslip > 0 ? (
                      isExporting ? <span className="text-slate-600">{row.cur_timeslip}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'TIMESLIP', monthFilter: 'cur' })} className="text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                        {row.cur_timeslip} <MousePointerClick size={12} className="opacity-50"/>
                      </button>
                    ) : ""}
                  </td>
                  
                  <td className="border border-black text-center font-bold text-lg">
                    {row.cur_bersalin > 0 ? (
                      isExporting ? <span className="text-purple-600">{row.cur_bersalin}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'BERSALIN', monthFilter: 'cur' })} className="text-purple-600 hover:bg-purple-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                        {row.cur_bersalin} <MousePointerClick size={12} className="opacity-50"/>
                      </button>
                    ) : ""}
                  </td>

                  <td className="border border-black bg-[#bde5f8] text-center font-black text-lg">
                    {row.prev_cuti > 0 ? (
                      isExporting ? <span className="text-blue-800">{row.prev_cuti}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'prev' })} className="text-blue-800 hover:bg-blue-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full relative group">
                        {row.prev_cuti}
                        {baselineCuti[row.name] > 0 && <span className="absolute -top-6 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">含Excel导入底数: {baselineCuti[row.name]}</span>}
                      </button>
                    ) : ""}
                  </td>

                  <td className="border border-black bg-[#bde5f8] text-center font-black text-xl text-teal-800">
                    {totalCutiAkhir > 0 ? (
                      isExporting ? <span>{totalCutiAkhir}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'total' })} className="hover:bg-teal-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                        {totalCutiAkhir}
                      </button>
                    ) : ""}
                  </td>

                  <td className="border border-black text-center font-bold text-lg bg-[#d9ead3]">
                    {row.cur_rasmi > 0 ? (
                      isExporting ? <span className="text-emerald-700">{row.cur_rasmi}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'cur' })} className="text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                        {row.cur_rasmi} <MousePointerClick size={12} className="opacity-50"/>
                      </button>
                    ) : ""}
                  </td>

                  <td className="border border-black bg-[#d9ead3] text-center font-black text-lg">
                    {row.prev_rasmi > 0 ? (
                      isExporting ? <span className="text-emerald-800">{row.prev_rasmi}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'prev' })} className="text-emerald-800 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                        {row.prev_rasmi}
                      </button>
                    ) : ""}
                  </td>

                  <td className="border border-black bg-[#d9ead3] text-center font-black text-xl text-green-900">
                    {totalRasmiAkhir > 0 ? (
                      isExporting ? <span>{totalRasmiAkhir}</span> : 
                      <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'total' })} className="hover:bg-green-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                        {totalRasmiAkhir}
                      </button>
                    ) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredSjkcStats.length === 0 && !isExporting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <p className="text-slate-500 font-black text-lg">没有找到该老师的数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsTab;
