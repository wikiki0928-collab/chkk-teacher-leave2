import React, { useState, useEffect } from 'react';
import { Pencil, X, User, Tag, CalendarDays, CheckCircle } from 'lucide-react';

const EditRecordModal = ({ record, onClose, onUpdate, teachersList, leaveTypesList }) => {
  const [teacher, setTeacher] = useState('');
  const [type, setType] = useState('');
  const [dateInfo, setDateInfo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (record) {
      setTeacher(record.teacher || '');
      setType(record.type || '');
      setDateInfo(record.dateInfo || '');
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdate(record.id, {
        teacher,
        type,
        dateInfo
      });
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-blue-50/50">
          <div>
            <h3 className="font-black text-2xl flex items-center gap-3 text-slate-800">
              <Pencil className="text-blue-600" size={28}/> 修改记录
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              修正信息后，所有统计数据将实时更新
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-200 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"
          >
            <X size={24}/>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Teacher Selection */}
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">姓名</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <User size={20} />
                </div>
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-black text-slate-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none"
                  required
                >
                  {teachersList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leave Type */}
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">类型</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Tag size={20} />
                </div>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-black text-slate-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="请输入请假类型"
                  required
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                 {leaveTypesList.filter(l => l !== "其他 (Lain-lain)").slice(0, 3).map(l => (
                   <button 
                     key={l}
                     type="button"
                     onClick={() => setType(l)}
                     className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all"
                   >
                     {l}
                   </button>
                 ))}
              </div>
            </div>

            {/* Date Info */}
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                日期信息 <span className="text-blue-500 lowercase font-bold">(注意格式需保持 dd.mm.yyyy)</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <CalendarDays size={20} />
                </div>
                <input
                  type="text"
                  value={dateInfo}
                  onChange={(e) => setDateInfo(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-black text-slate-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="例如: 13.04.2026 (1 HARI)"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className={`flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUpdating ? '正在保存...' : <><CheckCircle size={20}/> 保存更改</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;
