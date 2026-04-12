import React from 'react';
import { User, Database, X, CalendarDays, Trash2 } from 'lucide-react';

const DetailViewModal = ({
  detailView,
  onClose,
  baselineCuti,
  detailRecords,
  setRecordToDelete,
  bulanString,
  statYear
}) => {
  if (!detailView.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[55] p-4 animate-in fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-indigo-50">
          <div>
            <h3 className="font-black text-2xl flex items-center gap-2 text-indigo-900">
              <User className="text-indigo-500" size={24}/> {detailView.teacher}
            </h3>
            <p className="text-sm font-bold text-indigo-500 tracking-wider mt-1">
              {detailView.monthFilter === 'cur' ? `${bulanString} ${statYear}` : 
               detailView.monthFilter === 'prev' ? `累积至上个月 (${statYear}年)` :
               `${statYear}年全年总计`} 明细清单
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all shadow-sm"><X size={24}/></button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
          {(detailView.monthFilter === 'prev' || detailView.monthFilter === 'total') && baselineCuti[detailView.teacher] > 0 && detailView.category === 'ALL_CUTI' && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-xl flex items-start gap-3 shadow-sm mb-4">
              <Database className="text-orange-500 mt-0.5" size={20}/>
              <div>
                <p className="font-black text-orange-800">包含前期导入底数: {baselineCuti[detailView.teacher]} 天</p>
                <p className="text-xs text-orange-600 font-bold mt-1">系统已将您用 Excel 导入的前期假期，加算至当前总额中。下方的清单仅显示系统启用后新增的记录。</p>
              </div>
            </div>
          )}

          {detailRecords.map((rec) => (
            <div key={rec.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group relative flex items-center justify-between">
              <div className="space-y-1 pr-10">
                <div className="text-slate-800 font-black text-lg">{rec.type}</div>
                <div className="text-indigo-600 font-black flex items-center gap-2"><CalendarDays size={16}/> {rec.dateInfo}</div>
                <div className="text-[10px] font-black text-slate-300 mt-2">记录创建于: {rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleString() : '...'}</div>
              </div>
              <button onClick={() => setRecordToDelete(rec)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="删除此记录">
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
          {detailRecords.length === 0 && <div className="py-10 text-center text-slate-300 font-black">没有系统内新增的记录</div>}
        </div>
      </div>
    </div>
  );
};

export default DetailViewModal;
