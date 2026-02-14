
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Download, AlertCircle, Sparkles, RefreshCw, 
  FileWarning, Hash, ArrowRight, Layers, FileText, Clock, Coffee, 
  XCircle, TrendingDown, ArrowDown, Image as ImageIcon, FileCheck,
  Archive, FolderArchive, FileType, CheckCircle, ShieldCheck, Info,
  Star
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

const ToolPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const tool = TOOLS.find(t => t.id === id);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<'range' | 'individual'>('range');
  const [imgFormat, setImgFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [resultFiles, setResultFiles] = useState<ResultFile[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  });

  const toolTitle = tool ? t.tools[tool.titleKey] : '';
  const toolDesc = tool ? t.tools[tool.descKey] : '';

  const totalSizeMB = useMemo(() => {
    const total = files.reduce((acc, file) => acc + file.size, 0);
    return total / (1024 * 1024);
  }, [files]);

  const usesHighFidelityEngine = tool?.id === 'pdf-to-word' || tool?.id === 'word-to-pdf';

  useEffect(() => {
    if (!tool) {
      navigate('/');
    }
    window.scrollTo(0, 0);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      resultFiles.forEach(f => {
        URL.revokeObjectURL(f.url);
        if (f.previewUrl && !f.previewUrl.startsWith('data:')) URL.revokeObjectURL(f.previewUrl);
      });
      if (processing.downloadUrl) URL.revokeObjectURL(processing.downloadUrl);
      if (processing.previewUrl && !processing.previewUrl.startsWith('data:')) URL.revokeObjectURL(processing.previewUrl);
    };
  }, [tool, navigate, processing.downloadUrl]);

  if (!tool) return null;

  const getAcceptedFiles = () => {
    switch (tool.id) {
      case 'img-to-pdf': return "image/*";
      case 'merge-pdf': 
      case 'split-pdf': 
      case 'compress-pdf': 
      case 'pdf-to-img': 
      case 'pdf-to-word': return "application/pdf";
      case 'word-to-pdf': return ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      default: return "*";
    }
  };

  const generatePreview = async (pdfBlob: Blob): Promise<string> => {
    try {
      if (pdfBlob.type !== 'application/pdf') return '';
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return '';
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      return canvas.toDataURL('image/png');
    } catch (err) {
      return '';
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    abortControllerRef.current = new AbortController();
    const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

    setProcessing({ status: 'processing', progress: 5, message: t.toolPage.initializing });
    
    try {
      if (tool.id === 'pdf-to-img') {
        const zip = new JSZip();
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const mimeType = imgFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const ext = imgFormat === 'jpeg' ? 'jpg' : 'png';

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
          if (blob) zip.file(`Page_${i}.${ext}`, blob);
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
          message: `${t.toolPage.successTitle} rendered ${totalPages} pages.`,
          resultType: 'zip'
        });
        return;
      }

      let endpoint = '';
      const formData = new FormData();

      if (tool.id === 'img-to-pdf') {
        endpoint = API_ENDPOINTS.IMG_TO_PDF;
        files.forEach(f => formData.append('files', f));
      } else if (tool.id === 'merge-pdf') {
        endpoint = API_ENDPOINTS.MERGE_PDF;
        files.forEach(f => formData.append('files', f));
      } else if (tool.id === 'compress-pdf') {
        endpoint = API_ENDPOINTS.COMPRESS_PDF;
        formData.append('file', files[0]);
      } else if (tool.id === 'pdf-to-word') {
        endpoint = API_ENDPOINTS.PDF_TO_WORD;
        formData.append('file', files[0]);
      } else if (tool.id === 'word-to-pdf') {
        endpoint = API_ENDPOINTS.WORD_TO_PDF;
        formData.append('file', files[0]);
      } else if (tool.id === 'split-pdf') {
        if (splitMode === 'range') {
          endpoint = API_ENDPOINTS.SPLIT_PDF_RANGE;
          formData.append('File', files[0]);
          formData.append('StartPage', startPage.toString());
          formData.append('EndPage', endPage.toString());
        } else {
          endpoint = API_ENDPOINTS.SPLIT_PDF;
          formData.append('file', files[0]);
        }
      }

      if (endpoint) {
        setProcessing(prev => ({ ...prev, progress: 20, message: usesHighFidelityEngine ? t.toolPage.hiFiEngine : t.toolPage.uploading }));
        const response = await fetch(endpoint, { method: 'POST', body: formData, signal: abortControllerRef.current.signal });
        if (!response.ok) throw new Error(await response.text() || 'Server processing failed.');
        
        setProcessing(prev => ({ ...prev, progress: 70, message: t.toolPage.finalizing }));
        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        if (contentType?.includes('wordprocessingml') || contentType?.includes('msword')) {
          setProcessing({ status: 'success', progress: 100, downloadUrl, message: t.toolPage.successTitle, resultType: 'word' });
        } else if (contentType?.includes('pdf')) {
          const previewUrl = await generatePreview(blob);
          setProcessing({ status: 'success', progress: 100, downloadUrl, previewUrl, message: t.toolPage.successTitle, resultType: 'pdf', originalSize: originalTotalSize, compressedSize: blob.size });
        } else {
          setProcessing({ status: 'success', progress: 100, downloadUrl, message: t.toolPage.successTitle, resultType: 'pdf' });
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setProcessing({ status: 'error', progress: 0, message: error.message || 'An unexpected error occurred.' });
    } finally {
      abortControllerRef.current = null;
    }
  };

  const resetTool = () => {
    resultFiles.forEach(f => URL.revokeObjectURL(f.url));
    if (processing.downloadUrl) URL.revokeObjectURL(processing.downloadUrl);
    setFiles([]); setResultFiles([]); setProcessing({ status: 'idle', progress: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 relative overflow-hidden">
      {/* PERSISTENT POSTER BLURS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] left-[10%] w-[60%] h-[50%] bg-blue-100 rounded-full blur-[160px] opacity-70 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[140px] opacity-60"></div>
        <div className={`absolute top-[30%] -right-[15%] w-[40%] h-[40%] ${tool.color} rounded-full blur-[180px] opacity-20`}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-blue-600 mb-8 transition-all group bg-white/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-100 shadow-sm hover:shadow-md">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> {t.toolPage.backToTools}
        </Link>

        <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-14 overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8 relative z-10">
            <div className="flex items-center space-x-8">
              <div className={`${tool.color} w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200/50 flex-shrink-0 transform -rotate-2 hover:rotate-0 transition-transform duration-500`}>
                {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-12 h-12' })}
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{toolTitle}</h1>
                <p className="text-gray-500 mt-2 font-semibold text-lg">{toolDesc}</p>
              </div>
            </div>
            <div className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border self-start md:self-center transition-all ${usesHighFidelityEngine ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm' : 'bg-green-50 text-green-700 border-green-100 shadow-sm'}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{usesHighFidelityEngine ? t.toolPage.hiFiEngineBadge : t.toolPage.secureEnterprise}</span>
            </div>
          </div>

          {processing.status === 'idle' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Dropzone 
                onFilesSelected={setFiles} 
                accept={getAcceptedFiles()}
                multiple={tool.id === 'img-to-pdf' || tool.id === 'merge-pdf'} 
              />
              
              {tool.id === 'pdf-to-img' && files.length > 0 && (
                <div className="mt-10 p-8 bg-orange-50/40 rounded-[2rem] border border-orange-100 grid grid-cols-2 gap-6">
                  <button onClick={() => setImgFormat('jpeg')} className={`p-5 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-widest ${imgFormat === 'jpeg' ? 'border-orange-500 bg-white shadow-xl translate-y-[-2px]' : 'border-transparent bg-white/50 hover:bg-white'}`}>{t.toolPage.jpgFormat}</button>
                  <button onClick={() => setImgFormat('png')} className={`p-5 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-widest ${imgFormat === 'png' ? 'border-orange-500 bg-white shadow-xl translate-y-[-2px]' : 'border-transparent bg-white/50 hover:bg-white'}`}>{t.toolPage.pngFormat}</button>
                </div>
              )}

              <button
                disabled={files.length === 0}
                onClick={handleProcess}
                className={`w-full mt-12 py-6 rounded-[1.75rem] font-black text-xl tracking-wide transition-all shadow-2xl flex items-center justify-center group ${files.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:scale-[1.01]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <Play className="mr-3 w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
                {t.toolPage.processNow}
              </button>
            </div>
          )}

          {processing.status === 'processing' && (
            <div className="py-24 flex flex-col items-center text-center animate-in fade-in duration-700">
              <div className="relative w-40 h-40 mb-12">
                <div className="absolute inset-0 rounded-full border-4 border-blue-50 shadow-inner"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" style={{ animationDuration: '0.6s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-blue-600 tabular-nums">{processing.progress}%</div>
                <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg text-blue-600">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">{t.toolPage.processingTitle}</h3>
              <p className="text-gray-500 mb-16 max-w-sm font-bold text-lg leading-relaxed">{processing.message}</p>
              <div className="w-full max-w-md bg-gray-100 h-4 rounded-full overflow-hidden mb-16 shadow-inner p-1">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 h-full transition-all duration-300 rounded-full bg-[length:200%_100%] animate-gradient" style={{ width: `${processing.progress}%` }}></div>
              </div>
              <button onClick={() => abortControllerRef.current?.abort()} className="px-8 py-3 rounded-full border border-gray-200 text-sm font-black text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all flex items-center uppercase tracking-widest">
                <XCircle className="w-5 h-5 mr-2" /> {t.toolPage.stopTask}
              </button>
            </div>
          )}

          {processing.status === 'success' && (
            <div className="py-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-1000 slide-in-from-bottom-10">
              
              <div className="relative mb-16 w-full max-w-lg mx-auto">
                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 rounded-[4rem] blur-[80px] opacity-60 animate-pulse"></div>
                
                {processing.previewUrl ? (
                  <div className="relative group perspective-1000">
                    <div className="absolute -inset-4 bg-white/20 backdrop-blur-xl rounded-[2.5rem] border border-white/30 shadow-2xl transform -rotate-3 transition-transform group-hover:rotate-0 duration-700"></div>
                    <div className="relative bg-white p-4 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] pdf-shadow overflow-hidden max-w-[320px] mx-auto transform rotate-2 group-hover:rotate-0 transition-all duration-700 ease-out-expo">
                      <img src={processing.previewUrl} alt="Result Preview" className="w-full h-auto rounded-2xl shadow-inner border border-gray-50" />
                      <div className="absolute bottom-6 right-6 bg-blue-600 text-white p-3 rounded-2xl shadow-2xl shadow-blue-400 transform scale-110">
                        <Star className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-green-200 transform hover:scale-110 transition-transform mx-auto">
                    <CheckCircle className="w-16 h-16" />
                  </div>
                )}
              </div>

              <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">{t.toolPage.successTitle}</h2>
              <p className="text-gray-500 mb-12 font-bold text-xl leading-relaxed max-w-md">{processing.message}</p>
              
              <div className="w-full max-w-md space-y-5">
                {processing.downloadUrl && (
                  <a 
                    href={processing.downloadUrl} 
                    download={
                      tool.id === 'pdf-to-word' ? `${files[0]?.name.split('.')[0] || 'converted'}.docx` : 
                      tool.id === 'pdf-to-img' ? `images-archive.zip` : `processed-document.pdf`
                    }
                    className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] flex items-center justify-center text-white transition-all transform hover:-translate-y-2 hover:scale-[1.02] active:scale-95 ${processing.resultType === 'word' ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-300/50' : processing.resultType === 'zip' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-300/50' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-300/50'}`}
                  >
                    <Download className="w-8 h-8 mr-4" />
                    {t.toolPage.grabFile}
                  </a>
                )}
                
                <button onClick={resetTool} className="w-full py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-[2rem] font-black text-lg hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center shadow-lg group">
                  <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-700" /> {t.toolPage.startNew}
                </button>
              </div>

              <div className="mt-16 p-8 bg-blue-50/40 backdrop-blur-sm border border-blue-100/50 rounded-[2.5rem] w-full text-left max-w-md relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-125 transition-transform duration-1000"></div>
                <p className="text-blue-900 text-sm leading-relaxed flex items-start font-bold relative z-10">
                  <Info className="w-6 h-6 mr-4 flex-shrink-0 text-blue-600" />
                  {t.toolPage.securityNote}
                </p>
              </div>
            </div>
          )}

          {processing.status === 'error' && (
            <div className="py-20 flex flex-col items-center text-center animate-in fade-in duration-500">
              <div className="w-28 h-28 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-red-200 transform -rotate-6">
                <FileWarning className="w-14 h-14" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t.toolPage.errorTitle}</h3>
              <p className="text-gray-500 mb-14 max-w-sm bg-red-50/60 p-8 rounded-[2rem] border border-red-100 text-lg font-bold leading-relaxed">{processing.message}</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5 w-full max-w-sm">
                <button onClick={resetTool} className="flex-1 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95">Restart</button>
                <Link to="/" className="flex-1 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-center">Cancel</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ease-out-expo {
          transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ToolPage;
