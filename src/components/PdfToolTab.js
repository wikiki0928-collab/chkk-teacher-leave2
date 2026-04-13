import React from 'react';
import { FileUp, FileImage, ImageIcon, Loader2, Archive, CheckCircle2, Download } from 'lucide-react';

const PdfToolTab = ({
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  isConverting,
  handlePdfUpload,
  pdfImages,
  downloadAllAsZip,
  isZipping,
  downloadImage
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload Zone */}
      <div 
        className={`bg-white rounded-[40px] shadow-sm border-2 border-dashed p-12 text-center transition-all duration-300 relative group overflow-hidden ${
          isDragging ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 transition-all duration-300 ${
            isDragging ? 'bg-orange-500 text-white rotate-12' : 'bg-orange-100 text-orange-500 group-hover:-translate-y-1'
          }`}>
            <FileUp size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">转换公函至图片 (PDF → JPG)</h2>
          <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto leading-relaxed">
            {isDragging ? '✨ 放开立刻转换' : '拖拽 PDF 到这里，或者点击下方按钮选择。完全本地处理，绝无隐私泄露风险。'}
          </p>
          
          <div className="mt-8">
            <label className="inline-flex items-center justify-center gap-3 px-10 py-4-5 bg-orange-500 text-white font-black text-lg rounded-2xl cursor-pointer hover:bg-orange-600 shadow-xl active:scale-95 transition-all">
              <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              {isConverting ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />} 
              {isConverting ? '引擎处理中...' : '选择本地文件'}
            </label>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] pointer-events-none" />
      </div>

      {/* Result Grid */}
      {pdfImages.length > 0 && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 space-y-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <CheckCircle2 size={24}/>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">转换结果已就绪</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Total: {pdfImages.length} Pages</p>
              </div>
            </div>
            
            {pdfImages.length > 1 && (
              <button 
                onClick={downloadAllAsZip} 
                disabled={isZipping} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all shadow-lg hover:shadow-orange-200"
              >
                {isZipping ? <Loader2 size={20} className="animate-spin" /> : <Archive size={20} />} 
                {isZipping ? '打包中' : '一键打包 (ZIP)'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {pdfImages.map((imgSrc, index) => (
              <div key={index} className="flex flex-col bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 group">
                <div className="flex justify-between items-center mb-4 px-2">
                   <span className="text-xs font-black text-slate-400 tracking-widest">PAGE 0{index + 1}</span>
                   <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">HQ JPG</span>
                </div>
                
                <div className="flex-1 rounded-[24px] overflow-hidden border border-slate-200 shadow-sm bg-white mb-6 group-hover:shadow-md transition-shadow">
                   <img src={imgSrc} alt={`Page ${index + 1}`} className="w-full h-auto object-contain" />
                </div>
                
                <button 
                  onClick={() => downloadImage(imgSrc, index)} 
                  className="w-full py-4.5 bg-blue-50 text-blue-600 rounded-2xl font-black flex justify-center items-center gap-3 hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-100"
                >
                   <Download size={20}/> 保存至设备
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToolTab;
