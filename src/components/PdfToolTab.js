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
  );
};

export default PdfToolTab;
