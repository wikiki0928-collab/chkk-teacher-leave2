import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardCopy, CheckCircle2, User, CalendarDays, FileText, Info, Settings, Plus, Trash2, X, Cloud, Loader2, Clock } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// 1. Firebase Config (已补回关键的 API Key)
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
const db = getFirestore(app);

const rawTeachers = ["TAI NYIT WUN", "WONG CHUN LIN", "TEO AH BAN", "JACKSON YONG THAU BING", "SOH LEH CHING", "CHEOW JACK SHIUNG @ TONY", "HO CHIN FONG", "WINNIE KONG FUI LING", "WONG LI CHUN", "MARY GAN FAN SHING", "NICHOLAS WONG YIP FOO", "AU JIA PEI", "YAW TECK HING", "YONG LOI CHAING", "FAM SIAW SHYI", "SHIM SOO SHING", "LIM WAI KUN", "DARMAWANGSHAH B. DJONI", "LIZA PANG CHUI FEN", "CHONG VEN YAN", "TAI MUN FUNG", "CH’NG JOO KENG", "CHAI SU YIN", "CHANG SHUK YEE", "FOOH TING TING", "GOH YEE WEI", "HENG SAU VUI", "KERRY YONG KA LIE", "KONG TAIN YIN", "KIEW HUNG TING", "KU CHOON FONG", "KUAN SIEW FONG", "NG MEI SHUEN", "QUALK VUI LEONG", "NURIDAYU BINTI SHAPI", "SOH YEE CHEW", "WENDY CHAI WEN LEE", "WONG KA YUN", "YONG CHI KONG", "YAPP SHING TORNG", "GOH WAN YING", "TSEU SHIAU HWEI", "CHEA SHIAU HAN", "JOSEPHINE LEE YEN CHUN", "KO LEE SAN @ KU LEE SAN", "LEE KAH VUN", "VIVIAN LEE YIN YIN", "SHIRLEY LIEW SEE NEE", "FUNG FUI YEN", "CHUNG FUI PENG", "LIM SIEN YING", "MARRYANN SIAW JIN HA", "SUSANNA CHAI SIAW YEE", "PANG NAI WEN", "KWOK FUI YUN", "ERVINA LEE FUI THENG", "CHIN TZE CAI", "ELLEN CHAM SHWU YU", "HERICA LEE SHIN YEE", "JOYCE TAY ING TING", "YAP KAY CHI", "CHONG CHEE HYUNG", "CHAU FOOK TSHIN", "LEONG SIAW TENG", "TIONG KA MING", "FANNY CHAO SHUK HUN", "LO LI HWANG", "CHUNG CHING FUI", "CHUNG FONG KENG", "ERINA KAN GEN LING", "KAREN THIEN HSIAO JEN", "LAW YIING YIING", "CHONG SU HA", "WONG SAY YEE", "HUNG ME LAN", "ONG OI PING", "LIEW SIOK TENG", "CHONG SIAU YING", "WONG YUN XUAN", "WONG YIT TING", "LIEW SIAW MUI", "TAN LAI SIM", "ANNIE WONG SU YEE", "LIM THAU HIONG", "SYLVIA CHU TZE LUI", "LIEW SHIAU FEI", "HOH MEI YOKE", "MAHARI BIN ABU BAKAR", "MUHAMMAD AIMAN HIDAYAT BIN MD NAZRI", "NOR RAYSHA BINTI ABU BAKAR", "LIEW ZI YEW", "MICHELLE LIAW SU KEE", "LO YEN FUI", "SUZANAH BINTI HANI", "AZIANAH BINTI ABD. SALIM", "JOAN VIANNEY JOSEPH", "MOHAMMAD NAJIB BIN JAMMAN", "LILY GOSIMIN", "MOHD. ZAILANIE BIN ABDUL LAMAN", "JONG FUNG LEN", "BAHAROM HJ.MARKHAN", "MOHD AFANDI BIN RAIMI", "SABDIN BIN TAJUDIN", "RACHEL YIXUAN YONG", "DOUGLAS LIN RI HARN", "NUR AUNI AMIRAH BINTI MOHD ATID", "SHIRLIE HO SI ZHEN", "WU FEI CHIN"];
const rawLeaveTypes = ["CUTI REHAT KHAS", "CUTI SAKIT", "TIME-SLIP", "BENGKEL", "TAKLIMAT"];

export default function App() {
  const [teachersList, setTeachersList] = useState([]);
  const [isManagingTeachers, setIsManagingTeachers] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [leaveTypesList, setLeaveTypesList] = useState([]);
  const [isManagingLeaves, setIsManagingLeaves] = useState(false);
  const [newLeaveTypeName, setNewLeaveTypeName] = useState("");
  const [isSyncing, setIsSyncing] = useState(true);

  // 表单状态
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 时间状态
  const [useTime, setUseTime] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSelesai, setIsSelesai] = useState(false);
  
  const [copiedGroupMsg, setCopiedGroupMsg] = useState(false);

  useEffect(() => {
    setIsSyncing(true);
    const teacherDocRef = doc(db, 'chkk_data', 'teachers_list');
    const leaveDocRef = doc(db, 'chkk_data', 'leave_types');
    const unsubTeachers = onSnapshot(teacherDocRef, (docSnap) => {
      if (docSnap.exists()) setTeachersList(docSnap.data().list || []);
      else { setDoc(teacherDocRef, { list: rawTeachers }); setTeachersList(rawTeachers); }
      setIsSyncing(false);
    }, () => setIsSyncing(false));
    const unsubLeaves = onSnapshot(leaveDocRef, (docSnap) => {
      if (docSnap.exists()) setLeaveTypesList(docSnap.data().list || []);
      else { setDoc(leaveDocRef, { list: rawLeaveTypes }); setLeaveTypesList(rawLeaveTypes); }
    });
    return () => { unsubTeachers(); unsubLeaves(); };
  }, []);

  const syncTeachersToCloud = (newList) => setDoc(doc(db, 'chkk_data', 'teachers_list'), { list: newList });
  const syncLeavesToCloud = (newList) => setDoc(doc(db, 'chkk_data', 'leave_types'), { list: newList });

  const sortedTeachers = useMemo(() => [...teachersList].sort((a, b) => a.localeCompare(b)), [teachersList]);

  useEffect(() => {
    if (sortedTeachers.length > 0 && !selectedTeacher) setSelectedTeacher(sortedTeachers[0]);
    if (leaveTypesList.length > 0 && !leaveType) setLeaveType(leaveTypesList[0]);
  }, [sortedTeachers, leaveTypesList, selectedTeacher, leaveType]);

  const handleAddTeacher = () => {
    const name = newTeacherName.trim().toUpperCase();
    if (name && !teachersList.includes(name)) {
      const newList = [...teachersList, name];
      setTeachersList(newList); syncTeachersToCloud(newList); setNewTeacherName(""); setSelectedTeacher(name);
    }
  };

  const handleRemoveTeacher = (nameToRemove) => {
    const newList = teachersList.filter(n => n !== nameToRemove);
    setTeachersList(newList);
    syncTeachersToCloud(newList);
    if (selectedTeacher === nameToRemove) {
      setSelectedTeacher(newList.length > 0 ? [...newList].sort((a, b) => a.localeCompare(b))[0] : "");
    }
  };

  const handleAddLeaveType = () => {
    const name = newLeaveTypeName.trim().toUpperCase();
    if (name && !leaveTypesList.includes(name)) {
      const newList = [...leaveTypesList, name];
      setLeaveTypesList(newList); syncLeavesToCloud(newList); setNewLeaveTypeName(""); setLeaveType(name);
    }
  };

  const handleRemoveLeaveType = (nameToRemove) => {
    const newList = leaveTypesList.filter(n => n !== nameToRemove);
    setLeaveTypesList(newList);
    syncLeavesToCloud(newList);
    if (leaveType === nameToRemove) {
      setLeaveType(newList.length > 0 ? newList[0] : "其他 (Lain-lain)");
    }
  };

  const countWorkDays = (start, end) => {
    let count = 0;
    let curDate = new Date(start);
    const stopDate = new Date(end);
    while (curDate <= stopDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const formatTimeTo12h = (timeStr) => {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}.${minutes} ${ampm}`;
  };

  const getFinalLeaveType = () => leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType;
  
  const getDateLine = () => {
    const format = (d) => {
      const p = d.split("-");
      return `${p[2]}.${p[1]}.${p[0]}`;
    };
    const datePart = startDate !== endDate ? `${format(startDate)} - ${format(endDate)}` : format(startDate);
    let finalStr = datePart;
    if (leaveType === "CUTI REHAT KHAS") {
      const days = countWorkDays(startDate, endDate);
      finalStr += ` (${days} HARI)`;
    }
    if (useTime && leaveType !== "CUTI REHAT KHAS") {
      const startStr = formatTimeTo12h(startTime);
      const endStr = isSelesai ? "SELESAI" : formatTimeTo12h(endTime);
      finalStr += ` (${startStr} - ${endStr})`;
    }
    return finalStr;
  };

  const generateGroupMessage = () => `${selectedTeacher}\n${getFinalLeaveType()}\n${getDateLine()}`;
  const groupOutputText = generateGroupMessage();

  const copyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = groupOutputText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedGroupMsg(true);
    setTimeout(() => setCopiedGroupMsg(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center relative mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">老师请假通知生成器</h1>
          <p className="text-slate-500 mt-2 font-medium">快速生成行政通知 · 智能天数计算</p>
          <div className="absolute top-0 right-0 hidden sm:flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border text-xs font-bold text-slate-500">
             {isSyncing ? <Loader2 size={14} className="animate-spin text-blue-500"/> : <Cloud size={14} className="text-green-500"/>}
             {isSyncing ? "正在同步" : "云端已就绪"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* 左侧：输入区 */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6 overflow-hidden">
            <div className="flex items-center gap-2 border-b pb-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20}/></div>
              <h2 className="text-xl font-bold">1. 填写请假资料</h2>
            </div>

            {/* 老师选择 - 优化了这里的对齐 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><User size={16}/> 老师名字</label>
              <div className="flex items-center gap-2 w-full">
                <select 
                  value={selectedTeacher} 
                  onChange={e => setSelectedTeacher(e.target.value)} 
                  className="flex-1 min-w-0 rounded-xl border-slate-200 border p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {sortedTeachers.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
                <button 
                  onClick={() => setIsManagingTeachers(true)} 
                  className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0"
                >
                  <Settings size={20}/>
                </button>
              </div>
            </div>

            {/* 假期类型 - 优化了这里的对齐 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><Info size={16}/> 假期类型</label>
              <div className="flex items-center gap-2 w-full">
                <select 
                  value={leaveType} 
                  onChange={e => setLeaveType(e.target.value)} 
                  className="flex-1 min-w-0 rounded-xl border-slate-200 border p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {leaveTypesList.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  <option value="其他 (Lain-lain)">其他 (Lain-lain) ✏️</option>
                </select>
                <button 
                  onClick={() => setIsManagingLeaves(true)} 
                  className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0"
                >
                  <Settings size={20}/>
                </button>
              </div>
              {leaveType === "其他 (Lain-lain)" && (
                <input type="text" placeholder="手动输入假期名称..." value={customLeaveType} onChange={e => setCustomLeaveType(e.target.value)} className="w-full mt-2 rounded-xl border-slate-200 border p-3 uppercase bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"/>
              )}
            </div>

            {/* 日期选择 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><CalendarDays size={16}/> 开始日期</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-xl border-slate-200 border p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><CalendarDays size={16}/> 结束日期</label>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-xl border-slate-200 border p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"/>
              </div>
            </div>

            {/* 时间选择 */}
            {leaveType !== "CUTI REHAT KHAS" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                   <div className="flex items-center gap-2 text-sm font-bold text-blue-700"><Clock size={16}/> 添加具体时间 (Optional)</div>
                   <input type="checkbox" checked={useTime} onChange={e => setUseTime(e.target.checked)} className="w-5 h-5 accent-blue-600 cursor-pointer"/>
                </div>
                {useTime && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">开始时间</label>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">结束时间</label>
                        <input type="time" disabled={isSelesai} value={endTime} onChange={e => setEndTime(e.target.value)} className={`w-full p-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold ${isSelesai ? 'opacity-30' : ''}`}/>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-white/80 transition-colors font-bold text-xs">
                      <input type="checkbox" checked={isSelesai} onChange={e => setIsSelesai(e.target.checked)} className="w-4 h-4 accent-orange-500"/>
                      直到活动结束 (SELESAI)
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：预览区 */}
          <div className="bg-[#efeae2] rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[300px]">
            <h2 className="text-xl font-bold text-slate-800 pb-3 mb-6 border-b border-slate-300/50 flex items-center gap-2">📱 2. WhatsApp 预览</h2>
            <div className="flex-grow">
              <div className="bg-[#d9fdd3] text-[#111b21] p-4 rounded-2xl rounded-tl-none shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap font-semibold inline-block max-w-full">
                {groupOutputText}
              </div>
            </div>
            <button onClick={copyToClipboard} className={`w-full mt-6 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 ${copiedGroupMsg ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {copiedGroupMsg ? <><CheckCircle2/> 已复制！</> : <><ClipboardCopy/> 复制短信息</>}
            </button>
          </div>
        </div>

        {/* Modal: 老师 */}
        {isManagingTeachers && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-xl flex items-center gap-2"><User className="text-blue-600"/> 管理老师名单</h3>
                <button onClick={() => setIsManagingTeachers(false)} className="bg-slate-200 p-1.5 rounded-full hover:bg-slate-300"><X size={20}/></button>
              </div>
              <div className="p-4 bg-white border-b flex gap-2">
                <input type="text" placeholder="输入老师名字..." value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTeacher()} className="flex-grow rounded-xl border-slate-200 border p-3 uppercase focus:ring-2 focus:ring-blue-500 outline-none font-bold"/>
                <button onClick={handleAddTeacher} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 font-bold"><Plus/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50">
                {sortedTeachers.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-700">{t}</span>
                    <button onClick={() => handleRemoveTeacher(t)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: 假期 */}
        {isManagingLeaves && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-xl flex items-center gap-2"><Info className="text-blue-600"/> 管理假期类型</h3>
                <button onClick={() => setIsManagingLeaves(false)} className="bg-slate-200 p-1.5 rounded-full hover:bg-slate-300"><X size={20}/></button>
              </div>
              <div className="p-4 bg-white border-b flex gap-2">
                <input type="text" placeholder="输入新假名..." value={newLeaveTypeName} onChange={e => setNewLeaveTypeName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddLeaveType()} className="flex-grow rounded-xl border-slate-200 border p-3 uppercase focus:ring-2 focus:ring-blue-500 outline-none font-bold"/>
                <button onClick={handleAddLeaveType} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 font-bold"><Plus/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50">
                {leaveTypesList.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-700">{t}</span>
                    <button onClick={() => handleRemoveLeaveType(t)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><Trash2 size={20}/></button>
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
