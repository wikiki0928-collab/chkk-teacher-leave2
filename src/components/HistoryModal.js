import React, { useState, useMemo } from 'react';
import { History, X, Trash2, Pencil, Download, Search, Filter } from 'lucide-react';
import { enrichDateInfoWithDay } from '../utils/helpers';

const HistoryModal = ({ isOpen, onClose, historyRecords, setRecordToDelete, setRecordToEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const availableTypes = useMemo(() => {
    const types = new Set(historyRecords.map(r => r.type));
    return Array.from(types).sort();
  }, [historyRecords]);

  const filteredRecords = useMemo(() => {
    return historyRecords.filter(rec => {
      if (searchTerm && !rec.teacher.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterType && rec.type !== filterType) return false;
      
      const recStart = rec.startDate || (rec.dateInfo && rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/) ? `${rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/)[3]}-${rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/)[2]}-${rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/)[1]}` : null);
      
      if (filterStartDate && recStart && recStart < filterStartDate) return false;
      if (filterEndDate && recStart && recStart > filterEndDate) return false;

      return true;
    });
  }, [historyRecords, searchTerm, filterType, filterStartDate, filterEndDate]);

  const exportToCSV = () => {
    const headers = ['教师姓名 (Teacher)', '假别 (Type)', '请假详情 (Date Info)', '系统建档时间 (Created At)'];
    
    const rows = filteredRecords.map(rec => {
      const createdStr = rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleString() : 'N/A';
      return [
        `"${rec.teacher}"`,
        `"${rec.type}"`,
        `"${rec.dateInfo}"`,
        `"${createdStr}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Teacher_Leave_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-black text-2xl flex items-center gap-3 text-slate-800"><History className="text-blue-600" size={28}/> 所有历史存档</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">从这里删除记录，将同步调整统计数据</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-200 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"><X size={24}/></button>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Search size={12}/> 搜索教师</label>
            <input 
              type="text" 
              placeholder="输入名字..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-300 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Filter size={12}/> 假别</label>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="w-full p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-300 focus:bg-white transition-colors font-sans"
            >
              <option value="">全部 (All)</option>
              {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-[130px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">开始日期</label>
            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300 focus:bg-white"/>
          </div>
          <div className="w-[130px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">结束日期</label>
            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300 focus:bg-white"/>
          </div>
          <button 
            onClick={exportToCSV}
            className="p-3 bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 active:scale-95"
            title="导出为 Excel 可读的 CSV 文件"
          >
            <Download size={16}/> 导出CSV
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {filteredRecords.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                <History size={32}/>
              </div>
              <div className="text-center text-slate-400 font-black">没找到任何记录</div>
              <div className="text-center text-slate-300 text-xs font-bold">请尝试调整搜索条件或日期范围</div>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div key={rec.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group relative">
                <div className="flex justify-between items-start pr-10">
                  <div className="space-y-2">
                    <div className="font-black text-blue-600 text-xl leading-tight uppercase">{rec.teacher}</div>
                    <div className="text-slate-800 font-black text-sm">{rec.type}</div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{enrichDateInfoWithDay(rec.dateInfo)}</div>
                  </div>
                  <div className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">
                     {rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                  </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setRecordToEdit(rec)} className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all" title="修改记录">
                    <Pencil size={18}/>
                  </button>
                  <button onClick={() => setRecordToDelete(rec)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="删除记录">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
