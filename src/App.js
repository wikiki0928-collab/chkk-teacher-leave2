import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ClipboardCopy, CheckCircle2, User, CalendarDays, FileText, Info, Settings, Plus, Trash2, X, Cloud, Loader2, Clock, History, FileUp, Download, Image as ImageIcon, Briefcase, FileImage, BarChart3, AlertTriangle, Search, Archive, MousePointerClick, Printer } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// ==========================================
// 1. Firebase 配置
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBlvOMNqmp-qCezgoDwgDXibMlatpk6OlU",
  authDomain: "chkk-teacher-leave.firebaseapp.com",
  projectId: "chkk-teacher-leave",
  storageBucket: "chkk-teacher-leave.firebasestorage.app",
  messagingSenderId: "640382547615",
  appId: "1:640382547615:web:c0de6ab92ae41ffed0d4aa"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'chkk-teacher-leave';

const rawTeachers = ["TAI NYIT WUN", "WONG CHUN LIN", "TEO AH BAN", "JACKSON YONG THAU BING", "SOH LEH CHING", "CHEOW JACK SHIUNG @ TONY", "HO CHIN FONG", "WINNIE KONG FUI LING", "WONG LI CHUN", "MARY GAN FAN SHING", "NICHOLAS WONG YIP FOO", "AU JIA PEI", "YAW TECK HING", "YONG LOI CHAING", "FAM SIAW SHYI", "SHIM SOO SHING", "LIM WAI KUN", "DARMAWANGSHAH B. DJONI", "LIZA PANG CHUI FEN", "CHONG VEN YAN", "TAI MUN FUNG", "CH’NG JOO KENG", "CHAI SU YIN", "CHANG SHUK YEE", "FOOH TING TING", "GOH YEE WEI", "HENG SAU VUI", "KERRY YONG KA LIE", "KONG TAIN YIN", "KIEW HUNG TING", "KU CHOON FONG", "KUAN SIEW FONG", "NG MEI SHUEN", "QUALK VUI LEONG", "NURIDAYU BINTI SHAPI", "SOH YEE CHEW", "WENDY CHAI WEN LEE", "WONG KA YUN", "YONG CHI KONG", "YAPP SHING TORNG", "GOH WAN YING", "TSEU SHIAU HWEI", "CHEA SHIAU HAN", "JOSEPHINE LEE YEN CHUN", "KO LEE SAN @ KU LEE SAN", "LEE KAH VUN", "VIVIAN LEE YIN YIN", "SHIRLEY LIEW SEE NEE", "FUNG FUI YEN", "CHUNG FUI PENG", "LIM SIEN YING", "MARRYANN SIAW JIN HA", "SUSANNA CHAI SIAW YEE", "PANG NAI WEN", "KWOK FUI YUN", "ERVINA LEE FUI THENG", "CHIN TZE CAI", "ELLEN CHAM SHWU YU", "HERICA LEE SHIN YEE", "JOYCE TAY ING TING", "YAP KAY CHI", "CHONG CHEE HYUNG", "CHAU FOOK TSHIN", "LEONG SIAW TENG", "TIONG KA MING", "FANNY CHAO SHUK HUN", "LO LI HWANG", "CHUNG CHING FUI", "CHUNG FONG KENG", "ERINA KAN GEN LING", "KAREN THIEN HSIAO JEN", "LAW YIING YIING", "CHONG SU HA", "WONG SY YEE", "HUNG ME LAN", "ONG OI PING", "LIEW SIOK TENG", "CHONG SIAU YING", "WONG YUN XUAN", "WONG YIT TING", "LIEW SIAW MUI", "TAN LAI SIM", "ANNIE WONG SU YEE", "LIM THAU HIONG", "SYLVIA CHU TZE LUI", "LIEW SHIAU FEI", "HOH MEI YOKE", "MAHARI BIN ABU BAKAR", "MUHAMMAD AIMAN HIDAYAT BIN MD NAZRI", "NOR RAYSHA BINTI ABU BAKAR", "LIEW ZI YEW", "MICHELLE LIAW SU KEE", "LO YEN FUI", "SUZANAH BINTI HANI", "AZIANAH BINTI ABD. SALIM", "JOAN VIANNEY JOSEPH", "MOHAMMAD NAJIB BIN JAMMAN", "LILY GOSIMIN", "MOHD. ZAILANIE BIN ABDUL LAMAN", "JONG FUNG LEN", "BAHAROM HJ.MARKHAN", "MOHD AFANDI BIN RAIMI", "SABDIN BIN TAJUDIN", "RACHEL YIXUAN YONG", "DOUGLAS LIM RI HARN", "NUR AUNI AMIRAH BINTI MOHD ATID", "SHIRLIE HO SI ZHEN", "WU FEI CHIN"];
const rawLeaveTypes = ["CUTI REHAT KHAS", "CUTI REHAT", "CUTI SAKIT", "TIME-SLIP", "CUTI BERSALIN", "CUTI KECEMASAN", "CUTI TANPA REKOD KELOMPOK", "BENGKEL", "TAKLIMAT", "TUGAS RASMI"];
const bulanMelayu = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"];

const countWorkDays = (start, end) => {
  let count = 0; let cur = new Date(start); const stop = new Date(end);
  while (cur <= stop) { 
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++; 
    cur.setDate(cur.getDate() + 1); 
  }
  return count;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('leave'); 
  const tableRef = useRef(null); // 用于截图/导出PDF的引用

  const [toastMsg, setToastMsg] = useState("");
  const [recordToDelete, setRecordToDelete] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [teachersList, setTeachersList] = useState(rawTeachers);
  const [leaveTypesList, setLeaveTypesList] = useState(rawLeaveTypes);
  const [historyRecords, setHistoryRecords] = useState([]);
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

  // 统计系统状态
  const currentJsMonth = new Date().getMonth();
  const [statYear, setStatYear] = useState(new Date().getFullYear().toString());
  const [statMonth, setStatMonth] = useState((currentJsMonth + 1).toString());
  const [statSearch, setStatSearch] = useState("");
  const [statSortMode, setStatSortMode] = useState("alphabet"); // 新增：排序模式 ('alphabet' | 'cuti_desc' | 'rasmi_desc')
  const [detailView, setDetailView] = useState({ isOpen: false, teacher: '', category: '', monthFilter: '' });
  const [isExporting, setIsExporting] = useState(false);

  // PDF 工具状态
  const [pdfImages, setPdfImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
        setAuthError(false);
      } catch (e) { setAuthError(true); setIsSyncing(false); }
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
    }, () => { setAuthError(true); setIsSyncing(false); });

    const leavesRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'leave_types');
    const unsubLeaves = onSnapshot(leavesRef, (snap) => {
      if (snap.exists()) setLeaveTypesList(snap.data().list || []);
      else setDoc(snap.ref, { list: rawLeaveTypes });
    });

    const qHistory = collection(db, 'artifacts', appId, 'public', 'data', 'leave_history');
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setHistoryRecords(sorted);
    });

    return () => { unsubTeachers(); unsubLeaves(); unsubHistory(); };
  }, [user]);

  // 加载外部引擎 (PDF.js, JSZip, html2pdf)
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

  const formatTimeTo12h = (t) => {
    let [h, m] = t.split(':'); h = parseInt(h);
    const ampm = h >= 12 ? 'P.M.' : 'A.M.';
    h = h % 12 || 12; return `${h}.${m} ${ampm}`;
  };

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

  const getRecordCategory = (typeString) => {
    const type = typeString.toUpperCase();
    if (type.includes("BERSALIN")) return 'BERSALIN';
    if (type.includes("SAKIT")) return 'SAKIT';
    if (type.includes("TIME-SLIP") || type.includes("TIME SLIP")) return 'TIMESLIP';
    if (type.includes("REHAT KHAS") || type === "CRK" || type.includes("CUTI REHAT") || type.includes("KECEMASAN") || type.includes("CTR") || type.includes("TANPA REKOD")) return 'CRK_CR';
    return 'RASMI';
  };

  const sjkcStats = useMemo(() => {
    const statsMap = {};
    sortedTeachers.forEach(t => {
      statsMap[t] = { name: t, prev_cuti: 0, cur_crk_cr: 0, cur_sakit: 0, cur_timeslip: 0, cur_bersalin: 0, cur_rasmi: 0, prev_rasmi: 0 };
    });

    historyRecords.forEach(rec => {
      const dateMatch = rec.dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (!dateMatch) return; 
      
      const recYear = dateMatch[3];
      if (recYear !== statYear) return; 

      const recMonth = parseInt(dateMatch[2], 10);
      const selMonth = parseInt(statMonth, 10);

      const tName = rec.teacher;
      if (!statsMap[tName]) statsMap[tName] = { name: tName, prev_cuti: 0, cur_crk_cr: 0, cur_sakit: 0, cur_timeslip: 0, cur_bersalin: 0, cur_rasmi: 0, prev_rasmi: 0 };

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
  }, [historyRecords, statYear, statMonth, sortedTeachers]);

  const filteredSjkcStats = useMemo(() => {
    if (!statSearch) return sjkcStats;
    return sjkcStats.filter(t => t.name.toLowerCase().includes(statSearch.toLowerCase()));
  }, [sjkcStats, statSearch]);

  // 新增：根据排序模式对数据进行排行榜排序
  const sortedAndFilteredStats = useMemo(() => {
    let result = [...filteredSjkcStats];
    
    if (statSortMode === 'cuti_desc') {
      // 按照 私假总数 (JUMLAH CUTI AKHIR BULAN) 从大到小排列
      result.sort((a, b) => {
        const totalA = a.prev_cuti + a.cur_crk_cr + a.cur_sakit + a.cur_timeslip + a.cur_bersalin;
        const totalB = b.prev_cuti + b.cur_crk_cr + b.cur_sakit + b.cur_timeslip + b.cur_bersalin;
        if (totalB !== totalA) return totalB - totalA; // 数字大的排前面
        return a.name.localeCompare(b.name); // 数字一样则按名字排
      });
    } else if (statSortMode === 'rasmi_desc') {
      // 按照 公事总数 (JUMLAH CUTI RASMI AKHIR BULAN) 从大到小排列
      result.sort((a, b) => {
        const rasmiA = a.prev_rasmi + a.cur_rasmi;
        const rasmiB = b.prev_rasmi + b.cur_rasmi;
        if (rasmiB !== rasmiA) return rasmiB - rasmiA;
        return a.name.localeCompare(b.name);
      });
    }
    // 如果是 'alphabet'，本身 filteredSjkcStats 已经是按字母排好的了，直接 return 即可
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
      if (detailView.category === 'ALL_CUTI') {
        return category !== 'RASMI';
      }
      return category === detailView.category;
    });
  }, [historyRecords, detailView, statYear, statMonth]);

  // 导出 PDF 核心逻辑
  const exportToPDF = () => {
    if (!window.html2pdf || !tableRef.current) return showToast("⏳ PDF导出引擎准备中...");
    
    setIsExporting(true);
    showToast("⏳ 正在为您生成高清 PDF，请稍候...");

    // 稍微延迟一下，让 React 渲染完“导出模式”的无按钮界面
    setTimeout(() => {
      const element = tableRef.current;
      const opt = {
        margin:       10,
        filename:     `全校数据统计_${bulanMelayu[parseInt(statMonth) - 1]}_${statYear}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' } // 横向打印最适合这种宽表格
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
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
        
        {/* 全局导航栏 */}
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

        {/* TAB 1: 请假系统 */}
        {activeTab === 'leave' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">老师请假系统 <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">v3.5</span></h1>
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
        )}

        {/* TAB 2: 全校数据统计 (导出PDF版) */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6 flex flex-col xl:flex-row justify-between items-center gap-4">
               <h3 className="font-black text-slate-800 text-xl flex items-center gap-2 whitespace-nowrap">
                 <BarChart3 className="text-indigo-600" size={26}/> 月度考勤分析
               </h3>
               
               <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center flex-wrap justify-end">
                  
                  {/* 下载 PDF 按钮 */}
                  <button 
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-white w-full sm:w-auto shadow-md transition-all ${isExporting ? 'bg-slate-400' : 'bg-teal-500 hover:bg-teal-600 active:scale-95'}`}
                  >
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                    {isExporting ? '生成中...' : '下载报表 (PDF)'}
                  </button>

                  {/* 排序模式选择器 (新增) */}
                  <select 
                    value={statSortMode} 
                    onChange={e => setStatSortMode(e.target.value)} 
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                  >
                    <option value="alphabet">🔤 名字 A-Z 顺序</option>
                    <option value="cuti_desc">📉 私假总数排行榜 (多到少)</option>
                    <option value="rasmi_desc">📉 公事总数排行榜 (多到少)</option>
                  </select>

                  <div className="relative w-full sm:w-40">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                     <input type="text" placeholder="搜寻老师..." value={statSearch} onChange={e => setStatSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select value={statMonth} onChange={e => setStatMonth(e.target.value)} className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white border border-indigo-700 rounded-xl font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                      {bulanMelayu.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                    </select>
                    <select value={statYear} onChange={e => setStatYear(e.target.value)} className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white border border-indigo-700 rounded-xl font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                      {availableYears.map(y => <option key={y} value={y}>{y} 年</option>)}
                    </select>
                  </div>
               </div>
            </div>

            {/* 用 ref 包裹需要导出成 PDF 的区域 */}
            <div ref={tableRef} className="bg-white p-2 sm:p-4 rounded-[32px] shadow-lg border border-slate-200 overflow-x-auto relative" style={{ backgroundColor: 'white' }}>
              <table className="w-full min-w-[1000px] border-collapse text-sm text-black border-2 border-black">
                <thead>
                  <tr>
                    <th colSpan="11" className="bg-[#ffff00] text-center py-3 border-2 border-black text-lg uppercase font-black tracking-wide">
                      ANALISIS CUTI GURU DAN AKP SJKC CHUNG HWA KOTA KINABALU BAGI BULAN {bulanString} {statYear}
                    </th>
                  </tr>
                  <tr className="text-center font-black">
                    <th rowSpan="3" className="bg-[#f6b26b] border-2 border-black w-12 px-2 py-2">NO</th>
                    <th rowSpan="3" className="bg-[#f6b26b] border-2 border-black px-4 py-2 min-w-[200px]">NAMA GURU</th>
                    <th colSpan="6" className="bg-[#f6b26b] border-2 border-black py-2">{bulanString} {statYear}</th>
                    <th colSpan="3" className="bg-[#d9ead3] border-2 border-black py-2">CUTI RASMI</th>
                  </tr>
                  <tr className="text-center font-black">
                    <th colSpan="4" className="bg-[#bde5f8] border-2 border-black py-1.5">CUTI</th>
                    <th rowSpan="2" className="bg-[#bde5f8] border-2 border-black px-3 py-2 w-28 leading-snug">CUTI DARI<br/>BULAN<br/>SEBELUMNYA</th>
                    <th rowSpan="2" className="bg-[#bde5f8] border-2 border-black px-3 py-2 w-32 leading-snug">JUMLAH CUTI AKHIR<br/>BULAN {bulanString} {statYear}</th>
                    <th rowSpan="2" className="bg-[#d9ead3] border-2 border-black px-3 py-2 w-28 leading-snug">CUTI RASMI</th>
                    <th rowSpan="2" className="bg-[#d9ead3] border-2 border-black px-3 py-2 w-28 leading-snug">CUTI RASMI<br/>DARI BULAN<br/>SEBELUMNYA</th>
                    <th rowSpan="2" className="bg-[#d9ead3] border-2 border-black px-3 py-2 w-32 leading-snug">JUMLAH CUTI RASMI<br/>AKHIR BULAN {bulanString} {statYear}</th>
                  </tr>
                  <tr className="text-center font-black text-xs leading-snug">
                    <th className="bg-[#bde5f8] border-2 border-black p-2 w-36">CRK/CR/CUTI<br/>KECEMASAN /<br/>CTR</th>
                    <th className="bg-[#bde5f8] border-2 border-black p-2 w-24">CUTI SAKIT</th>
                    <th className="bg-[#bde5f8] border-2 border-black p-2 w-24">TIME SLIP</th>
                    <th className="bg-[#bde5f8] border-2 border-black p-2 w-24">CUTI BERSALIN</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {/* 这里改用 sortedAndFilteredStats */}
                  {sortedAndFilteredStats.map((row, index) => {
                    const totalCutiAkhir = row.prev_cuti + row.cur_crk_cr + row.cur_sakit + row.cur_timeslip + row.cur_bersalin; 
                    const totalRasmiAkhir = row.prev_rasmi + row.cur_rasmi; 
                    return (
                      <tr key={row.name} className="hover:bg-slate-100 transition-colors">
                        <td className="border border-black text-center font-medium py-2">{index + 1}</td>
                        <td className="border border-black px-3 font-bold">{row.name}</td>
                        
                        {/* 当月 CRK类 */}
                        <td className="border border-black text-center font-bold text-lg">
                          {row.cur_crk_cr > 0 ? (
                            isExporting ? <span className="text-red-600">{row.cur_crk_cr}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'CRK_CR', monthFilter: 'cur' })} className="text-red-600 hover:bg-red-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                              {row.cur_crk_cr} <MousePointerClick size={12} className="opacity-50"/>
                            </button>
                          ) : ""}
                        </td>
                        
                        {/* 当月 SAKIT */}
                        <td className="border border-black text-center font-bold text-lg">
                          {row.cur_sakit > 0 ? (
                            isExporting ? <span className="text-blue-600">{row.cur_sakit}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'SAKIT', monthFilter: 'cur' })} className="text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                              {row.cur_sakit} <MousePointerClick size={12} className="opacity-50"/>
                            </button>
                          ) : ""}
                        </td>
                        
                        {/* 当月 TIME SLIP */}
                        <td className="border border-black text-center font-bold text-lg">
                          {row.cur_timeslip > 0 ? (
                            isExporting ? <span className="text-slate-600">{row.cur_timeslip}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'TIMESLIP', monthFilter: 'cur' })} className="text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                              {row.cur_timeslip} <MousePointerClick size={12} className="opacity-50"/>
                            </button>
                          ) : ""}
                        </td>
                        
                        {/* 当月 BERSALIN */}
                        <td className="border border-black text-center font-bold text-lg">
                          {row.cur_bersalin > 0 ? (
                            isExporting ? <span className="text-purple-600">{row.cur_bersalin}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'BERSALIN', monthFilter: 'cur' })} className="text-purple-600 hover:bg-purple-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                              {row.cur_bersalin} <MousePointerClick size={12} className="opacity-50"/>
                            </button>
                          ) : ""}
                        </td>

                        {/* 私假 DARI BULAN SEBELUMNYA (排除RASMI) */}
                        <td className="border border-black bg-[#bde5f8] text-center font-black text-lg">
                          {row.prev_cuti > 0 ? (
                            isExporting ? <span className="text-blue-800">{row.prev_cuti}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'prev' })} className="text-blue-800 hover:bg-blue-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                              {row.prev_cuti}
                            </button>
                          ) : ""}
                        </td>

                        {/* 私假 JUMLAH CUTI AKHIR BULAN (排除RASMI) */}
                        <td className="border border-black bg-[#bde5f8] text-center font-black text-xl text-teal-800">
                          {totalCutiAkhir > 0 ? (
                            isExporting ? <span>{totalCutiAkhir}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'ALL_CUTI', monthFilter: 'total' })} className="hover:bg-teal-100 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                              {totalCutiAkhir}
                            </button>
                          ) : ""}
                        </td>

                        {/* 当月 公事(RASMI) */}
                        <td className="border border-black text-center font-bold text-lg bg-[#d9ead3]">
                          {row.cur_rasmi > 0 ? (
                            isExporting ? <span className="text-emerald-700">{row.cur_rasmi}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'cur' })} className="text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                              {row.cur_rasmi} <MousePointerClick size={12} className="opacity-50"/>
                            </button>
                          ) : ""}
                        </td>

                        {/* CUTI RASMI DARI BULAN SEBELUMNYA */}
                        <td className="border border-black bg-[#d9ead3] text-center font-black text-lg">
                          {row.prev_rasmi > 0 ? (
                            isExporting ? <span className="text-emerald-800">{row.prev_rasmi}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'prev' })} className="text-emerald-800 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                              {row.prev_rasmi}
                            </button>
                          ) : ""}
                        </td>

                        {/* JUMLAH CUTI RASMI AKHIR BULAN */}
                        <td className="border border-black bg-[#d9ead3] text-center font-black text-xl text-green-900">
                          {totalRasmiAkhir > 0 ? (
                            isExporting ? <span>{totalRasmiAkhir}</span> : 
                            <button onClick={() => setDetailView({ isOpen: true, teacher: row.name, category: 'RASMI', monthFilter: 'total' })} className="hover:bg-green-200 px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer w-full h-full">
                              {totalRasmiAkhir}
                            </button>
                          ) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredSjkcStats.length === 0 && !isExporting && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <p className="text-slate-500 font-black text-lg">没有找到该老师的数据</p>
                </div>
              )}
            </div>
            <div className="text-center text-xs font-bold text-slate-400 mt-2">
              💡 提示：点击“下载报表(PDF)”即可获取完美适配 A4 纸比例的高清档案，可直接发群组或打印。
            </div>
          </div>
        )}

        {/* TAB 3: PDF 工具 */}
        {activeTab === 'pdf' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div 
              className={`bg-white rounded-[32px] shadow-sm border-2 border-dashed p-8 text-center space-y-4 transition-all duration-300 ${isDragging ? 'border-orange-500 bg-orange-50 scale-[1.02]' : 'border-slate-200'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 pointer-events-none"><FileUp size={32} /></div>
              <h2 className="text-2xl font-black text-slate-800 pointer-events-none">上传公函 (PDF)</h2>
              <p className="text-slate-500 font-medium text-sm max-w-md mx-auto pointer-events-none">
                {isDragging ? '✨ 放开鼠标，立即转换！' : '将 PDF 文件拖拽到此处，或者点击下方按钮选择。完全在本地转换，保障机密安全。'}
              </p>
              
              <div className="pt-6">
                <label className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-white font-black text-lg rounded-2xl cursor-pointer hover:bg-orange-600 shadow-lg active:scale-95 transition-all">
                  <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                  {isConverting ? <Loader2 className="animate-spin" /> : <ImageIcon />} {isConverting ? '处理中...' : '选择 PDF 文件'}
                </label>
              </div>
            </div>

            {pdfImages.length > 0 && (
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 space-y-8 animate-in zoom-in-95">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-6 gap-4">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><CheckCircle2 className="text-green-500"/> 转换成功 ({pdfImages.length} 页)</h3>
                  {pdfImages.length > 1 && (
                    <button onClick={downloadAllAsZip} disabled={isZipping} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all shadow-md">
                      {isZipping ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />} {isZipping ? '打包中...' : '一键打包 (ZIP)'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {pdfImages.map((imgSrc, index) => (
                    <div key={index} className="space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center px-2">
                         <span className="font-black text-slate-500 text-sm">第 {index + 1} 页</span>
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-white">
                         <img src={imgSrc} alt={`Page ${index + 1}`} className="w-full h-auto object-contain" />
                      </div>
                      <button onClick={() => downloadImage(imgSrc, index)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-black flex justify-center items-center gap-2 hover:bg-slate-700 transition-all active:scale-95">
                         <Download size={18}/> 存入相册/电脑
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: 穿透数据明细窗口 */}
        {detailView.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[55] p-4 animate-in fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center bg-indigo-50">
                <div>
                  <h3 className="font-black text-2xl flex items-center gap-2 text-indigo-900">
                    <User className="text-indigo-500" size={24}/> {detailView.teacher}
                  </h3>
                  <p className="text-sm font-bold text-indigo-500 tracking-wider mt-1">
                    {detailView.monthFilter === 'cur' ? `${bulanString} ${statYear}` : 
                     detailView.monthFilter === 'prev' ? `累积至上个月 (${statYear}年)` :
                     `${statYear}年全年总计`} 明细清单
                  </p>
                </div>
                <button onClick={() => setDetailView({ isOpen: false, teacher: '', category: '', monthFilter: '' })} className="p-3 bg-white rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all shadow-sm"><X size={24}/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
                {detailRecords.map((rec) => (
                  <div key={rec.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group relative flex items-center justify-between">
                    <div className="space-y-1 pr-10">
                      <div className="text-slate-800 font-black text-lg">{rec.type}</div>
                      <div className="text-indigo-600 font-black flex items-center gap-2"><CalendarDays size={16}/> {rec.dateInfo}</div>
                      <div className="text-[10px] font-black text-slate-300 mt-2">记录创建于: {rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleString() : '...'}</div>
                    </div>
                    <button onClick={() => setRecordToDelete(rec)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="删除此记录">
                      <Trash2 size={20}/>
                    </button>
                  </div>
                ))}
                {detailRecords.length === 0 && <div className="py-10 text-center text-slate-300 font-black">记录已被清空</div>}
              </div>
            </div>
          </div>
        )}

        {/* Modal: 自定义确认删除 */}
        {recordToDelete && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-sm space-y-5 shadow-2xl">
              <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={28} /></div>
              <h3 className="font-black text-2xl text-slate-800">确认删除？</h3>
              <p className="text-slate-600 font-bold leading-relaxed">
                您确定要删除 <span className="text-blue-600 px-1">{recordToDelete.teacher}</span> 的 <span className="text-slate-800 px-1">{recordToDelete.type}</span> 记录吗？
                <br/><span className="text-xs text-red-500 mt-2 block">(表盘上的总计数值将瞬间随之减少)</span>
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setRecordToDelete(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">取消</button>
                <button onClick={confirmDeleteRecord} className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-md transition-all">确定删除</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: 历史与管理 (共用) */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-black text-2xl flex items-center gap-3 text-slate-800"><History className="text-blue-600" size={28}/> 所有历史存档</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">从这里删除记录，将同步调整统计数据</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-3 bg-slate-200 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"><X size={24}/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
                {historyRecords.length === 0 ? (
                  <div className="py-24 text-center text-slate-300 font-black italic">暂时还没有任何记录...</div>
                ) : (
                  historyRecords.map((rec) => (
                    <div key={rec.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group relative">
                      <div className="flex justify-between items-start pr-10">
                        <div className="space-y-2">
                          <div className="font-black text-blue-600 text-xl leading-tight uppercase">{rec.teacher}</div>
                          <div className="text-slate-800 font-black text-sm">{rec.type}</div>
                          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{rec.dateInfo}</div>
                        </div>
                        <div className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">
                           {rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                        </div>
                      </div>
                      <button onClick={() => setRecordToDelete(rec)} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showManager && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-7 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-xl flex items-center gap-2">
                  {showManager === 'teachers' ? <><User className="text-blue-500"/> 管理老师</> : <><Info className="text-blue-500"/> 管理种类</>}
                </h3>
                <button onClick={() => setShowManager(null)} className="p-2.5 bg-slate-200 rounded-full hover:bg-slate-300"><X size={20}/></button>
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
                         updateList(showManager === 'teachers' ? 'teachers_list' : 'leave_types', [...list, val]);
                         e.target.value = "";
                       }
                     }
                   }}
                 />
              </div>
              <div className="flex-grow overflow-y-auto p-5 space-y-2 bg-slate-50">
                {(showManager === 'teachers' ? sortedTeachers : leaveTypesList).map(item => (
                  <div key={item} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm group">
                    <span className="font-bold text-slate-700">{item}</span>
                    <button onClick={() => {
                       const list = showManager === 'teachers' ? teachersList : leaveTypesList;
                       updateList(showManager === 'teachers' ? 'teachers_list' : 'leave_types', list.filter(i => i !== item));
                    }} className="p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
