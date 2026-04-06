import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardCopy, CheckCircle2, User, CalendarDays, FileText, Info, Settings, Plus, Trash2, X, Cloud, Loader2 } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// 1. 在这里填入你专属的 Firebase Config！
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBlvOMNqmp-qCezgoDwgDXibMlatpk6OlU",
  authDomain: "chkk-teacher-leave.firebaseapp.com",
  projectId: "chkk-teacher-leave",
  storageBucket: "chkk-teacher-leave.firebasestorage.app",
  messagingSenderId: "640382547615",
  appId: "1:640382547615:web:c0de6ab92ae41ffed0d4aa"
};

// 修复 CodeSandbox 热更新导致重复初始化 Firebase 的报错
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// 原始老师默认名单
const rawTeachers = [
  "TAI NYIT WUN", "WONG CHUN LIN", "TEO AH BAN", "JACKSON YONG THAU BING", "SOH LEH CHING", 
  "CHEOW JACK SHIUNG @ TONY", "HO CHIN FONG", "WINNIE KONG FUI LING", "WONG LI CHUN", "MARY GAN FAN SHING", 
  "NICHOLAS WONG YIP FOO", "AU JIA PEI", "YAW TECK HING", "YONG LOI CHAING", "FAM SIAW SHYI", 
  "SHIM SOO SHING", "LIM WAI KUN", "DARMAWANGSHAH B. DJONI", "LIZA PANG CHUI FEN", "CHONG VEN YAN", 
  "TAI MUN FUNG", "CH’NG JOO KENG", "CHAI SU YIN", "CHANG SHUK YEE", "FOOH TING TING", "GOH YEE WEI", 
  "HENG SAU VUI", "KERRY YONG KA LIE", "KONG TAIN YIN", "KIEW HUNG TING", "KU CHOON FONG", "KUAN SIEW FONG", 
  "NG MEI SHUEN", "QUALK VUI LEONG", "NURIDAYU BINTI SHAPI", "SOH YEE CHEW", "WENDY CHAI WEN LEE", 
  "WONG KA YUN", "YONG CHI KONG", "YAPP SHING TORNG", "GOH WAN YING", "TSEU SHIAU HWEI", "CHEA SHIAU HAN", 
  "JOSEPHINE LEE YEN CHUN", "KO LEE SAN @ KU LEE SAN", "LEE KAH VUN", "VIVIAN LEE YIN YIN", 
  "SHIRLEY LIEW SEE NEE", "FUNG FUI YEN", "CHUNG FUI PENG", "LIM SIEN YING", "MARRYANN SIAW JIN HA", 
  "SUSANNA CHAI SIAW YEE", "PANG NAI WEN", "KWOK FUI YUN", "ERVINA LEE FUI THENG", "CHIN TZE CAI", 
  "ELLEN CHAM SHWU YU", "HERICA LEE SHIN YEE", "JOYCE TAY ING TING", "YAP KAY CHI", "CHONG CHEE HYUNG", 
  "CHAU FOOK TSHIN", "LEONG SIAW TENG", "TIONG KA MING", "FANNY CHAO SHUK HUN", "LO LI HWANG", 
  "CHUNG CHING FUI", "CHUNG FONG KENG", "ERINA KAN GEN LING", "KAREN THIEN HSIAO JEN", "LAW YIING YIING", 
  "CHONG SU HA", "WONG SAY YEE", "HUNG ME LAN", "ONG OI PING", "LIEW SIOK TENG", "CHONG SIAU YING", 
  "WONG YUN XUAN", "WONG YIT TING", "LIEW SIAW MUI", "TAN LAI SIM", "ANNIE WONG SU YEE", "LIM THAU HIONG", 
  "SYLVIA CHU TZE LUI", "LIEW SHIAU FEI", "HOH MEI YOKE", "MAHARI BIN ABU BAKAR", 
  "MUHAMMAD AIMAN HIDAYAT BIN MD NAZRI", "NOR RAYSHA BINTI ABU BAKAR", "LIEW ZI YEW", "MICHELLE LIAW SU KEE", 
  "LO YEN FUI", "SUZANAH BINTI HANI", "AZIANAH BINTI ABD. SALIM", "JOAN VIANNEY JOSEPH", 
  "MOHAMMAD NAJIB BIN JAMMAN", "LILY GOSIMIN", "MOHD. ZAILANIE BIN ABDUL LAMAN", "JONG FUNG LEN", 
  "BAHAROM HJ.MARKHAN", "MOHD AFANDI BIN RAIMI", "SABDIN BIN TAJUDIN", "RACHEL YIXUAN YONG", 
  "DOUGLAS LIM RI HARN", "NUR AUNI AMIRAH BINTI MOHD ATID", "SHIRLIE HO SI ZHEN", "WU FEI CHIN"
];

// 默认假期类型（包含新加的 TIME-SLIP）
const rawLeaveTypes = [
  "CUTI REHAT KHAS",
  "CUTI SAKIT",
  "TIME-SLIP",
  "BENGKEL",
  "TAKLIMAT"
];

export default function App() {
  // 老师名单状态
  const [teachersList, setTeachersList] = useState([]);
  const [isManagingTeachers, setIsManagingTeachers] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  
  // 假期类型状态
  const [leaveTypesList, setLeaveTypesList] = useState([]);
  const [isManagingLeaves, setIsManagingLeaves] = useState(false);
  const [newLeaveTypeName, setNewLeaveTypeName] = useState("");

  const [isSyncing, setIsSyncing] = useState(true);
  const [syncError, setSyncError] = useState(""); 

  // 监听云端数据 (老师名单 & 假期类型)
  useEffect(() => {
    setIsSyncing(true);
    setSyncError("");
    
    const teacherDocRef = doc(db, 'chkk_data', 'teachers_list');
    const leaveDocRef = doc(db, 'chkk_data', 'leave_types');

    // 订阅老师数据
    const unsubTeachers = onSnapshot(teacherDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setTeachersList(docSnap.data().list || []);
      } else {
        setDoc(teacherDocRef, { list: rawTeachers }).catch(err => {
          if(err.code === 'permission-denied') setSyncError("权限不足");
        });
        setTeachersList(rawTeachers);
      }
      setIsSyncing(false);
    }, (error) => {
      if (error.code === 'permission-denied') setSyncError("权限被拒绝");
      if (teachersList.length === 0) setTeachersList(rawTeachers);
      setIsSyncing(false);
    });

    // 订阅假期类型数据
    const unsubLeaves = onSnapshot(leaveDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLeaveTypesList(docSnap.data().list || []);
      } else {
        setDoc(leaveDocRef, { list: rawLeaveTypes }).catch(console.error);
        setLeaveTypesList(rawLeaveTypes);
      }
    }, (error) => {
      if (leaveTypesList.length === 0) setLeaveTypesList(rawLeaveTypes);
    });

    return () => {
      unsubTeachers();
      unsubLeaves();
    };
  }, []);

  // 同步老师数据到云端
  const syncTeachersToCloud = async (newList) => {
    setIsSyncing(true);
    setSyncError("");
    try {
      await setDoc(doc(db, 'chkk_data', 'teachers_list'), { list: newList });
      setIsSyncing(false);
    } catch (error) {
      if (error.code === 'permission-denied') setSyncError("保存失败：权限被拒绝");
      setIsSyncing(false);
    }
  };

  // 同步假期类型到云端
  const syncLeavesToCloud = async (newList) => {
    setIsSyncing(true);
    setSyncError("");
    try {
      await setDoc(doc(db, 'chkk_data', 'leave_types'), { list: newList });
      setIsSyncing(false);
    } catch (error) {
      if (error.code === 'permission-denied') setSyncError("保存失败：权限被拒绝");
      setIsSyncing(false);
    }
  };

  // 按字母 A-Z 排序老师名单
  const sortedTeachers = useMemo(() => {
    return [...teachersList].sort((a, b) => a.localeCompare(b));
  }, [teachersList]);

  // 表单状态管理
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [copiedGroupMsg, setCopiedGroupMsg] = useState(false);

  // 默认选中第一位老师和第一个假期类型
  useEffect(() => {
    if (sortedTeachers.length > 0 && !selectedTeacher) {
      setSelectedTeacher(sortedTeachers[0]);
    }
  }, [sortedTeachers, selectedTeacher]);

  useEffect(() => {
    if (leaveTypesList.length > 0 && !leaveType) {
      setLeaveType(leaveTypesList[0]);
    }
  }, [leaveTypesList, leaveType]);

  // --- 老师管理逻辑 ---
  const handleAddTeacher = () => {
    const name = newTeacherName.trim().toUpperCase();
    if (name && !teachersList.includes(name)) {
      const newList = [...teachersList, name];
      setTeachersList(newList); 
      syncTeachersToCloud(newList);
      setNewTeacherName("");
      setSelectedTeacher(name);
    }
  };

  const handleRemoveTeacher = (nameToRemove) => {
    const newList = teachersList.filter(name => name !== nameToRemove);
    setTeachersList(newList); 
    syncTeachersToCloud(newList);
    if (selectedTeacher === nameToRemove) {
      setSelectedTeacher(newList.length > 0 ? [...newList].sort((a, b) => a.localeCompare(b))[0] : "");
    }
  };

  // --- 假期类型管理逻辑 ---
  const handleAddLeaveType = () => {
    const name = newLeaveTypeName.trim().toUpperCase();
    if (name && !leaveTypesList.includes(name)) {
      const newList = [...leaveTypesList, name];
      setLeaveTypesList(newList);
      syncLeavesToCloud(newList);
      setNewLeaveTypeName("");
      setLeaveType(name);
    }
  };

  const handleRemoveLeaveType = (nameToRemove) => {
    const newList = leaveTypesList.filter(name => name !== nameToRemove);
    setLeaveTypesList(newList);
    syncLeavesToCloud(newList);
    if (leaveType === nameToRemove) {
      setLeaveType(newList.length > 0 ? newList[0] : "其他 (Lain-lain)");
    }
  };

  // 确保结束日期不早于开始日期
  useEffect(() => {
    if (new Date(endDate) < new Date(startDate)) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  const getFinalLeaveType = () => leaveType === "其他 (Lain-lain)" ? customLeaveType.toUpperCase() : leaveType;
  
  const getDateLine = () => {
    const formattedStart = formatDateForDisplay(startDate);
    const formattedEnd = formatDateForDisplay(endDate);
    return startDate !== endDate ? `${formattedStart} - ${formattedEnd}` : formattedStart;
  };

  const generateGroupMessage = () => {
    return `${selectedTeacher}\n${getFinalLeaveType()}\n${getDateLine()}`;
  };

  const groupOutputText = generateGroupMessage();

  const copyTextToClipboard = (text, setCopiedState) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请手动选择文字复制。");
    }
  };

  if (teachersList.length === 0 && isSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          <p>正在同步云端数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 relative">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">老师请假通知生成器</h1>
          <p className="mt-2 text-slate-500 text-center">快速生成简短群组通知，名单与假期类型皆可云端同步。</p>
          
          <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-200">
              {isSyncing ? (
                <><Loader2 size={14} className="animate-spin text-blue-500" /> <span className="text-slate-600">正在同步</span></>
              ) : syncError ? (
                <><X size={14} className="text-red-500" /> <span className="text-red-600">同步失败</span></>
              ) : (
                <><Cloud size={14} className="text-green-500" /> <span className="text-slate-600">已保存至专属云端</span></>
              )}
            </div>
            {syncError && (
              <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded shadow-sm border border-red-100 max-w-[200px] text-right">
                {syncError}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 左侧：表单设置 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 flex items-center gap-2">
              <FileText size={20} className="text-blue-500"/>
              1. 填写请假资料
            </h2>

            {/* 老师选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User size={16} /> 老师名字 (已按 A-Z 排序)
              </label>
              <div className="flex gap-2 w-full">
                <select 
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="flex-1 min-w-0 truncate rounded-lg border-slate-300 border p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                  disabled={sortedTeachers.length === 0}
                >
                  {sortedTeachers.map((teacher, idx) => (
                    <option key={idx} value={teacher}>{teacher}</option>
                  ))}
                  {sortedTeachers.length === 0 && <option value="">无数据，请添加老师</option>}
                </select>
                <button
                  onClick={() => setIsManagingTeachers(true)}
                  className="p-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                  title="管理名单"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* 假期类型选择 (支持动态管理) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Info size={16} /> 假期类型
              </label>
              <div className="flex gap-2 w-full">
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border-slate-300 border p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                >
                  {leaveTypesList.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                  <option value="其他 (Lain-lain)">其他 (Lain-lain) ✏️</option>
                </select>
                <button
                  onClick={() => setIsManagingLeaves(true)}
                  className="p-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                  title="管理假期类型"
                >
                  <Settings size={20} />
                </button>
              </div>
              
              {leaveType === "其他 (Lain-lain)" && (
                <input
                  type="text"
                  placeholder="请输入假期名称 (例如: CUTI BERSALIN)"
                  value={customLeaveType}
                  onChange={(e) => setCustomLeaveType(e.target.value)}
                  className="mt-2 w-full rounded-lg border-slate-300 border p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase bg-slate-50"
                />
              )}
            </div>

            {/* 日期选择 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays size={16} /> 开始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays size={16} /> 结束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>
            
            <div className="flex-grow"></div>
          </div>

          {/* 右侧：群组短信息预览与复制 */}
          <div className="bg-[#efeae2] rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col relative h-full min-w-0">
            <h2 className="text-xl font-semibold text-slate-800 pb-3 mb-4 flex items-center gap-2 border-b border-slate-300/50">
              <span role="img" aria-label="mobile">📱</span> 2. 群组短信息 (WhatsApp)
            </h2>
            
            <div className="flex-grow flex items-start mb-4 w-full">
              <div className="bg-[#d9fdd3] text-[#111b21] p-3 rounded-lg rounded-tl-none shadow-sm max-w-full text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium overflow-hidden">
                {groupOutputText}
              </div>
            </div>

            <button
              onClick={() => copyTextToClipboard(groupOutputText, setCopiedGroupMsg)}
              disabled={!selectedTeacher}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                !selectedTeacher ? 'bg-slate-300 text-slate-500 cursor-not-allowed' :
                copiedGroupMsg 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {copiedGroupMsg ? <><CheckCircle2 size={20} /> 已复制！</> : <><ClipboardCopy size={20} /> 复制短信息</>}
            </button>
          </div>
        </div>

        {/* --- Modal: 管理老师名单 --- */}
        {isManagingTeachers && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden relative">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <User size={20} className="text-blue-500"/> 管理老师名单 
                  {isSyncing && <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />}
                </h3>
                <button onClick={() => setIsManagingTeachers(false)} className="text-slate-500 hover:text-slate-700 bg-slate-200 rounded-full p-1">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 border-b bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入新老师名字..."
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTeacher()}
                    className="flex-grow rounded-lg border-slate-300 border p-2 uppercase focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddTeacher}
                    disabled={!newTeacherName.trim() || isSyncing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={18} /> 新增
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50">
                {sortedTeachers.map((teacher, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg group hover:border-blue-300 transition-colors">
                    <span className="font-medium text-slate-700 truncate pr-2 flex-1" title={teacher}>{teacher}</span>
                    <button
                      onClick={() => handleRemoveTeacher(teacher)}
                      disabled={isSyncing}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                      title="删除该老师"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {sortedTeachers.length === 0 && <div className="text-center text-slate-500 py-8">名单为空</div>}
              </div>
            </div>
          </div>
        )}

        {/* --- Modal: 管理假期类型 --- */}
        {isManagingLeaves && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden relative">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Info size={20} className="text-blue-500"/> 管理假期类型
                  {isSyncing && <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />}
                </h3>
                <button onClick={() => setIsManagingLeaves(false)} className="text-slate-500 hover:text-slate-700 bg-slate-200 rounded-full p-1">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 border-b bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入新假期类型 (例如: CUTI BERSALIN)..."
                    value={newLeaveTypeName}
                    onChange={(e) => setNewLeaveTypeName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLeaveType()}
                    className="flex-grow rounded-lg border-slate-300 border p-2 uppercase focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddLeaveType}
                    disabled={!newLeaveTypeName.trim() || isSyncing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={18} /> 新增
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50">
                {leaveTypesList.map((leave, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg group hover:border-blue-300 transition-colors">
                    <span className="font-medium text-slate-700 truncate pr-2 flex-1" title={leave}>{leave}</span>
                    <button
                      onClick={() => handleRemoveLeaveType(leave)}
                      disabled={isSyncing}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                      title="删除该假期类型"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {/* 提示用户“其他”是固定选项 */}
                <div className="flex justify-between items-center p-3 bg-slate-100 border border-slate-200 rounded-lg opacity-60">
                   <span className="font-medium text-slate-700 truncate pr-2 flex-1">其他 (Lain-lain) <span className="text-xs text-slate-400 font-normal ml-2">系统保留选项，不可删除</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
