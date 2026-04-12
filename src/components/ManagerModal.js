import React from 'react';
import { User, Info, X, Trash2, Plus } from 'lucide-react';

const ManagerModal = ({ showManager, onClose, teachersList, sortedTeachers, leaveTypesList, updateList }) => {
  if (!showManager) return null;

  const currentList = showManager === 'teachers' ? sortedTeachers : leaveTypesList;
  const title = showManager === 'teachers' ? '名单管理' : '假别管理';
  const subtitle = showManager === 'teachers' ? '管理全校教职员名单' : '管理可用的请假/公事类型';
  const Icon = showManager === 'teachers' ? User : Info;
  const dbKey = showManager === 'teachers' ? 'teachers_list' : 'leave_types';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${showManager === 'teachers' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <Icon size={24}/>
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 leading-none">{title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"><X size={24}/></button>
        </div>

        <div className="px-8 py-6 bg-white border-b border-slate-50">
           <div className="relative">
             <input 
               type="text" 
               placeholder="输入名称并回车添加..."
               className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
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
             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Plus size={20}/>
             </div>
           </div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-3 bg-slate-50/50">
          {currentList.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-300 font-bold text-sm">目前暂无内容</p>
            </div>
          )}
          {currentList.map(item => (
            <div key={item} className="bg-white p-4.5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm group hover:border-blue-200 transition-all">
              <span className="font-black text-slate-700 text-sm tracking-tight">{item}</span>
              <button 
                onClick={() => {
                  const list = showManager === 'teachers' ? teachersList : leaveTypesList;
                  updateList(dbKey, list.filter(i => i !== item));
                }} 
                className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                title="删除此项"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-white border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">更改将立即同步至所有用户的设备</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerModal;
