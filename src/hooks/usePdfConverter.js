import { useState, useEffect } from 'react';

export function usePdfConverter(showToast) {
  const [pdfImages, setPdfImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

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

  const processPdfFile = async (file) => {
    if (file.type !== 'application/pdf') return showToast("❌ 请上传有效的 PDF 文件！");
    if (!pdfjsLoaded) return showToast('⏳ 引擎准备中...');
    
    setIsConverting(true);
    setPdfImages([]);
    
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
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          images.push(canvas.toDataURL('image/jpeg', 0.95));
        }
        
        setPdfImages(images);
        setIsConverting(false);
        showToast(`✅ 成功转换 ${pdf.numPages} 页！`);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsConverting(false);
      showToast("❌ 转换失败。");
    }
  };

  const downloadAllAsZip = async () => {
    if (!window.JSZip) return showToast("⏳ 加载中...");
    if (pdfImages.length === 0) return;
    
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
      const dateStr = new Date().toLocaleDateString('en-CA'); // 'en-CA' often gives YYYY-MM-DD local
      link.download = `公函包_${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("✅ 全部打包下载完成！");
    } catch (error) {
      showToast("❌ 打包失败");
    } finally {
      setIsZipping(false);
    }
  };

  return {
    pdfImages,
    isConverting,
    isZipping,
    processPdfFile,
    downloadAllAsZip
  };
}
