import React from 'react';
import { History, X, Trash2, Pencil } from 'lucide-react';
import { enrichDateInfoWithDay } from '../utils/helpers';

const HistoryModal = ({ isOpen, onClose, historyRecords, setRecordToDelete, setRecordToEdit }) => {
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
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
          {historyRecords.length === 0 ? (
            <div className="py-24 text-center text-slate-300 font-black italic">暂时还没有任何记录...</div>
          ) : (
            historyRecords.map((rec) => (
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
