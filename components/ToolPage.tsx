
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Download, Sparkles, RefreshCw, 
  FileWarning, XCircle, CheckCircle, ShieldCheck, Info,
  Star, Eye, List, BookOpen, Layout, Printer, RotateCw, Image as ImageIcon, Settings2, Minimize2
} from 'lucide-react';
import { TOOLS, API_ENDPOINTS } from '../constants';
import Dropzone from './Dropzone';
import { ProcessingState } from '../types';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { useLanguage } from '../App';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

interface ResultFile {
  url: string;
  name: string;
  previewUrl?: string;
  type: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ToolPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const tool = TOOLS.find(t => t.id === id);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [imgFormat, setImgFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [totalPagesFound, setTotalPagesFound] = useState<number>(1);
  const [resultFiles, setResultFiles] = useState<ResultFile[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  });

  const toolTitle = tool ? t.tools[tool.titleKey] : '';
  const toolDesc = tool ? t.tools[tool.descKey] : '';
  const seoHeader = tool ? (t.tools[`${tool.id}SEO`] || toolTitle) : toolTitle;

  const hasOptions = useMemo(() => {
    return tool?.id === 'pdf-to-img' || tool?.id === 'word-to-images';
  }, [tool?.id]);

  useEffect(() => {
    if ((tool?.id === 'split-pdf' || tool?.id === 'booklet-pdf') && files.length > 0) {
      const getPages = async () => {
        try {
          const arrayBuffer = await files[0].arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          setTotalPagesFound(pdf.numPages);
        } catch (e) {
          console.error("Error reading PDF pages:", e);
        }
      };
      getPages();
    }
  }, [files, tool?.id]);

  useEffect(() => {
    if (!tool) navigate('/');
    window.scrollTo(0, 0);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [tool, navigate]);

  if (!tool) return null;

  const getAcceptedFiles = () => {
    switch (tool.id) {
      case 'img-to-pdf': return "image/*";
      case 'merge-pdf': 
      case 'split-pdf': 
      case 'compress-pdf': 
      case 'pdf-to-img': 
      case 'booklet-pdf':
      case 'pdf-to-word': return "application/pdf";
      case 'word-to-pdf':
      case 'word-to-images': return ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case 'excel-to-pdf': return ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      default: return "*";
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    abortControllerRef.current = new AbortController();

    setProcessing({ status: 'processing', progress: 5, message: t.toolPage.initializing });
    
    try {
      let endpoint = '';
      const formData = new FormData();

      if (tool.id === 'pdf-to-img') {
        const zip = new JSZip();
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const mimeType = imgFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const ext = imgFormat === 'jpeg' ? 'jpg' : 'png';
        const previews: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
          if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, mimeType, 0.9));
          if (blob) {
            zip.file(`Page_${i}.${ext}`, blob);
            const dataUrl = canvas.toDataURL('image/png');
            if (i <= 50) previews.push(dataUrl);
          }
          setProcessing(prev => ({ 
            ...prev, 
            progress: 10 + Math.floor((i / totalPages) * 80), 
            message: t.toolPage.rasterizing.replace('{i}', i.toString()).replace('{total}', totalPages.toString()) 
          }));
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setProcessing({
          status: 'success', progress: 100,
          downloadUrl: URL.createObjectURL(zipBlob),
          previewUrl: previews[0],
          previewGallery: previews,
          message: `${t.toolPage.successTitle} Rendered ${totalPages} pages.`,
          resultType: 'zip'
        });
        return;
      }

      endpoint = tool.id === 'img-to-pdf' ? API_ENDPOINTS.IMG_TO_PDF :
                 tool.id === 'merge-pdf' ? API_ENDPOINTS.MERGE_PDF :
                 tool.id === 'compress-pdf' ? API_ENDPOINTS.COMPRESS_PDF :
                 tool.id === 'pdf-to-word' ? API_ENDPOINTS.PDF_TO_WORD :
                 tool.id === 'word-to-pdf' ? API_ENDPOINTS.WORD_TO_PDF :
                 tool.id === 'split-pdf' ? API_ENDPOINTS.SPLIT_PDF :
                 tool.id === 'booklet-pdf' ? API_ENDPOINTS.PDF_TO_BOOKLET : 
                 tool.id === 'excel-to-pdf' ? API_ENDPOINTS.EXCEL_TO_PDF :
                 tool.id === 'word-to-images' ? API_ENDPOINTS.WORD_TO_IMAGES : '';

      if (['img-to-pdf', 'merge-pdf'].includes(tool.id)) {
        files.forEach(f => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }

      if (tool.id === 'word-to-images') {
        formData.append('format', imgFormat);
      }

      const originalSize = tool.id === 'compress-pdf' ? files[0].size : undefined;

      if (endpoint) {
        setProcessing(prev => ({ ...prev, progress: 20, message: t.toolPage.uploading }));
        const response = await fetch(endpoint, { 
          method: 'POST', 
          body: formData, 
          signal: abortControllerRef.current.signal 
        });
        
        if (!response.ok) {
           const errText = await response.text();
           throw new Error(errText || 'Conversion failed. Please check the file and try again.');
        }
        
        setProcessing(prev => ({ ...prev, progress: 70, message: t.toolPage.finalizing }));

        if (tool.id === 'word-to-images') {
          const data = await response.json();
          const zip = new JSZip();
          const ext = imgFormat === 'jpeg' ? 'jpg' : 'png';
          const mime = imgFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
          
          for (let i = 0; i < data.pages.length; i++) {
            const imgBlob = base64ToBlob(data.pages[i], mime);
            zip.file(`Page_${i + 1}.${ext}`, imgBlob);
          }
          
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          setProcessing({ 
            status: 'success', 
            progress: 100, 
            downloadUrl: URL.createObjectURL(zipBlob), 
            previewUrl: `data:${mime};base64,${data.pages[0]}`,
            message: `${t.toolPage.successTitle} Extracted ${data.pages.length} images.`,
            resultType: 'zip' 
          });
          return;
        }

        if (tool.id === 'split-pdf') {
          const data = await response.json();
          const zip = new JSZip();
          const previews: string[] = [];
          
          for (let i = 0; i < data.pages.length; i++) {
            const pdfBlob = base64ToBlob(data.pages[i], 'application/pdf');
            zip.file(`Page_${i + 1}.pdf`, pdfBlob);
            if (i < 5) {
              const p = await generatePreviews(pdfBlob);
              if (p[0]) previews.push(p[0]);
            }
          }
          
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          setProcessing({ 
            status: 'success', 
            progress: 100, 
            downloadUrl: URL.createObjectURL(zipBlob), 
            previewUrl: previews[0],
            previewGallery: previews,
            message: `${t.toolPage.successTitle} Extracted ${data.pages.length} pages.`,
            resultType: 'zip' 
          });
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const previews = await generatePreviews(blob);
        
        const contentType = response.headers.get('content-type')?.toLowerCase() || '';
        let resultType: ProcessingState['resultType'] = 'pdf';
        
        if (contentType.includes('word') || contentType.includes('officedocument') || tool.id === 'pdf-to-word') {
          resultType = 'word';
        } else if (contentType.includes('zip') || contentType.includes('octet-stream')) {
          resultType = 'zip';
        }

        setProcessing({ 
          status: 'success', 
          progress: 100, 
          downloadUrl: url, 
          previewUrl: previews[0], 
          previewGallery: previews,
          message: t.toolPage.successTitle,
          resultType: resultType,
          originalSize: originalSize,
          compressedSize: tool.id === 'compress-pdf' ? blob.size : undefined
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setProcessing({ 
        status: 'error', 
        progress: 0, 
        message: error.message.includes('process cannot access the file') 
          ? "The server is currently busy. Please wait a moment and try again."
          : error.message
      });
    }
  };

  const generatePreviews = async (blob: Blob): Promise<string[]> => {
    try {
      if (blob.type !== 'application/pdf') return [];
      const pdf = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
      const count = Math.min(pdf.numPages, 10);
      const res: string[] = [];
      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        canvas.height = vp.height; canvas.width = vp.width;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp, canvas }).promise;
        res.push(canvas.toDataURL());
      }
      return res;
    } catch { return []; }
  };

  const base64ToBlob = (b64: string, type: string) => {
    const s = atob(b64);
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return new Blob([a], { type });
  };

  const launchButton = (
    <button
      onClick={handleProcess}
      className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center"
    >
      <Play className="mr-3 w-5 h-5 fill-current" />
      {t.toolPage.processNow}
    </button>
  );

  const downloadFileName = useMemo(() => {
    const baseName = "PDF_Toolkit_Pro_Result";
    switch (processing.resultType) {
      case 'word': return `${baseName}.docx`;
      case 'zip': return `${baseName}.zip`;
      default: return `${baseName}.pdf`;
    }
  }, [processing.resultType]);

  const compressionSavings = useMemo(() => {
    if (processing.originalSize && processing.compressedSize) {
      const savings = 100 - (processing.compressedSize / processing.originalSize * 100);
      return savings.toFixed(1);
    }
    return null;
  }, [processing.originalSize, processing.compressedSize]);

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 relative overflow-hidden">
      <div className="sr-only">
        <h1>{seoHeader}</h1>
        <h2>{toolDesc}</h2>
        <p>Use our professional PDF Toolkit to process your documents securely and instantly.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-blue-600 mb-8 transition-all group bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-gray-100 shadow-sm">
          <ChevronLeft className="w-4 h-4 mr-2" /> {t.toolPage.backToTools}
        </Link>

        <div className="bg-white/95 backdrop-blur-xl rounded-[4rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 md:p-16 relative">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-10">
            <div className="flex items-center space-x-10">
              <div className={`${tool.color} w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transform -rotate-3`}>
                {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-14 h-14' })}
              </div>
              <div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tight">{toolTitle}</h1>
                <p className="text-gray-500 mt-2 font-bold text-xl">{toolDesc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.toolPage.secureEnterprise}</span>
            </div>
          </div>

          {processing.status === 'idle' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {hasOptions && (
                <div className="mb-12 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/[0.02] flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-blue-200">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-4 rounded-2xl mr-6 text-blue-600">
                      <Settings2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Conversion Options</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select your preferred output format</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-gray-50 p-2 rounded-[1.75rem] border border-gray-100 w-full md:w-auto">
                    <button 
                      onClick={() => setImgFormat('jpeg')}
                      className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${imgFormat === 'jpeg' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}
                    >
                      JPEG
                    </button>
                    <button 
                      onClick={() => setImgFormat('png')}
                      className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${imgFormat === 'png' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}
                    >
                      PNG
                    </button>
                  </div>
                </div>
              )}

              <Dropzone 
                onFilesSelected={setFiles} 
                accept={getAcceptedFiles()}
                multiple={['img-to-pdf', 'merge-pdf'].includes(tool.id)}
                actionButton={files.length > 0 ? launchButton : null}
                showReorder={tool.id === 'merge-pdf'}
              />
              
              {tool.id === 'booklet-pdf' && files.length > 0 && (
                <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-teal-50/50 rounded-[2.5rem] border border-teal-100 flex items-start">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-teal-600 shadow-sm">
                        <Layout className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-900 mb-2">Booklet Layout</h4>
                        <p className="text-teal-900 text-sm font-semibold opacity-70">Automated imposition for professional folding.</p>
                      </div>
                    </div>
                    <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex items-start">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-blue-600 shadow-sm">
                        <Printer className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-900 mb-2">Print Ready</h4>
                        <p className="text-blue-900 text-sm font-semibold opacity-70">Targeting {totalPagesFound} pages. Divisible by 4.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {processing.status === 'processing' && (
            <div className="py-24 flex flex-col items-center text-center">
              <div className="relative w-48 h-48 mb-16">
                <div className="absolute inset-0 rounded-full border-8 border-blue-50"></div>
                <div className="absolute inset-0 rounded-full border-8 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-blue-600">{processing.progress}%</div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4">{t.toolPage.processingTitle}</h3>
              <p className="text-gray-500 max-w-sm font-bold text-lg mb-12">{processing.message}</p>
              <button onClick={() => abortControllerRef.current?.abort()} className="px-8 py-3 bg-red-50 text-red-500 rounded-full font-black uppercase text-xs tracking-widest border border-red-100 hover:bg-red-100 transition-all">Cancel Task</button>
            </div>
          )}

          {processing.status === 'success' && (
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
              <div className="mb-12">
                <div className="relative p-6 bg-white rounded-[3rem] shadow-2xl border border-gray-100 max-w-sm mx-auto">
                  {processing.previewUrl ? (
                    <img src={processing.previewUrl} className="w-full rounded-2xl shadow-sm" alt="Preview" />
                  ) : (
                    <CheckCircle className="w-24 h-24 text-green-500" />
                  )}
                  <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-5 rounded-3xl shadow-2xl">
                    <Download className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {tool.id === 'compress-pdf' && processing.originalSize && processing.compressedSize && (
                <div className="w-full max-w-2xl grid grid-cols-3 gap-6 mb-12 animate-in slide-in-from-bottom-8 duration-1000">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.toolPage.originalSize}</p>
                    <p className="text-lg font-black text-gray-900">{formatBytes(processing.originalSize)}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                       <Minimize2 className="w-12 h-12 text-blue-600" />
                    </div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{t.toolPage.compressedSize}</p>
                    <p className="text-lg font-black text-blue-900">{formatBytes(processing.compressedSize)}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <Sparkles className="w-12 h-12 text-green-600" />
                    </div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">{t.toolPage.savings}</p>
                    <p className="text-2xl font-black text-green-700">-{compressionSavings}%</p>
                  </div>
                </div>
              )}

              <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">{t.toolPage.successTitle}</h2>
              
              <div className="w-full max-w-md space-y-6">
                <a 
                  href={processing.downloadUrl} 
                  download={downloadFileName} 
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-all transform hover:-translate-y-2"
                >
                  <Download className="mr-4 w-8 h-8" /> {t.toolPage.grabFile}
                </a>
                <button onClick={() => setProcessing({ status: 'idle', progress: 0 })} className="w-full py-5 bg-gray-50 text-gray-900 rounded-[2rem] font-black text-lg border-2 border-transparent hover:border-gray-200 transition-all">Start New Conversion</button>
              </div>
            </div>
          )}

          {processing.status === 'error' && (
            <div className="py-20 flex flex-col items-center text-center animate-in fade-in">
              <div className="w-32 h-32 bg-red-100 text-red-600 rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl shadow-red-100">
                <FileWarning className="w-16 h-16" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{t.toolPage.errorTitle}</h3>
              <p className="text-red-900 bg-red-50 p-10 rounded-[2.5rem] border border-red-100 font-bold max-w-lg mb-12 shadow-sm leading-relaxed">{processing.message}</p>
              <button onClick={() => setProcessing({ status: 'idle', progress: 0 })} className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Try Again</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ToolPage;
