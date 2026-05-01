import React, { useState, useMemo, useEffect } from 'react';
import { User, Info, X, Archive, RotateCcw, AlertTriangle, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { enrichDateInfoWithDay } from '../utils/helpers';

const ArchiveConfirmDialog = ({ teacherName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6 border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl flex-shrink-0">
          <AlertTriangle size={24}/>
        </div>
        <div>
          <h4 className="font-black text-slate-800 text-lg leading-tight">确认归档？</h4>
          <p className="text-slate-500 text-sm font-semibold mt-1 leading-relaxed">
            将 <span className="font-black text-slate-800">{teacherName}</span> 移入档案区。<br/>
            其历史请假记录将被完整保留，但不计入统计报表。
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95">取消</button>
        <button onClick={onConfirm} className="flex-1 py-3 bg-amber-500 text-white rounded-2xl font-black text-sm hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200">确认归档</button>
      </div>
    </div>
  </div>
);

const ArchivedTeacherCard = ({ name, allRecords, isLoadingAllYears }) => {
  const [expanded, setExpanded] = useState(false);

  const teacherRecords = useMemo(() =>
    allRecords.filter(r => r.teacher === name)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    [allRecords, name]
  );

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden transition-all hover:border-amber-300">
      <div className="p-5 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-700 text-sm tracking-tight truncate">{name}</p>
          {isLoadingAllYears ? (
            <p className="text-[10px] font-bold text-slate-300 mt-1 flex items-center gap-1">
              <Loader2 size={10} className="animate-spin"/> 加载中...
            </p>
          ) : (
            <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wider">
              {teacherRecords.length > 0 ? `共 ${teacherRecords.length} 条历史请假记录` : '暂无请假记录'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {teacherRecords.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl transition-all text-[10px] font-black uppercase"
            >
              {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
              {expanded ? '收起' : '查看'}
            </button>
          )}
        </div>
      </div>

      {expanded && teacherRecords.length > 0 && (
        <div className="border-t border-amber-50 bg-amber-50/30 px-5 pb-5 pt-3 space-y-2 max-h-60 overflow-y-auto">
          {teacherRecords.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl p-3 border border-amber-100 shadow-sm">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">{rec.type}</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">{enrichDateInfoWithDay(rec.dateInfo)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ManagerModal = ({
  showManager, onClose,
  teachersList, sortedTeachers, leaveTypesList, updateList,
  archivedTeachers = [], archiveTeacher, restoreTeacher,
  historyRecords = [], loadYearData, availableYears = []
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const [archivingTeacher, setArchivingTeacher] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allYearsRecords, setAllYearsRecords] = useState([]);
  const [isLoadingAllYears, setIsLoadingAllYears] = useState(false);

  // When archive tab is opened, load ALL available years so record counts are accurate
  useEffect(() => {
    if (activeTab !== 'archive' || !loadYearData || availableYears.length === 0) return;

    const loadAll = async () => {
      setIsLoadingAllYears(true);
      try {
        const results = await Promise.all(availableYears.map(y => loadYearData(y)));
        const combined = results.flat().filter(Boolean);
        // Deduplicate by id
        const seen = new Set();
        const deduped = combined.filter(r => {
          if (!r.id || seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        setAllYearsRecords(deduped);
      } finally {
        setIsLoadingAllYears(false);
      }
    };

    loadAll();
  }, [activeTab, loadYearData, availableYears]);

  if (!showManager) return null;

  const handleArchiveConfirm = async () => {
    if (!archivingTeacher || !archiveTeacher) return;
    setIsProcessing(true);
    await archiveTeacher(archivingTeacher);
    setIsProcessing(false);
    setArchivingTeacher(null);
  };

  const handleRestore = async (name) => {
    if (!restoreTeacher) return;
    setIsProcessing(true);
    await restoreTeacher(name);
    setIsProcessing(false);
  };

  // ─── Leave Types Mode ─────────────────────────────────────────────────────
  if (showManager !== 'teachers') {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-white/20">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600"><Info size={24}/></div>
              <div>
                <h3 className="font-black text-xl text-slate-800 leading-none">假别管理</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">管理可用的请假/公事类型</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"><X size={24}/></button>
          </div>
          <div className="px-8 py-6 bg-white border-b border-slate-50">
            <div className="relative">
              <input
                type="text"
                placeholder="输入名称并回车添加..."
                className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const val = e.target.value.trim().toUpperCase();
                    if (!leaveTypesList.includes(val)) { updateList('leave_types', [...leaveTypesList, val]); e.target.value = ""; }
                  }
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Plus size={20}/></div>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-8 space-y-3 bg-slate-50/50">
            {leaveTypesList.map(item => (
              <div key={item} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm group hover:border-indigo-200 transition-all">
                <span className="font-black text-slate-700 text-sm tracking-tight">{item}</span>
                <button onClick={() => updateList('leave_types', leaveTypesList.filter(i => i !== item))} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">更改将立即同步至所有用户的设备</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Teacher Management Mode ──────────────────────────────────────────────
  return (
    <>
      {archivingTeacher && (
        <ArchiveConfirmDialog
          teacherName={archivingTeacher}
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchivingTeacher(null)}
        />
      )}

      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden border border-white/20">

          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600"><User size={24}/></div>
              <div>
                <h3 className="font-black text-xl text-slate-800 leading-none">名单管理</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">管理全校教职员名单</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"><X size={24}/></button>
          </div>

          {/* Tab Switcher */}
          <div className="px-8 pt-5 pb-4 bg-white border-b border-slate-50">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'active' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <User size={14}/> 在职名单
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{sortedTeachers.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'archive' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Archive size={14}/> 档案区
                {archivedTeachers.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'archive' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>{archivedTeachers.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Active Teachers ── */}
          {activeTab === 'active' && (
            <>
              <div className="px-8 py-4 bg-white border-b border-slate-50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="输入姓名并回车添加..."
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const val = e.target.value.trim().toUpperCase();
                        if (!teachersList.includes(val)) { updateList('teachers_list', [...teachersList, val]); e.target.value = ""; }
                      }
                    }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Plus size={20}/></div>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-3 bg-slate-50/50">
                {sortedTeachers.length === 0 && (
                  <div className="text-center py-10"><p className="text-slate-300 font-bold text-sm">目前暂无在职教师</p></div>
                )}
                {sortedTeachers.map(item => (
                  <div key={item} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm group hover:border-amber-200 transition-all">
                    <span className="font-black text-slate-700 text-sm tracking-tight">{item}</span>
                    <button
                      onClick={() => setArchivingTeacher(item)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all text-[10px] font-black uppercase"
                      title="归档此教师（保留历史记录）"
                    >
                      <Archive size={14}/> 归档
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Archive Area ── */}
          {activeTab === 'archive' && (
            <div className="flex-grow overflow-y-auto p-8 space-y-3 bg-slate-50/50">
              {archivedTeachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300"><Archive size={32}/></div>
                  <p className="text-slate-400 font-black text-sm">档案区目前为空</p>
                  <p className="text-slate-300 font-bold text-xs text-center">归档的教师将显示在这里<br/>其历史请假记录将被完整保留</p>
                </div>
              ) : (
                <>
                  {isLoadingAllYears && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-1">
                      <Loader2 size={12} className="animate-spin"/> 正在加载全部历史记录...
                    </div>
                  )}
                  {archivedTeachers.slice().sort((a, b) => a.localeCompare(b)).map(name => (
                    <div key={name} className="space-y-0">
                      <ArchivedTeacherCard
                        name={name}
                        allRecords={allYearsRecords}
                        isLoadingAllYears={isLoadingAllYears}
                      />
                      <div className="flex justify-end pt-1 pb-2 pr-1">
                        <button
                          onClick={() => handleRestore(name)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all text-[10px] font-black uppercase"
                          title="恢复此教师到在职名单"
                        >
                          <RotateCcw size={13}/> 恢复到在职名单
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <div className="p-6 bg-white border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">更改将立即同步至所有用户的设备</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerModal;
