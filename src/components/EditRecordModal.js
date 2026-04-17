import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, X, User, Tag, CalendarDays, CheckCircle, Clock, Settings } from 'lucide-react';
import { countWorkDays, formatTimeTo12h } from '../utils/helpers';

const EditRecordModal = ({ record, onClose, onUpdate, teachersList, leaveTypesList }) => {
  const [teacher, setTeacher] = useState('');
  const [type, setType] = useState('');
  const [isOtherType, setIsOtherType] = useState(false);
  const [customType, setCustomType] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useTime, setUseTime] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isSelesai, setIsSelesai] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);

  const parse12hTo24h = (timeStr) => {
    const match = timeStr.match(/(\d{1,2})\.(\d{2})\s*(A\.M\.|P\.M\.)/i);
    if (!match) return '08:00';
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm.includes('P.M') && h < 12) h += 12;
    if (ampm.includes('A.M') && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  useEffect(() => {
    if (record) {
      setTeacher(record.teacher || '');
      
      const isPredefined = leaveTypesList.includes(record.type);
      if (isPredefined) {
        setType(record.type);
        setIsOtherType(false);
      } else {
        setType('其他 (Lain-lain)');
        setIsOtherType(true);
        setCustomType(record.type || '');
      }

      // Parse dateInfo
      const str = record.dateInfo || '';
      const dateMatches = str.match(/(\d{2})\.(\d{2})\.(\d{4})/g);
      if (dateMatches && dateMatches[0]) {
        const [d, m, y] = dateMatches[0].split('.');
        const s = `${y}-${m}-${d}`;
        setStartDate(s);
        if (dateMatches[1]) {
          const [d2, m2, y2] = dateMatches[1].split('.');
          setEndDate(`${y2}-${m2}-${d2}`);
        } else {
          setEndDate(s);
        }
      }

      const useT = str.includes('(') && !str.includes('HARI');
      setUseTime(useT);
      if (useT) {
        const timePart = str.match(/\((.*?)\)/)?.[1];
        if (timePart && timePart.includes('-')) {
          const parts = timePart.split('-');
          const startStr = parts[0].trim();
          const endStr = parts[1].trim();
          setStartTime(parse12hTo24h(startStr));
          if (endStr.includes('SELESAI')) {
            setIsSelesai(true);
          } else {
            setIsSelesai(false);
            setEndTime(parse12hTo24h(endStr));
          }
        }
      }
    }
  }, [record, leaveTypesList]);

  const getDateLine = () => {
    const f = (d) => d.split("-").reverse().join(".");
    const datePart = startDate !== endDate ? `${f(startDate)} - ${f(endDate)}` : f(startDate);
    let res = datePart;
    const finalType = isOtherType ? customType.toUpperCase() : type;

    if (finalType.includes("CUTI REHAT") || finalType.includes("CUTI SAKIT") || finalType.includes("BERSALIN") || finalType.includes("KECEMASAN")) {
      res += ` (${countWorkDays(startDate, endDate)} HARI)`;
    } else if (useTime) {
      res += ` (${formatTimeTo12h(startTime)} - ${isSelesai ? 'SELESAI' : formatTimeTo12h(endTime)})`;
    }
    return res;
  };

  const sortedTeachers = useMemo(() => [...teachersList].sort((a, b) => a.localeCompare(b)), [teachersList]);

  if (!record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdate(record.id, {
        teacher,
        type: isOtherType ? customType.toUpperCase() : type,
        dateInfo: getDateLine(),
        startDate,
        endDate
      });
        // Note: No need to modify onUpdate in App.js as it already passes through the object
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200 h-[90vh] md:h-auto">
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-blue-50/50 flex-shrink-0">
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

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Teacher Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">教师姓名</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">
                  <User size={20} />
                </div>
                <select 
                  value={teacher} 
                  onChange={e => setTeacher(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none"
                >
                  {sortedTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">请假种类</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">
                  <Tag size={20} />
                </div>
                <select 
                  value={type} 
                  onChange={e => {
                    const val = e.target.value;
                    setType(val);
                    setIsOtherType(val === '其他 (Lain-lain)');
                  }} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none"
                >
                  {leaveTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="其他 (Lain-lain)">其他 (手动输入) ...</option>
                </select>
              </div>
              {isOtherType && (
                <input 
                  type="text" 
                  placeholder="请输入假名..." 
                  value={customType} 
                  onChange={e => setCustomType(e.target.value)} 
                  className="w-full mt-3 p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-black uppercase outline-none focus:border-blue-500 animate-in fade-in slide-in-from-top-2"
                />
              )}
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={18} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">日期与时间</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-1">开始日期</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); if(endDate < e.target.value) setEndDate(e.target.value); }} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-400"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-1">结束日期</label>
                  <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-400"/>
                </div>
              </div>

              {/* Time Slip Toggle (logic matched App.js) */}
              {(!type.includes("CUTI REHAT") && !type.includes("CUTI SAKIT") && !type.includes("BERSALIN") && !type.includes("KECEMASAN")) && (
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer group hover:border-blue-200 transition-all">
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
                    <div className="p-5 bg-blue-50/30 border-2 border-blue-100 rounded-2xl space-y-4 animate-in fade-in zoom-in-95">
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

          {/* Footer Actions */}
          <div className="pt-6 flex gap-4 bg-white sticky bottom-0 border-t border-slate-50 -mx-2 px-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className={`flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
