import React from 'react';
import { Briefcase, Cloud, History, FileText, Settings, Clock, CheckCircle2, Clipboard } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">请假生成器</h1>
            <p className="text-slate-400 text-xs font-bold mt-0.5 flex items-center gap-2 uppercase tracking-wide">
              {user ? (
                <span className="text-emerald-500 flex items-center gap-1"><Cloud size={12}/> Cloud Sync Active</span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1"><Cloud size={12}/> Offline Mode</span>
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm active:scale-95 border border-slate-200"
        >
          <History size={18}/> 历史记录
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-700 flex items-center gap-2">
              <FileText className="text-blue-500" size={20}/> 填写请假信息
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">教师姓名</label>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedTeacher} 
                  onChange={e => setSelectedTeacher(e.target.value)} 
                  className="flex-1 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all transition-all"
                >
                  {sortedTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button 
                  onClick={() => setShowManager('teachers')} 
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0 transition-colors"
                  title="管理教师名单"
                >
                  <Settings size={20}/>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">请假种类</label>
              <div className="flex items-center gap-2">
                <select 
                  value={leaveType} 
                  onChange={e => setLeaveType(e.target.value)} 
                  className="flex-1 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                >
                  {leaveTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="其他 (Lain-lain)">其他 (手动输入) ...</option>
                </select>
                <button 
                  onClick={() => setShowManager('leaves')} 
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0 transition-colors"
                  title="管理请假种类"
                >
                  <Settings size={20}/>
                </button>
              </div>
              {leaveType === "其他 (Lain-lain)" && (
                <input 
                  type="text" 
                  placeholder="请输入假名..." 
                  value={customLeaveType} 
                  onChange={e => setCustomLeaveType(e.target.value)} 
                  className="w-full mt-3 p-4 bg-blue-50/30 border border-blue-100 rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">开始日期</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">结束日期</label>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
            </div>

            {/* Time Slip Toggle */}
            {(!leaveType.includes("CUTI REHAT") && !leaveType.includes("CUTI SAKIT") && !leaveType.includes("BERSALIN") && !leaveType.includes("KECEMASAN")) && (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer group hover:border-blue-200 transition-all">
                  <span className="text-sm font-black text-slate-600 flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${useTime ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Clock size={16}/>
                    </div>
                    设定具体时间
                  </span>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${useTime ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${useTime ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={useTime} onChange={e => setUseTime(e.target.checked)} />
                </label>
                
                {useTime && (
                  <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-4 animate-fade-in shadow-inner">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-blue-400 uppercase">From</span>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-3 bg-white border border-blue-100 rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-500"/>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-blue-400 uppercase">To</span>
                        <input 
                          type="time" 
                          value={endTime} 
                          disabled={isSelesai} 
                          onChange={e => setEndTime(e.target.value)} 
                          className={`w-full p-3 bg-white border border-blue-100 rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-500 ${isSelesai ? 'opacity-40 grayscale' : ''}`}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 text-xs font-black text-blue-600 cursor-pointer">
                      <input type="checkbox" checked={isSelesai} onChange={e => setIsSelesai(e.target.checked)} className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"/> 
                      直到活动结束 (SELESAI)
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-200/30 rounded-[32px] p-8 border border-slate-200 flex-1 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">请假条内容预览</h2>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-300"/>)}
              </div>
            </div>
            
            <div className="w-full flex-1 bg-white p-8 rounded-[24px] rounded-tl-none shadow-sm relative overflow-hidden group border border-slate-100">
              {/* Message Content */}
              <div className="relative z-10 text-xl leading-relaxed whitespace-pre-wrap font-bold text-slate-800 font-sans">
                {finalMessage}
              </div>
              
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            </div>

            <button 
              onClick={copyAndSave} 
              className={`w-full mt-10 py-5 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group overflow-hidden relative ${
                copiedStatus ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copiedStatus ? (
                <div className="flex items-center gap-2 animate-pulse">
                  <CheckCircle2 size={24}/> 已成功复制
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clipboard size={24} className="group-hover:rotate-12 transition-transform"/> 
                  复制并存入历史
                </div>
              )}
            </button>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">按下按钮后名单将自动通过云端备份</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSystemTab;
