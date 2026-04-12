import React from 'react';
import { Database, X, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

const BaselineModal = ({
  showBaselineModal,
  onClose,
  importText,
  setImportText,
  handleParseImport,
  parsedBaseline,
  saveBaseline
}) => {
  if (!showBaselineModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border-4 border-indigo-100">
        <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-2xl flex items-center gap-2 text-indigo-900"><Database className="text-indigo-600" size={24}/> 导入前期旧账底数 (Excel)</h3>
            <p className="text-sm font-bold text-indigo-600 mt-1">直接从 Excel 复制【老师名字】和【1-3月假期总数】两列，粘贴到下方即可。</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-full hover:bg-indigo-200 hover:text-indigo-700 transition-all shadow-sm"><X size={24}/></button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 bg-slate-50 flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">请在此处粘贴 (Ctrl + V)</label>
            <textarea 
              value={importText} 
              onChange={(e) => setImportText(e.target.value)}
              placeholder="WONG CHUN LIN&#9;15&#10;TEO AH BAN&#9;8&#10;HO CHIN FONG&#9;3..."
              className="w-full flex-grow min-h-[200px] p-4 bg-white border-2 border-indigo-100 rounded-2xl font-mono text-sm outline-none focus:border-indigo-400 resize-none shadow-inner"
            />
            <button onClick={handleParseImport} className="py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-md active:scale-95 flex items-center justify-center gap-2 transition-all">
              解析数据 <ArrowRight size={18}/>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-100 border-b font-black text-sm text-slate-700 flex justify-between items-center">
              <span>解析结果预览</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs">成功识别: {parsedBaseline.filter(p => p.matched).length} 人</span>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-2 max-h-[300px]">
              {parsedBaseline.length === 0 ? (
                <div className="text-center text-slate-300 font-bold py-10">等待解析...</div>
              ) : (
                parsedBaseline.map((item, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${item.matched ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <span className={`font-bold ${item.matched ? 'text-slate-700' : 'text-red-500 line-through'}`}>{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg">{item.value} 天</span>
                      {item.matched ? <CheckCircle2 className="text-green-500" size={18}/> : <AlertTriangle className="text-red-500" size={18} title="系统中找不到该名字"/>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t">
              <button onClick={saveBaseline} disabled={parsedBaseline.filter(p=>p.matched).length === 0} className="w-full py-3.5 bg-green-500 text-white rounded-xl font-black hover:bg-green-600 disabled:opacity-50 shadow-md active:scale-95 transition-all">
                确认保存到云端
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaselineModal;
