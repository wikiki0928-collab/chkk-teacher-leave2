import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ recordToDelete, onClose, onConfirm }) => {
  if (!recordToDelete) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm space-y-5 shadow-2xl">
        <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={28} /></div>
        <h3 className="font-black text-2xl text-slate-800">确认删除？</h3>
        <p className="text-slate-600 font-bold leading-relaxed">
          您确定要删除 <span className="text-blue-600 px-1">{recordToDelete.teacher}</span> 的 <span className="text-slate-800 px-1">{recordToDelete.type}</span> 记录吗？
          <br/><span className="text-xs text-red-500 mt-2 block">(表盘上的总计数值将瞬间随之减少)</span>
        </p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">取消</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-md transition-all">确定删除</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
