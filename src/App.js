import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Briefcase, BarChart3, FileImage } from 'lucide-react';
import { doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

import { auth, db, appId } from './lib/firebase';
import { rawTeachers, rawLeaveTypes, bulanMelayu } from './constants/data';
import { countWorkDays, formatTimeTo12h, getRecordCategory } from './utils/helpers';

import LeaveSystemTab from './components/LeaveSystemTab';
import StatsTab from './components/StatsTab';
import PdfToolTab from './components/PdfToolTab';

import HistoryModal from './components/HistoryModal';
import ManagerModal from './components/ManagerModal';
import BaselineModal from './components/BaselineModal';
import DetailViewModal from './components/DetailViewModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('leave'); 
  const tableRef = useRef(null); 

  const [toastMsg, setToastMsg] = useState("");
  const [recordToDelete, setRecordToDelete] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const [user, setUser] = useState(null);
  const [teachersList, setTeachersList] = useState(rawTeachers);
  const [leaveTypesList, setLeaveTypesList] = useState(rawLeaveTypes);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [baselineCuti, setBaselineCuti] = useState({});
  const [isSyncing, setIsSyncing] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showManager, setShowManager] = useState(null);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [useTime, setUseTime] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSelesai, setIsSelesai] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

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

  const [pdfImages, setPdfImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { 
        setIsSyncing(false); 
      }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return; 
    setIsSyncing(true);

    const teachersRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'teachers_list');
    const unsubTeachers = onSnapshot(teachersRef, (snap) => {
      if (snap.exists()) setTeachersList(snap.data().list || []);
      else setDoc(snap.ref, { list: rawTeachers });
      setIsSyncing(false);
    });

    const leavesRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'leave_types');
    const unsubLeaves = onSnapshot(leavesRef, (snap) => {
      if (snap.exists()) setLeaveTypesList(snap.data().list || []);
      else setDoc(snap.ref, { list: rawLeaveTypes });
    });

    const baselineRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'baseline_cuti');
    const unsubBaseline = onSnapshot(baselineRef, (snap) => {
      if (snap.exists()) setBaselineCuti(snap.data().data || {});
      else setDoc(snap.ref, { data: {} });
    });

    const qHistory = collection(db, 'artifacts', appId, 'public', 'data', 'leave_history');
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setHistoryRecords(sorted);
    });

    return () => { unsubTeachers(); unsubLeaves(); unsubBaseline(); unsubHistory(); };
  }, [user]);

  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setPdfjsLoaded(true);
      };
      document.body.appendChild(script);
    } else { setPdfjsLoaded(true); }

    if (!window.JSZip) {
      const scriptZip = document.createElement('script');
      scriptZip.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      document.body.appendChild(scriptZip);
    }

    if (!window.html2pdf) {
      const scriptPdf = document.createElement('script');
      scriptPdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.body.appendChild(scriptPdf);
    }
  }, []);

  const sortedTeachers = useMemo(() => [...teachersList].sort((a, b) => a.localeCompare(b)), [teachersList]);
  
  useEffect(() => {
    if (sortedTeachers.length > 0 && !selectedTeacher) setSelectedTeacher(sortedTeachers[0]);
    if (leaveTypesList.length > 0 && !leaveType) setLeaveType(leaveTypesList[0]);
  }, [sortedTeachers, leaveTypesList, selectedTeacher, leaveType]);

  const getDateLine = () => {
    const f = (d) => d.split("-").reverse().join(".");
    const datePart = startDate !== endDate ? `${f(startDate)} - ${f(endDate)}` : f(startDate);
    let res = datePart;
    if (leaveType.includes("CUTI REHAT") || leaveType.includes("CUTI SAKIT") || leaveType.includes("BERSALIN") || leaveType.includes("KECEMASAN")) {
      res += ` (${countWorkDays(startDate, endDate)} HARI)`;
    } else if (useTime) {
      res += ` (${formatTimeTo12h(startTime)} - ${isSelesai ? 'SELESAI' : formatTimeTo12h(endTime)})`;
    }
    return res;
  };

  const finalMessage = `**${selectedTeacher}**\n${leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType}\n${getDateLine()}`;

  const copyAndSave = async () => {
    const el = document.createElement('textarea');
    el.value = finalMessage;
    document.body.appendChild(el); el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);

    if (!user) { showToast("离线模式：未能存档到云端！"); return; }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leave_history'), {
        teacher: selectedTeacher,
        type: leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType,
        dateInfo: getDateLine(),
        createdAt: serverTimestamp()
      });
      showToast("✅ 已存入历史记录！");
    } catch (e) { showToast("❌ 存档失败，请检查网络！"); }
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leave_history', recordToDelete.id));
      showToast("✅ 记录已成功删除");
      if (detailView.isOpen && detailRecords.length <= 1) {
        setDetailView({ ...detailView, isOpen: false });
      }
    } catch(e) { showToast("❌ 删除失败"); } 
    finally { setRecordToDelete(null); }
  };

  const updateList = (col, newList) => {
    if(!user) return showToast("❌ 请先连接云端！");
    setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', col), { list: newList });
  };

  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear().toString()]);
    historyRecords.forEach(rec => {
      const match = rec.dateInfo.match(/\d{4}/);
      if (match) years.add(match[0]);
    });
    return Array.from(years).sort().reverse();
  }, [historyRecords]);

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

  const saveBaseline = async () => {
    if (!user) return showToast("❌ 请先连接云端！");
    const newData = { ...baselineCuti };
    let successCount = 0;
    parsedBaseline.forEach(item => {
       if (item.matched) {
          newData[item.name] = item.value;
          successCount++;
       }
    });
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'baseline_cuti'), { data: newData });
      setShowBaselineModal(false);
      setParsedBaseline([]);
      setImportText("");
      showToast(`✅ 成功导入 ${successCount} 位老师的前期数据！`);
    } catch (e) {
      showToast("❌ 导入失败，请检查网络！");
    }
  };

  const exportToPDF = () => {
    if (!window.html2pdf || !tableRef.current) return showToast("⏳ PDF导出引擎准备中...");
    setIsExporting(true);
    showToast("⏳ 正在为您生成高清 PDF，请稍候...");

    setTimeout(() => {
      const element = tableRef.current;
      const opt = {
        margin:       10,
        filename:     `全校数据统计_${bulanMelayu[parseInt(statMonth) - 1]}_${statYear}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' } 
      };

      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
        showToast("✅ PDF 报表已成功下载！");
      }).catch(err => {
        console.error(err);
        setIsExporting(false);
        showToast("❌ 导出失败，请重试");
      });
    }, 300);
  };

  const processPdfFile = async (file) => {
    if (file.type !== 'application/pdf') return showToast("❌ 请上传有效的 PDF 文件！");
    if (!pdfjsLoaded) return showToast('⏳ 引擎准备中...');
    setIsConverting(true); setPdfImages([]);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        const images = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height; canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          images.push(canvas.toDataURL('image/jpeg', 0.95)); 
        }
        setPdfImages(images); setIsConverting(false); showToast(`✅ 成功转换 ${pdf.numPages} 页！`);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) { setIsConverting(false); showToast("❌ 转换失败。"); }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) processPdfFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processPdfFile(file);
  };

  const downloadImage = (dataUrl, index) => {
    const link = document.createElement('a'); link.href = dataUrl;
    link.download = `公函_第${index + 1}页.jpg`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (!window.JSZip) return showToast("⏳ 加载中...");
    setIsZipping(true);
    try {
      const zip = new window.JSZip();
      pdfImages.forEach((dataUrl, index) => {
        const base64Data = dataUrl.split(',')[1];
        zip.file(`公函_第${index + 1}页.jpg`, base64Data, { base64: true });
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `公函包_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showToast("✅ 全部打包下载完成！");
    } catch (error) { showToast("❌ 打包失败"); } 
    finally { setIsZipping(false); }
  };

  const bulanString = bulanMelayu[parseInt(statMonth) - 1];

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 font-sans text-slate-900 relative">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm animate-in slide-in-from-top-4 fade-in">
          {toastMsg}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-slate-900 rounded-[32px] p-2 flex gap-2 shadow-xl overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('leave')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-3xl font-black text-sm md:text-base transition-all whitespace-nowrap ${activeTab === 'leave' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Briefcase size={18}/> 请假系统
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-3xl font-black text-sm md:text-base transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <BarChart3 size={18}/> 全校数据统计
          </button>
          <button onClick={() => setActiveTab('pdf')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-3xl font-black text-sm md:text-base transition-all whitespace-nowrap ${activeTab === 'pdf' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <FileImage size={18}/> PDF转JPG
          </button>
        </div>

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
            setStartDate={setStartDate}
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
            copyAndSave={copyAndSave}
            setShowHistory={setShowHistory}
            setShowManager={setShowManager}
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
            baselineCuti={baselineCuti}
            filteredSjkcStats={filteredSjkcStats}
          />
        )}

        {activeTab === 'pdf' && (
          <PdfToolTab 
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            isConverting={isConverting}
            handlePdfUpload={handlePdfUpload}
            pdfImages={pdfImages}
            downloadAllAsZip={downloadAllAsZip}
            isZipping={isZipping}
            downloadImage={downloadImage}
          />
        )}
      </div>

      <HistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        historyRecords={historyRecords}
        setRecordToDelete={setRecordToDelete}
      />

      <ManagerModal 
        showManager={showManager}
        onClose={() => setShowManager(null)}
        teachersList={teachersList}
        sortedTeachers={sortedTeachers}
        leaveTypesList={leaveTypesList}
        updateList={updateList}
      />

      <BaselineModal 
        showBaselineModal={showBaselineModal}
        onClose={() => setShowBaselineModal(false)}
        importText={importText}
        setImportText={setImportText}
        handleParseImport={handleParseImport}
        parsedBaseline={parsedBaseline}
        saveBaseline={saveBaseline}
      />

      <DetailViewModal 
        detailView={detailView}
        onClose={() => setDetailView({ isOpen: false, teacher: '', category: '', monthFilter: '' })}
        baselineCuti={baselineCuti}
        detailRecords={detailRecords}
        setRecordToDelete={setRecordToDelete}
        bulanString={bulanString}
        statYear={statYear}
      />

      <DeleteConfirmModal 
        recordToDelete={recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDeleteRecord}
      />
    </div>
  );
}
