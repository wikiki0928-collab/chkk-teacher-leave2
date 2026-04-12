import React from 'react';
import { User, Info, X, Trash2 } from 'lucide-react';

const ManagerModal = ({ showManager, onClose, teachersList, sortedTeachers, leaveTypesList, updateList }) => {
  if (!showManager) return null;

  const currentList = showManager === 'teachers' ? sortedTeachers : leaveTypesList;
  const title = showManager === 'teachers' ? '管理老师' : '管理种类';
  const Icon = showManager === 'teachers' ? User : Info;
  const dbKey = showManager === 'teachers' ? 'teachers_list' : 'leave_types';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-7 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-xl flex items-center gap-2">
            <Icon className="text-blue-500"/> {title}
          </h3>
          <button onClick={onClose} className="p-2.5 bg-slate-200 rounded-full hover:bg-slate-300"><X size={20}/></button>
        </div>
        <div className="p-5 bg-white border-b">
           <input 
             type="text" 
             placeholder="输入新项按 Enter..."
             className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase outline-none focus:border-blue-500 transition-all"
             onKeyDown={(e) => {
               if (e.key === 'Enter' && e.target.value.trim()) {
                 const val = e.target.value.trim().toUpperCase();
                 const list = showManager === 'teachers' ? teachersList : leaveTypesList;
                 if (!list.includes(val)) {
                   updateList(dbKey, [...list, val]);
                   e.target.value = "";
                 }
               }
             }}
           />
        </div>
        <div className="flex-grow overflow-y-auto p-5 space-y-2 bg-slate-50">
          {currentList.map(item => (
            <div key={item} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm group">
              <span className="font-bold text-slate-700">{item}</span>
              <button onClick={() => {
                 const list = showManager === 'teachers' ? teachersList : leaveTypesList;
                 updateList(dbKey, list.filter(i => i !== item));
              }} className="p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerModal;
