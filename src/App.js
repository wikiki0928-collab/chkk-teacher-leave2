import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardCopy, CheckCircle2, User, CalendarDays, FileText, Info, Settings, Plus, Trash2, X, Cloud, Loader2, Clock, History, FileUp, Download, Image as ImageIcon, Briefcase, FileImage } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

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
const rawLeaveTypes = ["CUTI REHAT KHAS", "CUTI SAKIT", "TIME-SLIP", "BENGKEL", "TAKLIMAT"];

export default function App() {
  // 导航栏状态
  const [activeTab, setActiveTab] = useState('leave'); // 'leave' | 'pdf'

  // =====================================
  // 请假系统状态
  // =====================================
  const [user, setUser] = useState(null);
  const [teachersList, setTeachersList] = useState([]);
  const [leaveTypesList, setLeaveTypesList] = useState([]);
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

  // =====================================
  // PDF 工具状态
  // =====================================
  const [pdfImages, setPdfImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);

  // 初始化 Firebase & Auth
  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (e) { console.error("Auth Error", e); }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return () => unsubAuth();
  }, []);

  // 监听云端数据
  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);

    const unsubTeachers = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'teachers_list'), (snap) => {
      if (snap.exists()) setTeachersList(snap.data().list || []);
      else { setDoc(snap.ref, { list: rawTeachers }); setTeachersList(rawTeachers); }
      setIsSyncing(false);
    }, (err) => console.error(err));

    const unsubLeaves = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'leave_types'), (snap) => {
      if (snap.exists()) setLeaveTypesList(snap.data().list || []);
      else { setDoc(snap.ref, { list: rawLeaveTypes }); setLeaveTypesList(rawLeaveTypes); }
    }, (err) => console.error(err));

    const qHistory = collection(db, 'artifacts', appId, 'public', 'data', 'leave_history');
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setHistoryRecords(sorted);
    }, (err) => console.error(err));

    return () => { unsubTeachers(); unsubLeaves(); unsubHistory(); };
  }, [user]);

  // 加载 PDF.js 引擎 (纯前端转换库)
  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setPdfjsLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setPdfjsLoaded(true);
    }
  }, []);

  // =====================================
  // 核心逻辑函数
  // =====================================

  // 请假系统计算与处理
  const sortedTeachers = useMemo(() => [...teachersList].sort((a, b) => a.localeCompare(b)), [teachersList]);
  
  useEffect(() => {
    if (sortedTeachers.length > 0 && !selectedTeacher) setSelectedTeacher(sortedTeachers[0]);
    if (leaveTypesList.length > 0 && !leaveType) setLeaveType(leaveTypesList[0]);
  }, [sortedTeachers, leaveTypesList]);

  const countWorkDays = (start, end) => {
    let count = 0; let cur = new Date(start); const stop = new Date(end);
    while (cur <= stop) { 
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; 
      cur.setDate(cur.getDate() + 1); 
    }
    return count;
  };

  const formatTimeTo12h = (t) => {
    let [h, m] = t.split(':'); h = parseInt(h);
    const ampm = h >= 12 ? 'P.M.' : 'A.M.';
    h = h % 12 || 12; return `${h}.${m} ${ampm}`;
  };

  const getDateLine = () => {
    const f = (d) => d.split("-").reverse().join(".");
    const datePart = startDate !== endDate ? `${f(startDate)} - ${f(endDate)}` : f(startDate);
    let res = datePart;
    if (leaveType === "CUTI REHAT KHAS") res += ` (${countWorkDays(startDate, endDate)} HARI)`;
    else if (useTime) res += ` (${formatTimeTo12h(startTime)} - ${isSelesai ? 'SELESAI' : formatTimeTo12h(endTime)})`;
    return res;
  };

  const finalMessage = `**${selectedTeacher}**\n${leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType}\n${getDateLine()}`;

  const copyAndSave = async () => {
    if (!user) return;
    const el = document.createElement('textarea');
    el.value = finalMessage;
    document.body.appendChild(el); el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leave_history'), {
        teacher: selectedTeacher,
        type: leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType,
        dateInfo: getDateLine(),
        createdAt: serverTimestamp()
      });
    } catch (e) { console.error("History Save Failed", e); }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("确定要删除这条记录吗？")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leave_history', id));
  };

  const updateList = (col, newList) => {
    setDoc(doc(db, 'artifacts', appId, 'public', 'data', col), { list: newList });
  };

  // PDF转JPG核心逻辑 (完全在浏览器内运行)
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    if (!pdfjsLoaded) {
      alert('转换引擎正在准备中，请等几秒钟再试！');
      return;
    }

    setIsConverting(true);
    setPdfImages([]);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        const images = [];

        // 遍历所有页面并转成高质量 JPG
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // 2.0 保证了 300dpi 级的高清度
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          images.push(canvas.toDataURL('image/jpeg', 0.95)); // 输出高质量 JPG
        }
        
        setPdfImages(images);
        setIsConverting(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("PDF转换失败:", error);
      setIsConverting(false);
      alert("转换失败，可能是文件损坏或加密。");
    }
  };

  const downloadImage = (dataUrl, index) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `公函_第${index + 1}页.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 全局导航栏 (Toolkit Switcher) */}
        <div className="bg-slate-900 rounded-[32px] p-2 flex gap-2 shadow-xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('leave')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-3xl font-black text-sm md:text-base transition-all ${activeTab === 'leave' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Briefcase size={20}/> 老师请假系统
          </button>
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-3xl font-black text-sm md:text-base transition-all ${activeTab === 'pdf' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileImage size={20}/> PDF转JPG工具
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: 老师请假系统                                       */}
        {/* ========================================================= */}
        {activeTab === 'leave' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                   老师请假系统 <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">v2.1</span>
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">自动存档版 (Telegram 加粗支持)</p>
              </div>
              <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <History size={18}/> 历史记录 ({historyRecords.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-7 space-y-6 overflow-hidden">
                <h2 className="text-lg font-black text-slate-700 flex items-center gap-2 border-b pb-4 mb-2">
                  <FileText className="text-blue-500" size={20}/> 资料输入
                </h2>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">教师姓名</label>
                    <div className="flex items-center gap-2 w-full">
                      <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="flex-1 min-w-0 p-3.5 bg-slate-50 border rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                        {sortedTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button onClick={() => setShowManager('teachers')} className="p-3.5 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex-shrink-0">
                        <Settings size={22}/>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">请假种类</label>
                    <div className="flex items-center gap-2 w-full">
                      <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="flex-1 min-w-0 p-3.5 bg-slate-50 border rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                        {leaveTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="其他 (Lain-lain)">其他 (手动输入) ✏️</option>
                      </select>
                      <button onClick={() => setShowManager('leaves')} className="p-3.5 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex-shrink-0">
                        <Settings size={22}/>
                      </button>
                    </div>
                    {leaveType === "其他 (Lain-lain)" && (
                      <input type="text" placeholder="输入假期名称..." value={customLeaveType} onChange={e => setCustomLeaveType(e.target.value)} className="w-full mt-2 p-3.5 bg-slate-50 border rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"/>
                    )}
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

                  {leaveType !== "CUTI REHAT KHAS" && (
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all">
                        <span className="text-sm font-black text-blue-700 flex items-center gap-2"><Clock size={18}/> 具体时间 (Optional)</span>
                        <input type="checkbox" checked={useTime} onChange={e => setUseTime(e.target.checked)} className="w-6 h-6 accent-blue-600 cursor-pointer"/>
                      </label>
                      {useTime && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="grid grid-cols-2 gap-3">
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-3 border rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-500"/>
                            <input type="time" value={endTime} disabled={isSelesai} onChange={e => setEndTime(e.target.value)} className={`p-3 border rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-500 ${isSelesai ? 'opacity-30' : ''}`}/>
                          </div>
                          <label className="flex items-center gap-2 text-xs font-black text-slate-500 cursor-pointer">
                            <input type="checkbox" checked={isSelesai} onChange={e => setIsSelesai(e.target.checked)} className="w-4 h-4 accent-orange-500"/> 
                            直到活动结束 (SELESAI)
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-[#efeae2] rounded-[32px] p-7 border border-slate-200 shadow-sm flex-1 flex flex-col">
                  <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">📱 预览 (TG加粗生效)</h2>
                  <div className="flex-1 bg-[#d9fdd3] text-[#111b21] p-6 rounded-2xl rounded-tl-none shadow-sm text-lg leading-relaxed whitespace-pre-wrap font-bold border-l-4 border-green-400">
                    {finalMessage}
                  </div>
                  <button 
                    onClick={copyAndSave}
                    className={`w-full mt-8 py-5 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 ${copiedStatus ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {copiedStatus ? <><CheckCircle2/> 已复制并同步历史！</> : <><ClipboardCopy/> 复制并存档</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PDF 转 JPG 工具                                    */}
        {/* ========================================================= */}
        {activeTab === 'pdf' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileUp size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">上传公函 (PDF)</h2>
              <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
                完全在你的浏览器本地转换，不会上传到任何服务器，100% 保障学校机密安全。
              </p>
              
              <div className="pt-6">
                <label className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-white font-black text-lg rounded-2xl cursor-pointer hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                  <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                  {isConverting ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                  {isConverting ? '正在努力转换中...' : '选择 PDF 文件'}
                </label>
              </div>
            </div>

            {/* 转换结果展示区 */}
            {pdfImages.length > 0 && (
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500"/> 转换成功 ({pdfImages.length} 页)
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {pdfImages.map((imgSrc, index) => (
                    <div key={index} className="space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm group">
                      <div className="flex justify-between items-center px-2">
                         <span className="font-black text-slate-500 text-sm">第 {index + 1} 页</span>
                         <button 
                           onClick={() => downloadImage(imgSrc, index)}
                           className="flex items-center gap-1.5 text-xs font-black bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                         >
                           <Download size={14}/> 下载此页
                         </button>
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-white">
                         <img src={imgSrc} alt={`PDF 第 ${index + 1} 页`} className="w-full h-auto object-contain" />
                      </div>
                      <button 
                         onClick={() => downloadImage(imgSrc, index)}
                         className="w-full py-3 bg-slate-800 text-white rounded-xl font-black flex justify-center items-center gap-2 hover:bg-slate-700 transition-all active:scale-95"
                      >
                         <Download size={18}/> 保存到相册/电脑
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* Modal: 历史与管理 (共用)                                   */}
        {/* ========================================================= */}
        
        {/* 历史记录 Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-black text-2xl flex items-center gap-3 text-slate-800"><History className="text-blue-600" size={28}/> 历史存档</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">云端数据实时同步中</p>
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
                      <button 
                        onClick={() => deleteRecord(rec.id)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-slate-100 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 名单管理 Modal */}
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
