import React from 'react';
import { Briefcase, Cloud, History, FileText, Settings, Clock, CheckCircle2, ClipboardCopy } from 'lucide-react';

const LeaveSystemTab = ({
  user,
  selectedTeacher,
  setSelectedTeacher,
  sortedTeachers,
  leaveType,
  setLeaveType,
  leaveTypesList,
  customLeaveType,
  setCustomLeaveType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  useTime,
  setUseTime,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  isSelesai,
  setIsSelesai,
  copiedStatus,
  finalMessage,
  copyAndSave,
  setShowHistory,
  setShowManager
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">老师请假系统 <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">v3.9</span></h1>
          <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
              {user ? <span className="text-green-500 flex items-center gap-1"><Cloud size={12}/>云端同步正常</span> : <span className="text-red-400 flex items-center gap-1"><Cloud size={12}/>离线模式</span>}
          </p>
        </div>
        <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          <History size={18}/> 历史存档记录
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-7 space-y-6">
          <h2 className="text-lg font-black text-slate-700 flex items-center gap-2 border-b pb-4"><FileText className="text-blue-500" size={20}/> 资料输入</h2>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">教师姓名</label>
              <div className="flex items-center gap-2">
                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="flex-1 p-3.5 bg-slate-50 border rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500">
                  {sortedTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => setShowManager('teachers')} className="p-3.5 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 flex-shrink-0"><Settings size={22}/></button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">请假种类</label>
              <div className="flex items-center gap-2">
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="flex-1 p-3.5 bg-slate-50 border rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500">
                  {leaveTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="其他 (Lain-lain)">其他 (手动输入) ✏️</option>
                </select>
                <button onClick={() => setShowManager('leaves')} className="p-3.5 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 flex-shrink-0"><Settings size={22}/></button>
              </div>
              {leaveType === "其他 (Lain-lain)" && <input type="text" placeholder="输入假期名称..." value={customLeaveType} onChange={e => setCustomLeaveType(e.target.value)} className="w-full mt-2 p-3.5 bg-slate-50 border rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"/>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">开始日期</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border rounded-2xl font-bold text-sm outline-none"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">结束日期</label>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border rounded-2xl font-bold text-sm outline-none"/>
              </div>
            </div>
            {leaveType !== "CUTI REHAT KHAS" && !leaveType.includes("CUTI REHAT") && !leaveType.includes("BERSALIN") && !leaveType.includes("KECEMASAN") && (
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl cursor-pointer">
                  <span className="text-sm font-black text-blue-700 flex items-center gap-2"><Clock size={18}/> 具体时间 (Optional)</span>
                  <input type="checkbox" checked={useTime} onChange={e => setUseTime(e.target.checked)} className="w-6 h-6 accent-blue-600"/>
                </label>
                {useTime && (
                  <div className="p-4 bg-slate-50 border rounded-2xl space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-3 border rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-500"/>
                      <input type="time" value={endTime} disabled={isSelesai} onChange={e => setEndTime(e.target.value)} className={`p-3 border rounded-xl font-black outline-none ${isSelesai ? 'opacity-30' : ''}`}/>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500"><input type="checkbox" checked={isSelesai} onChange={e => setIsSelesai(e.target.checked)} className="w-4 h-4 accent-orange-500"/> 直到活动结束 (SELESAI)</label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-[#efeae2] rounded-[32px] p-7 border border-slate-200 shadow-sm flex-1 flex flex-col">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">📱 预览 (TG加粗生效)</h2>
            <div className="flex-1 bg-[#d9fdd3] text-[#111b21] p-6 rounded-2xl rounded-tl-none shadow-sm text-lg leading-relaxed whitespace-pre-wrap font-bold border-l-4 border-green-400">{finalMessage}</div>
            <button onClick={copyAndSave} className={`w-full mt-8 py-5 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${copiedStatus ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {copiedStatus ? <><CheckCircle2/> 已复制！</> : <><ClipboardCopy/> 复制并存档</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSystemTab;
