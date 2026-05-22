import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Briefcase, BarChart3, FileImage, ClipboardCheck, Clipboard, Calendar } from 'lucide-react';

import { useFirebaseData } from './hooks/useFirebaseData';
import { usePdfConverter } from './hooks/usePdfConverter';

import { bulanMelayu, hariMelayu } from './constants/data';
import { countWorkDays, formatTimeTo12h, getRecordCategory, getDayName, getTodayYMD } from './utils/helpers';

import LeaveSystemTab from './components/LeaveSystemTab';
import StatsTab from './components/StatsTab';
import PdfToolTab from './components/PdfToolTab';
import CalendarTab from './components/CalendarTab';

import HistoryModal from './components/HistoryModal';
import ManagerModal from './components/ManagerModal';
import BaselineModal from './components/BaselineModal';
import DetailViewModal from './components/DetailViewModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EditRecordModal from './components/EditRecordModal';

import { doc, deleteDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('leave');
  const tableRef = useRef(null);

  const [toastMsg, setToastMsg] = useState("");
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToEdit, setRecordToEdit] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Custom Hooks
  const {
    user,
    teachersList,
    leaveTypesList,
    archivedTeachers,
    historyRecords,
    availableYears,
    baselineCuti,
    isSyncing,
    updateConfigList,
    saveBaselineData,
    archiveTeacher,
    restoreTeacher,
    loadYearData,
    subscribeToYear,
    updateYearIndex,
    invalidateCacheForYear,
  } = useFirebaseData(showToast);

  const {
    pdfImages,
    isConverting,
    isZipping,
    processPdfFile,
    downloadAllAsZip
  } = usePdfConverter(showToast);

  // Local UI State
  const [showHistory, setShowHistory] = useState(false);
  const [showManager, setShowManager] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [startDate, setStartDate] = useState(getTodayYMD());
  const [endDate, setEndDate] = useState(getTodayYMD());
  const [useTime, setUseTime] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSelesai, setIsSelesai] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(null); // 'copy' | 'save' | null

  const currentJsMonth = new Date().getMonth();
  const [statYear, setStatYear] = useState(new Date().getFullYear().toString());
  const [statMonth, setStatMonth] = useState((currentJsMonth + 1).toString());
  const [statSearch, setStatSearch] = useState("");
  const [statSortMode, setStatSortMode] = useState("alphabet");
  const [detailView, setDetailView] = useState({ isOpen: false, teacher: '', category: '', monthFilter: '' });
  const [isExporting, setIsExporting] = useState(false);

  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [parsedBaseline, setParsedBaseline] = useState([]);

  const [isDragging, setIsDragging] = useState(false);

  const sortedTeachers = useMemo(() => [...teachersList].sort((a, b) => a.localeCompare(b)), [teachersList]);



  // When statYear changes to a past year, load its data on demand
  const currentCalendarYear = new Date().getFullYear().toString();
  useEffect(() => {
    if (statYear === currentCalendarYear) {
      // Current year is already handled by the real-time listener
      return;
    }
    loadYearData(statYear);
  }, [statYear, loadYearData, currentCalendarYear]);

  // When startDate or endDate spans a different year, load that year's data on demand for conflict detection
  useEffect(() => {
    if (!startDate || !endDate) return;
    const startYear = startDate.substring(0, 4);
    const endYear = endDate.substring(0, 4);
    if (startYear) loadYearData(startYear);
    if (endYear && endYear !== startYear) loadYearData(endYear);
  }, [startDate, endDate, loadYearData]);

  const getDateLine = () => {
    const f = (d) => d.split("-").reverse().join(".");
    const datePart = startDate !== endDate ? `${f(startDate)} - ${f(endDate)}` : f(startDate);
    
    const dayPart = startDate !== endDate 
      ? `${getDayName(startDate)} - ${getDayName(endDate)}` 
      : getDayName(startDate);

    let details = [dayPart];
    
    if (leaveType.includes("CUTI REHAT") || leaveType.includes("CUTI SAKIT") || leaveType.includes("BERSALIN") || leaveType.includes("KECEMASAN")) {
      details.push(`${countWorkDays(startDate, endDate)} HARI`);
    } else if (useTime) {
      details.push(`${formatTimeTo12h(startTime)} - ${isSelesai ? 'SELESAI' : formatTimeTo12h(endTime)}`);
    }

    return `${datePart} (${details.join(", ")})`;
  };

  const getLeaveTypeDisplay = () => {
    if (!leaveType) return '[请选择请假种类]';
    if (leaveType === "其他 (Lain-lain)") return customLeaveType ? customLeaveType.toUpperCase() : '[请输入请假种类]';
    return leaveType;
  };

  const finalMessage = `**${selectedTeacher || '[请选择老师]'}**\n${getLeaveTypeDisplay()}\n${getDateLine()}`;

  const fallbackCopyTextToClipboard = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  };

  const copyOnly = async () => {
    if (!selectedTeacher) {
      showToast("⚠️ 请先选择一位老师！");
      return;
    }
    if (!leaveType) {
      showToast("⚠️ 请先选择请假种类！");
      return;
    }
    if (leaveType === "其他 (Lain-lain)" && !customLeaveType.trim()) {
      showToast("⚠️ 请输入具体请假种类！");
      return;
    }
    let copySuccess = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(finalMessage);
        copySuccess = true;
      } else {
        copySuccess = fallbackCopyTextToClipboard(finalMessage);
      }
    } catch (err) {
      copySuccess = fallbackCopyTextToClipboard(finalMessage);
    }

    if (copySuccess) {
      setCopiedStatus('copy');
      setTimeout(() => setCopiedStatus(null), 2000);
      showToast("✅ 已成功复制文本");
    } else {
      showToast("❌ 复制失败，请手动复制");
    }
  };

  const copyAndSave = async () => {
    if (!selectedTeacher) {
      showToast("⚠️ 请先选择一位老师！");
      return;
    }
    if (!leaveType) {
      showToast("⚠️ 请先选择请假种类！");
      return;
    }
    if (leaveType === "其他 (Lain-lain)" && !customLeaveType.trim()) {
      showToast("⚠️ 请输入具体请假种类！");
      return;
    }
    let copySuccess = false;
    
    // 1. 尝试复制文本 (通过 try-catch 单独包裹，避免因为 iframe 权限引起整个函数崩溃)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(finalMessage);
        copySuccess = true;
      } else {
        copySuccess = fallbackCopyTextToClipboard(finalMessage);
      }
    } catch (err) {
      copySuccess = fallbackCopyTextToClipboard(finalMessage);
    }

    if (copySuccess) {
      setCopiedStatus('save');
      setTimeout(() => setCopiedStatus(null), 2000);
    }

    // 2. 执行云端存档
    try {
      if (!user) {
        showToast(copySuccess ? "复制成功！离线模式未能存档到云端！" : "⚠️ 复制受限！离线模式未能存档到云端！");
        return;
      }
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leave_history'), {
        teacher: selectedTeacher,
        type: leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType,
        dateInfo: getDateLine(),
        startDate: startDate,
        endDate: endDate,
        createdAt: serverTimestamp()
      });
      // Ensure the leave's year is registered in the year index
      const leaveYear = startDate.substring(0, 4);
      await updateYearIndex(leaveYear);
      showToast(copySuccess ? "✅ 已复制并存入历史记录" : "✅ 存入记录成功 (Google Sites等环境受限，请手动复制)");
    } catch (e) {
      showToast("❌ 存档失败");
      console.error(e);
    }
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leave_history', recordToDelete.id));
      // Invalidate cache for that record's year so next load is fresh
      if (recordToDelete.startDate) invalidateCacheForYear(recordToDelete.startDate.substring(0, 4));
      showToast("✅ 记录已成功删除");
      if (detailView.isOpen && detailRecords.length <= 1) {
        setDetailView({ ...detailView, isOpen: false });
      }
    } catch (e) {
      showToast("❌ 删除失败");
    } finally {
      setRecordToDelete(null);
    }
  };

  const handleUpdateRecord = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leave_history', id), updatedData);
      // Invalidate cache for old year and new year
      if (updatedData.startDate) invalidateCacheForYear(updatedData.startDate.substring(0, 4));
      showToast("✅ 记录已成功修改");
    } catch (e) {
      showToast("❌ 修改失败");
      throw e;
    }
  };

  // availableYears now comes from the hook (year_index in Firestore)

  const sjkcStats = useMemo(() => {
    const statsMap = {};
    sortedTeachers.forEach(t => {
      const baseNum = baselineCuti[t] || 0;
      statsMap[t] = {
        name: t,
        prev_cuti: baseNum,
        cur_crk_cr: 0, cur_sakit: 0, cur_timeslip: 0, cur_bersalin: 0,
        cur_rasmi: 0, prev_rasmi: 0
      };
    });

    historyRecords.forEach(rec => {
      const dateMatch = rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (!dateMatch) return;

      const recYear = dateMatch[3];
      if (recYear !== statYear) return;

      const recMonth = parseInt(dateMatch[2], 10);
      const selMonth = parseInt(statMonth, 10);
      const tName = rec.teacher;
      if (!statsMap[tName]) return;

      let days = 1;
      const daysMatch = rec.dateInfo.match(/\((\d+)\s+HARI\)/i);
      if (daysMatch) {
        days = parseInt(daysMatch[1], 10);
      } else {
        const rangeMatch = rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2})\.(\d{2})\.(\d{4})/);
        if (rangeMatch) {
          const sDate = `${rangeMatch[3]}-${rangeMatch[2]}-${rangeMatch[1]}`;
          const eDate = `${rangeMatch[6]}-${rangeMatch[5]}-${rangeMatch[4]}`;
          days = countWorkDays(sDate, eDate);
        }
      }

      const category = getRecordCategory(rec.type);

      if (recMonth < selMonth) {
        if (category === 'RASMI') statsMap[tName].prev_rasmi += days;
        else if (category === 'TIMESLIP') statsMap[tName].prev_cuti += 1;
        else statsMap[tName].prev_cuti += days;
      } else if (recMonth === selMonth) {
        if (category === 'CRK_CR') statsMap[tName].cur_crk_cr += days;
        else if (category === 'SAKIT') statsMap[tName].cur_sakit += days;
        else if (category === 'TIMESLIP') statsMap[tName].cur_timeslip += 1;
        else if (category === 'BERSALIN') statsMap[tName].cur_bersalin += days;
        else if (category === 'RASMI') statsMap[tName].cur_rasmi += days;
      }
    });

    return Object.values(statsMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [historyRecords, statYear, statMonth, sortedTeachers, baselineCuti]);

  const filteredSjkcStats = useMemo(() => {
    if (!statSearch) return sjkcStats;
    return sjkcStats.filter(t => t.name.toLowerCase().includes(statSearch.toLowerCase()));
  }, [sjkcStats, statSearch]);

  const sortedAndFilteredStats = useMemo(() => {
    let result = [...filteredSjkcStats];
    if (statSortMode === 'cuti_desc') {
      result.sort((a, b) => {
        const totalA = a.prev_cuti + a.cur_crk_cr + a.cur_sakit + a.cur_timeslip + a.cur_bersalin;
        const totalB = b.prev_cuti + b.cur_crk_cr + b.cur_sakit + b.cur_timeslip + b.cur_bersalin;
        if (totalB !== totalA) return totalB - totalA;
        return a.name.localeCompare(b.name);
      });
    } else if (statSortMode === 'rasmi_desc') {
      result.sort((a, b) => {
        const rasmiA = a.prev_rasmi + a.cur_rasmi;
        const rasmiB = b.prev_rasmi + b.cur_rasmi;
        if (rasmiB !== rasmiA) return rasmiB - rasmiA;
        return a.name.localeCompare(b.name);
      });
    }
    return result;
  }, [filteredSjkcStats, statSortMode]);

  const detailRecords = useMemo(() => {
    if (!detailView.isOpen) return [];
    return historyRecords.filter(rec => {
      if (rec.teacher !== detailView.teacher) return false;
      const dateMatch = rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (!dateMatch || dateMatch[3] !== statYear) return false;
      const recMonth = parseInt(dateMatch[2], 10);
      const selMonth = parseInt(statMonth, 10);
      if (detailView.monthFilter === 'prev' && recMonth >= selMonth) return false;
      if (detailView.monthFilter === 'cur' && recMonth !== selMonth) return false;
      if (detailView.monthFilter === 'total' && recMonth > selMonth) return false;
      const category = getRecordCategory(rec.type);
      if (detailView.category === 'ALL_CUTI') return category !== 'RASMI';
      return category === detailView.category;
    });
  }, [historyRecords, detailView, statYear, statMonth]);

  const handleParseImport = () => {
    if (!importText.trim()) return showToast("⚠️ 请先粘贴 Excel 内容！");
    const lines = importText.split('\n');
    const parsed = [];
    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(/\t+/);
      if (parts.length >= 2) {
        const name = parts[0].trim().toUpperCase();
        const val = parseInt(parts[1].trim(), 10);
        if (!isNaN(val)) {
          parsed.push({ name, value: val, matched: sortedTeachers.includes(name) });
        }
      }
    });
    setParsedBaseline(parsed);
  };

  const handleSaveBaseline = async () => {
    const newData = { ...baselineCuti };
    let sc = 0;
    parsedBaseline.forEach(it => { if (it.matched) { newData[it.name] = it.value; sc++; } });
    const ok = await saveBaselineData(newData);
    if (ok) {
      setShowBaselineModal(false);
      setParsedBaseline([]);
      setImportText("");
      showToast(`✅ 成功导入 ${sc} 位老师的数据！`);
    } else {
      showToast("❌ 导入失败，请重试");
    }
  };

  const exportToPDF = () => {
    if (!window.html2pdf || !tableRef.current) return showToast("⏳ PDF导出引擎准备中...");
    setIsExporting(true);
    showToast("⏳ 正在生成报表...");
    setTimeout(() => {
      const element = tableRef.current;
      const opt = {
        margin: 10,
        filename: `Leave_Stats_${bulanMelayu[parseInt(statMonth) - 1]}_${statYear}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
        showToast("✅ PDF 下载完成");
      }).catch(() => {
        setIsExporting(false);
        showToast("❌ 导出失败");
      });
    }, 300);
  };

  const bulanString = bulanMelayu[parseInt(statMonth) - 1];

  return (
    <div className="min-h-screen pb-16 relative">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white/80 backdrop-blur-2xl text-slate-800 px-8 py-4.5 rounded-[24px] shadow-2xl shadow-indigo-500/10 font-black text-sm border border-white/90 flex items-center gap-3 animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          {toastMsg}
        </div>
      )}

      {/* Header Area */}
      <div className="pt-10 pb-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-lg shadow-slate-100/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-550 to-violet-550/10 border border-indigo-100 rounded-full text-indigo-650 text-xs font-black tracking-wider uppercase mb-3 select-none">
              ✨ Premium Edition
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl flex items-center gap-3">
              老师请假管理系统
              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-lg shadow-sm shadow-indigo-600/20">v2.0</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2 flex items-center gap-2 text-xs">
              官方高清字体渲染 <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span> 云端数据实时同步
            </p>
          </div>
          
          <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-[22px] border border-white/80 shadow-md shadow-indigo-150/5 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('leave')} 
              className={`flex items-center gap-2.5 py-3.5 px-6 rounded-[18px] font-black text-sm transition-all duration-300 whitespace-nowrap active:scale-[0.97] ${
                activeTab === 'leave' 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/15' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Briefcase size={16} className={activeTab === 'leave' ? 'animate-pulse' : ''} />
              请假登记
            </button>
            
            <button 
              onClick={() => setActiveTab('stats')} 
              className={`flex items-center gap-2.5 py-3.5 px-6 rounded-[18px] font-black text-sm transition-all duration-300 whitespace-nowrap active:scale-[0.97] ${
                activeTab === 'stats' 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/15' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 size={16} className={activeTab === 'stats' ? 'animate-pulse' : ''} />
              数据统计
            </button>
            
            <button 
              onClick={() => setActiveTab('calendar')} 
              className={`flex items-center gap-2.5 py-3.5 px-6 rounded-[18px] font-black text-sm transition-all duration-300 whitespace-nowrap active:scale-[0.97] ${
                activeTab === 'calendar' 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/15' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Calendar size={16} className={activeTab === 'calendar' ? 'animate-pulse' : ''} />
              请假日历
            </button>
            
            <button 
              onClick={() => setActiveTab('pdf')} 
              className={`flex items-center gap-2.5 py-3.5 px-6 rounded-[18px] font-black text-sm transition-all duration-300 whitespace-nowrap active:scale-[0.97] ${
                activeTab === 'pdf' 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/15' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileImage size={16} className={activeTab === 'pdf' ? 'animate-pulse' : ''} />
              PDF转换
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-8 animate-fade-in">
        {activeTab === 'leave' && (
          <LeaveSystemTab 
            user={user}
            selectedTeacher={selectedTeacher}
            setSelectedTeacher={setSelectedTeacher}
            sortedTeachers={sortedTeachers}
            leaveType={leaveType}
            setLeaveType={setLeaveType}
            leaveTypesList={leaveTypesList}
            customLeaveType={customLeaveType}
            setCustomLeaveType={setCustomLeaveType}
            startDate={startDate}
            setStartDate={(val) => {
              const oldStart = startDate;
              setStartDate(val);
              // Logic: If it was a single day selection (start == end), sync end date to new start date.
              // This makes 1-day leave registration extremely fast.
              if (oldStart === endDate || val > endDate) {
                setEndDate(val);
              }
            }}
            endDate={endDate}
            setEndDate={setEndDate}
            useTime={useTime}
            setUseTime={setUseTime}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            isSelesai={isSelesai}
            setIsSelesai={setIsSelesai}
            copiedStatus={copiedStatus}
            finalMessage={finalMessage}
            copyOnly={copyOnly}
            copyAndSave={copyAndSave}
            setShowHistory={setShowHistory}
            setShowManager={setShowManager}
            historyRecords={historyRecords}
            setRecordToDelete={setRecordToDelete}
            showToast={showToast}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab 
            setShowBaselineModal={setShowBaselineModal}
            exportToPDF={exportToPDF}
            isExporting={isExporting}
            statSortMode={statSortMode}
            setStatSortMode={setStatSortMode}
            statSearch={statSearch}
            setStatSearch={setStatSearch}
            statMonth={statMonth}
            setStatMonth={setStatMonth}
            statYear={statYear}
            setStatYear={setStatYear}
            bulanMelayu={bulanMelayu}
            availableYears={availableYears}
            tableRef={tableRef}
            bulanString={bulanString}
            sortedAndFilteredStats={sortedAndFilteredStats}
            setDetailView={setDetailView}
            setRecordToEdit={setRecordToEdit}
            baselineCuti={baselineCuti}
            filteredSjkcStats={filteredSjkcStats}
            historyRecords={historyRecords}
          />
        )}

        {activeTab === 'pdf' && (
          <PdfToolTab 
            isDragging={isDragging}
            handleDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            handleDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            handleDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processPdfFile(f); }}
            isConverting={isConverting}
            handlePdfUpload={(e) => { const f = e.target.files[0]; if(f) processPdfFile(f); }}
            pdfImages={pdfImages}
            downloadAllAsZip={downloadAllAsZip}
            isZipping={isZipping}
            downloadImage={(url, idx) => { const a = document.createElement('a'); a.href = url; a.download = `Page_${idx+1}.jpg`; a.click(); }}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarTab 
            historyRecords={historyRecords}
            bulanMelayu={bulanMelayu}
            hariMelayu={hariMelayu}
          />
        )}
      </div>

      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} historyRecords={historyRecords} setRecordToDelete={setRecordToDelete} setRecordToEdit={setRecordToEdit} loadYearData={loadYearData} availableYears={availableYears} />
      <ManagerModal showManager={showManager} onClose={() => setShowManager(null)} teachersList={teachersList} sortedTeachers={sortedTeachers} leaveTypesList={leaveTypesList} updateList={updateConfigList} archivedTeachers={archivedTeachers} archiveTeacher={archiveTeacher} restoreTeacher={restoreTeacher} historyRecords={historyRecords} baselineCuti={baselineCuti} loadYearData={loadYearData} availableYears={availableYears} />
      <BaselineModal showBaselineModal={showBaselineModal} onClose={() => setShowBaselineModal(false)} importText={importText} setImportText={setImportText} handleParseImport={handleParseImport} parsedBaseline={parsedBaseline} saveBaseline={handleSaveBaseline} />
      <DetailViewModal detailView={detailView} onClose={() => setDetailView({ isOpen: false, teacher: '', category: '', monthFilter: '' })} baselineCuti={baselineCuti} detailRecords={detailRecords} setRecordToDelete={setRecordToDelete} setRecordToEdit={setRecordToEdit} bulanString={bulanString} statYear={statYear} />
      <DeleteConfirmModal recordToDelete={recordToDelete} onClose={() => setRecordToDelete(null)} onConfirm={confirmDeleteRecord} />
      <EditRecordModal record={recordToEdit} onClose={() => setRecordToEdit(null)} onUpdate={handleUpdateRecord} teachersList={teachersList} leaveTypesList={leaveTypesList} />
    </div>
  );
}
