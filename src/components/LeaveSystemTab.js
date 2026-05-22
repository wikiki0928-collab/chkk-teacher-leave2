import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Briefcase, Cloud, History, FileText, Settings, Clock, CheckCircle2, Clipboard, Calendar, Tag, AlertTriangle, RefreshCw } from 'lucide-react';
import DailyLeaveInspector from './DailyLeaveInspector';
import { getTodayYMD } from '../utils/helpers';

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
  copyOnly,
  copyAndSave,
  setShowHistory,
  setShowManager,
  historyRecords,
  setRecordToDelete,
  showToast
}) => {
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get all teachers currently on leave during [startDate, endDate]
  const teachersOnLeave = useMemo(() => {
    if (!startDate || !endDate) return new Set();
    const onLeaveSet = new Set();

    historyRecords.forEach(rec => {
      let sDate = rec.startDate;
      let eDate = rec.endDate;

      if (!sDate || !eDate) {
        // Fallback: parse from dateInfo
        const dateMatches = (rec.dateInfo || '').match(/(\d{2})\.(\d{2})\.(\d{4})/g);
        if (dateMatches && dateMatches[0]) {
          const [d1, m1, y1] = dateMatches[0].split('.');
          sDate = `${y1}-${m1}-${d1}`;
          eDate = sDate;
          if (dateMatches[1]) {
            const [d2, m2, y2] = dateMatches[1].split('.');
            eDate = `${y2}-${m2}-${d2}`;
          }
        }
      }

      if (sDate && eDate) {
        // Overlap check: sDate <= endDate AND eDate >= startDate
        if (sDate <= endDate && eDate >= startDate) {
          onLeaveSet.add(rec.teacher);
        }
      }
    });

    return onLeaveSet;
  }, [historyRecords, startDate, endDate]);

  // Filter out teachers who are already on leave
  const availableTeachers = useMemo(() => {
    return sortedTeachers.filter(t => !teachersOnLeave.has(t));
  }, [sortedTeachers, teachersOnLeave]);

  // Reset selected teacher if they are already on leave during selected date range
  useEffect(() => {
    if (selectedTeacher && teachersOnLeave.has(selectedTeacher)) {
      setSelectedTeacher("");
      if (showToast) {
        showToast(`⚠️ ${selectedTeacher} 在该日期区间已登记过请假，已重置选择`);
      }
    }
  }, [selectedTeacher, teachersOnLeave, setSelectedTeacher, showToast]);

  // Filter teachers by search query
  const filteredTeachersList = useMemo(() => {
    if (!teacherSearch.trim()) return availableTeachers;
    const query = teacherSearch.toLowerCase();
    return availableTeachers.filter(t => t.toLowerCase().includes(query));
  }, [availableTeachers, teacherSearch]);

  return (
    <div className="space-y-6">
      <DailyLeaveInspector historyRecords={historyRecords} setRecordToDelete={setRecordToDelete} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 glass-card p-6 rounded-[28px] border border-white/60">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-650 rounded-2xl border border-indigo-200/30">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">请假生成器</h1>
            <p className="text-slate-400 text-[10px] font-black mt-1 flex items-center gap-2 uppercase tracking-widest">
              {user ? (
                <span className="text-emerald-600 flex items-center gap-1.5"><Cloud size={13}/> Cloud Sync Active</span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5"><Cloud size={13}/> Offline Mode</span>
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-black border border-slate-200/80 hover:border-slate-300 hover:shadow-sm active:scale-95 transition-all duration-200"
        >
          <History size={18}/> 历史记录
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 glass-card rounded-[32px] p-8 space-y-8 border border-white/60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                <FileText size={18}/>
              </div>
              填写请假信息
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* 1. Date Selection & Presets */}
            <div className="p-5 bg-white/40 border border-slate-100 rounded-3xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  请假日期区间
                </span>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const today = getTodayYMD();
                      setStartDate(today);
                      setEndDate(today);
                    }}
                    className="px-3 py-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100/20 active:scale-95"
                  >
                    今天 (Hari Ini)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const dateObj = new Date();
                      const dayOfWeek = dateObj.getDay();
                      let shiftDays = 1;
                      if (dayOfWeek === 5) shiftDays = 3; // Fri -> Mon
                      else if (dayOfWeek === 6) shiftDays = 2; // Sat -> Mon
                      dateObj.setDate(dateObj.getDate() + shiftDays);
                      const y = dateObj.getFullYear();
                      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const d = String(dateObj.getDate()).padStart(2, '0');
                      const tomorrowStr = `${y}-${m}-${d}`;
                      setStartDate(tomorrowStr);
                      setEndDate(tomorrowStr);
                    }}
                    className="px-3 py-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100/20 active:scale-95"
                  >
                    明天 (Esok / Isnin)
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">开始日期</span>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-4 bg-white/80 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-550/10 focus:border-indigo-550 transition-all"/>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">结束日期</span>
                  <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full p-4 bg-white/80 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-550/10 focus:border-indigo-550 transition-all"/>
                </div>
              </div>
            </div>

            {/* 2. Time Slip Toggle */}
            {(!leaveType.includes("CUTI REHAT") && !leaveType.includes("CUTI SAKIT") && !leaveType.includes("BERSALIN") && !leaveType.includes("KECEMASAN")) && (
              <div className="p-5 bg-white/40 border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                <label className="flex items-center justify-between p-4 bg-white/70 border border-slate-200/60 rounded-2xl cursor-pointer group hover:border-indigo-200 transition-all duration-300">
                  <span className="text-sm font-bold text-slate-650 flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${useTime ? 'bg-indigo-650 text-white' : 'bg-slate-200 text-slate-450'}`}>
                      <Clock size={16}/>
                    </div>
                    设定具体时间
                  </span>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${useTime ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useTime ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={useTime} onChange={e => setUseTime(e.target.checked)} />
                </label>
                
                {useTime && (
                  <div className="p-5 bg-indigo-50/10 border border-indigo-100/50 rounded-2xl space-y-4 animate-fade-in shadow-inner">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">From</span>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-3.5 bg-white border border-indigo-100 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"/>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">To</span>
                        <input 
                          type="time" 
                          value={endTime} 
                          disabled={isSelesai} 
                          onChange={e => setEndTime(e.target.value)} 
                          className={`w-full p-3.5 bg-white border border-indigo-100 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${isSelesai ? 'opacity-40 grayscale' : ''}`}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 text-xs font-bold text-indigo-650 cursor-pointer select-none">
                      <input type="checkbox" checked={isSelesai} onChange={e => setIsSelesai(e.target.checked)} className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"/> 
                      直到活动结束 (SELESAI)
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* 3. Searchable Teacher Selection Dropdown */}
            <div className="p-5 bg-white/40 border border-slate-100 rounded-3xl space-y-4 shadow-sm">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-indigo-500" />
                教师姓名
              </span>
              <div className="flex items-center gap-3">
                <div className="relative flex-1" ref={dropdownRef}>
                  {/* Select Trigger Box */}
                  <div 
                    onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                    className={`p-4 bg-white/80 border border-slate-200 rounded-2xl font-bold cursor-pointer hover:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-300 flex items-center justify-between select-none ${
                      !selectedTeacher ? 'text-slate-400 font-semibold' : 'text-slate-800'
                    }`}
                  >
                    <span>{selectedTeacher || '-- 请选择老师 --'}</span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </div>

                  {/* Dropdown Options Popup */}
                  {isTeacherDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in max-h-72 flex flex-col">
                      {/* Search Bar inside Dropdown */}
                      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                        <input 
                          type="text" 
                          placeholder="输入字符搜索姓名..." 
                          value={teacherSearch}
                          onChange={e => setTeacherSearch(e.target.value)}
                          onClick={e => e.stopPropagation()} 
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                          autoFocus
                        />
                      </div>
                      
                      {/* Conflicts list rendered as beautiful pill badges */}
                      {teachersOnLeave.size > 0 && (
                        <div className="px-4 py-3 bg-amber-50 text-[10px] text-amber-800 border-b border-amber-100/50 flex flex-col gap-2 select-none">
                          <span className="font-black flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-600"/> 以下教师在该日期区间已请假（已自动隐藏）：</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(teachersOnLeave).map(name => (
                              <span key={name} className="px-2 py-0.5 bg-amber-100 text-amber-700 font-extrabold rounded-md shadow-sm border border-amber-200/50">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Options List */}
                      <div className="overflow-y-auto flex-1 max-h-52 divide-y divide-slate-100">
                        <div 
                          onClick={() => {
                            setSelectedTeacher("");
                            setTeacherSearch("");
                            setIsTeacherDropdownOpen(false);
                          }}
                          className="p-3.5 hover:bg-slate-50 font-bold text-xs text-rose-500 cursor-pointer transition-colors"
                        >
                          -- 清空已选老师 --
                        </div>

                        {filteredTeachersList.length > 0 ? (
                          filteredTeachersList.map(t => (
                            <div 
                              key={t}
                              onClick={() => {
                                setSelectedTeacher(t);
                                setTeacherSearch("");
                                setIsTeacherDropdownOpen(false);
                              }}
                              className={`p-3.5 hover:bg-indigo-50/50 font-bold text-sm text-slate-700 cursor-pointer transition-colors flex items-center justify-between ${
                                selectedTeacher === t ? 'bg-indigo-50/80 text-indigo-650 font-extrabold' : ''
                              }`}
                            >
                              <span>{t}</span>
                              {selectedTeacher === t && <span className="text-xs text-indigo-650 font-black">✓</span>}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs font-bold text-slate-400">
                            未找到符合的教师
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowManager('teachers')} 
                  className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-650 hover:bg-indigo-50/30 hover:border-indigo-200 flex-shrink-0 transition-all active:scale-95 h-[58px] flex items-center justify-center shadow-sm"
                  title="管理教师名单"
                >
                  <Settings size={20}/>
                </button>
              </div>
            </div>

            {/* 4. Leave Type Selection */}
            <div className="p-5 bg-white/40 border border-slate-100 rounded-3xl space-y-4 shadow-sm">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-indigo-500" />
                请假种类
              </span>
              <div className="flex items-center gap-3">
                <select 
                  value={leaveType} 
                  onChange={e => setLeaveType(e.target.value)} 
                  className={`flex-1 p-4 bg-white/80 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-300 font-sans ${
                    !leaveType ? 'text-slate-400 font-semibold' : 'text-slate-850'
                  }`}
                >
                  <option value="" className="text-slate-400 font-semibold">-- 请选择请假种类 --</option>
                  {leaveTypesList.map(t => <option key={t} value={t} className="text-slate-800 font-bold">{t}</option>)}
                  <option value="其他 (Lain-lain)" className="text-slate-800 font-bold">其他 (手动输入) ...</option>
                </select>
                <button 
                  onClick={() => setShowManager('leaves')} 
                  className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-650 hover:bg-indigo-50/30 hover:border-indigo-200 flex-shrink-0 transition-all active:scale-95 h-[58px] flex items-center justify-center shadow-sm"
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
                  className="w-full mt-3 p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl font-bold uppercase outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Digital Slip Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-card rounded-[32px] p-8 border border-white/60 flex-1 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-indigo-500 animate-pulse" />
                请假通知单预览 (Slip Preview)
              </h2>
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-200"/>)}
              </div>
            </div>
            
            {/* Elegant physical ticket mockup */}
            <div 
              className="w-full flex-1 bg-gradient-to-br from-indigo-650 to-violet-750 p-6 rounded-[24px] shadow-2xl relative overflow-hidden group border border-white/10 flex flex-col justify-between min-h-[300px] text-white"
              style={{ 
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(135deg, #4f46e5 0%, #312e81 100%)', 
                backgroundSize: '16px 16px, 100% 100%' 
              }}
            >
              {/* Ticket Header */}
              <div className="relative z-10 flex justify-between items-start border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-indigo-200">SJKC CHUNG HWA KK</span>
                  <h3 className="text-xs font-extrabold tracking-wider">LEAVE REGISTER FORM</h3>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-mono tracking-widest text-indigo-300">REF: OFF-{new Date().getFullYear()}</span>
                </div>
              </div>

              {/* Perforated dashed divider with ticket notches */}
              <div className="border-t border-dashed border-white/20 my-4 relative">
                <div className="absolute -left-[33px] -top-[9px] h-[18px] w-[18px] rounded-full bg-white/70 backdrop-blur-md shadow-inner border border-slate-200/50"></div>
                <div className="absolute -right-[33px] -top-[9px] h-[18px] w-[18px] rounded-full bg-white/70 backdrop-blur-md shadow-inner border border-slate-200/50"></div>
              </div>
              
              {/* Message Content */}
              <div className="relative z-10 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-bold tracking-wide flex-1 flex flex-col justify-center py-4 px-2 select-text selection:bg-indigo-300/40">
                {finalMessage}
              </div>
              
              {/* Decorative barcode & details */}
              <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex flex-col items-center gap-1.5 select-none">
                <div className="flex items-center gap-[1px] h-6 opacity-30">
                  {[3,1,2,4,1,3,2,1,4,2,3,1,2,1,4,3,2,1,2,1,4,1].map((w, i) => (
                    <div key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[7px] font-mono tracking-[0.35em] text-indigo-200/60 uppercase">LEAVE-GENERATOR-v2.0</span>
              </div>
              
              {/* Glowing decorative orbs in background */}
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125 pointer-events-none" />
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            <div className="w-full mt-8 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={copyOnly} 
                  className={`flex-1 py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center gap-2 border-2 active:scale-[0.97] group overflow-hidden ${
                    copiedStatus === 'copy'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 shadow-sm'
                  }`}
                  style={{ paddingBlock: '16px' }}
                >
                  {copiedStatus === 'copy' ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <CheckCircle2 size={18}/> 已成功复制
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clipboard size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors"/> 
                      仅复制文本
                    </div>
                  )}
                </button>

                <button 
                  onClick={copyAndSave} 
                  className={`flex-1 py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.97] group overflow-hidden relative shadow-lg ${
                    copiedStatus === 'save'
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-105 shadow-indigo-600/15'
                  }`}
                  style={{ paddingBlock: '16px' }}
                >
                  {copiedStatus === 'save' ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <CheckCircle2 size={18}/> 已复制并存入历史
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clipboard size={18} className="group-hover:rotate-12 transition-transform"/> 
                      复制并存入历史
                    </div>
                  )}
                </button>
              </div>

              {/* Reset Form Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTeacher("");
                  setLeaveType("");
                  setCustomLeaveType("");
                  setStartDate(getTodayYMD());
                  setEndDate(getTodayYMD());
                  setUseTime(false);
                  setStartTime("08:00");
                  setEndTime("10:00");
                  setIsSelesai(false);
                }}
                className="w-full py-3.5 bg-slate-100/80 hover:bg-slate-200/80 hover:text-slate-700 active:scale-[0.98] transition-all rounded-[16px] text-xs font-black text-slate-500 tracking-wider uppercase border border-slate-200/50 flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} />
                重置填写信息 (Reset Form)
              </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center select-none">
              {copiedStatus === 'copy' ? '已复制，未上传云端历史' : '“复制并存入历史” 将自动通过云端备份记录'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSystemTab;
