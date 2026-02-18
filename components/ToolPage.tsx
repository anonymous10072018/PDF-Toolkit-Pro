import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Download, Sparkles, RefreshCw, 
  FileWarning, XCircle, CheckCircle, ShieldCheck, Info,
  Star, Eye, List, BookOpen, Layout, Printer, RotateCw, Image as ImageIcon, Settings2, Minimize2, Type, Stamp, ImagePlus, Upload, Lock, Shield, Bell, MessageSquare, MessageSquarePlus, Palette, Layers, Square, Circle, Hash, ArrowDownUp, Move, RotateCcw,
  FileText, ChevronRight, HelpCircle, AlertTriangle, Search, Zap
} from 'lucide-react';
import { TOOLS, API_ENDPOINTS } from '../constants';
import Dropzone from './Dropzone';
import { ProcessingState } from '../types';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { useLanguage } from '../App';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

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
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imgFormat, setImgFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [watermarkText, setWatermarkText] = useState('WATERMARK');
  const [userPassword, setUserPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('Please read this document carefully.');
  
  // Advanced Annotation State
  const [annotationX, setAnnotationX] = useState<number>(50);
  const [annotationY, setAnnotationY] = useState<number>(50);
  const [annotationSize, setAnnotationSize] = useState<number>(50);
  const [annotationNote, setAnnotationNote] = useState<string>('Professional Note');
  const [annotationHexColor, setAnnotationHexColor] = useState<string>('#2563EB');
  const [annotationShape, setAnnotationShape] = useState<'square' | 'circle'>('square');
  const [applyToAllPages, setApplyToAllPages] = useState<boolean>(false);

  // Rearrange State
  const [pageThumbnails, setPageThumbnails] = useState<{index: number, url: string}[]>([]);
  const [pageSequence, setPageSequence] = useState<number[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);

  const [totalPagesFound, setTotalPagesFound] = useState<number>(1);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  });

  const toolTitle = tool ? t.tools[tool.titleKey] : '';
  const toolDesc = tool ? t.tools[tool.descKey] : '';
  const seoHeader = tool ? (t.tools[`${tool.id}SEO`] || toolTitle) : toolTitle;

  const hasImageOptions = useMemo(() => tool?.id === 'pdf-to-img' || tool?.id === 'word-to-images', [tool?.id]);
  const hasWatermarkOptions = useMemo(() => tool?.id === 'add-watermark', [tool?.id]);
  const isImageWatermark = useMemo(() => tool?.id === 'add-image-watermark', [tool?.id]);
  const isEncryption = useMemo(() => tool?.id === 'encrypt-pdf', [tool?.id]);
  const isDynamicAlert = useMemo(() => tool?.id === 'add-dynamic-alert', [tool?.id]);
  const isAdvancedAnnotation = useMemo(() => tool?.id === 'add-advanced-annotation', [tool?.id]);
  const isRearrange = useMemo(() => tool?.id === 'rearrange-pdf', [tool?.id]);

  const relatedTools = useMemo(() => {
    return TOOLS.filter(item => item.id !== id).slice(0, 3);
  }, [id]);

  useEffect(() => {
    const pagedTools = ['split-pdf', 'booklet-pdf', 'add-watermark', 'add-image-watermark', 'encrypt-pdf', 'add-dynamic-alert', 'add-advanced-annotation', 'rearrange-pdf'];
    if (tool && pagedTools.includes(tool.id) && files.length > 0) {
      const getPages = async () => {
        try {
          if (files[0].type !== 'application/pdf') return;
          const arrayBuffer = await files[0].arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const count = pdf.numPages;
          setTotalPagesFound(count);
          if (isRearrange) {
            setLoadingThumbnails(true);
            const thumbs: {index: number, url: string}[] = [];
            const sequence: number[] = [];
            for (let i = 1; i <= count; i++) {
              const page = await pdf.getPage(i);
              const vp = page.getViewport({ scale: 0.4 });
              const canvas = document.createElement('canvas');
              canvas.height = vp.height; canvas.width = vp.width;
              await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp, canvas }).promise;
              thumbs.push({ index: i - 1, url: canvas.toDataURL('image/jpeg', 0.8) });
              sequence.push(i - 1);
            }
            setPageThumbnails(thumbs);
            setPageSequence(sequence);
            setLoadingThumbnails(false);
          }
        } catch (e) { console.error("Error reading PDF pages:", e); }
      };
      getPages();
    } else if (files.length === 0) {
      setPageThumbnails([]); setPageSequence([]);
    }
  }, [files, tool?.id, isRearrange]);

  useEffect(() => {
    if (!tool) navigate('/');
    window.scrollTo(0, 0);
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [tool, navigate]);

  if (!tool) return null;

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    // Safety check for specific tools
    if (isImageWatermark && !watermarkImage) return;
    if (isEncryption && !userPassword) return;

    abortControllerRef.current = new AbortController();
    setProcessing({ status: 'processing', progress: 5, message: t.toolPage.initializing });
    
    try {
      const formData = new FormData();
      let endpoint = API_ENDPOINTS[tool.id.replace(/-/g, '_').toUpperCase() as keyof typeof API_ENDPOINTS];
      
      if (!endpoint) throw new Error("Endpoint configuration missing for this tool.");

      if (['img-to-pdf', 'merge-pdf'].includes(tool.id)) { 
        files.forEach(f => formData.append('files', f)); 
      } 
      else if (isImageWatermark) { 
        formData.append('pdfFile', files[0]); 
        formData.append('watermarkImage', watermarkImage!); 
      } 
      else { 
        formData.append('file', files[0]); 
      }

      if (tool.id === 'word-to-images') formData.append('format', imgFormat);
      if (tool.id === 'add-watermark') formData.append('watermarkText', watermarkText);
      if (tool.id === 'encrypt-pdf') formData.append('userPassword', userPassword);
      if (tool.id === 'add-dynamic-alert') formData.append('alertMessage', alertMessage);
      
      if (isAdvancedAnnotation) {
        formData.append('x', annotationX.toString()); 
        formData.append('y', annotationY.toString());
        formData.append('size', annotationSize.toString()); 
        formData.append('note', annotationNote);
        formData.append('hexColor', annotationHexColor); 
        formData.append('shape', annotationShape);
        formData.append('applyToAllPages', applyToAllPages.toString());
      }

      if (isRearrange) formData.append('pageOrder', pageSequence.join(','));

      setProcessing(prev => ({ ...prev, progress: 20, message: t.toolPage.uploading }));
      
      const response = await fetch(endpoint, { 
        method: 'POST', 
        body: formData, 
        signal: abortControllerRef.current.signal 
      });

      if (!response.ok) { 
        if (response.status === 429) throw new Error("Server is too busy. Please wait 30 seconds and try again.");
        if (response.status === 413) throw new Error("File is too large for our free processing engine.");
        const errText = await response.text(); 
        throw new Error(errText || `Server returned error ${response.status}`); 
      }
      
      setProcessing(prev => ({ ...prev, progress: 70, message: t.toolPage.finalizing }));

      // Handle structured responses (Split/Word to Images)
      if (tool.id === 'word-to-images' || tool.id === 'split-pdf') {
        const data = await response.json(); 
        const zip = new JSZip();
        const previews: string[] = [];

        for (let i = 0; i < data.pages.length; i++) {
          const mime = tool.id === 'split-pdf' ? 'application/pdf' : (imgFormat === 'jpeg' ? 'image/jpeg' : 'image/png');
          const ext = tool.id === 'split-pdf' ? 'pdf' : (imgFormat === 'jpeg' ? 'jpg' : 'png');
          const blob = base64ToBlob(data.pages[i], mime);
          zip.file(`Page_${i + 1}.${ext}`, blob);
          if (i < 3) previews.push(`data:${mime};base64,${data.pages[i]}`);
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setProcessing({ 
          status: 'success', 
          progress: 100, 
          downloadUrl: URL.createObjectURL(zipBlob), 
          resultType: 'zip', 
          message: t.toolPage.successTitle,
          previewGallery: previews 
        });
        return;
      }

      // Handle direct file responses (PDF/Word)
      const blob = await response.blob();
      const contentType = response.headers.get('content-type')?.toLowerCase() || '';
      let resultType: 'pdf' | 'word' = contentType.includes('word') ? 'word' : 'pdf';
      
      // Fallback result type based on tool
      if (tool.id === 'pdf-to-word') resultType = 'word';

      const previews = resultType === 'pdf' ? await generatePreviews(blob) : [];

      setProcessing({ 
        status: 'success', 
        progress: 100, 
        downloadUrl: URL.createObjectURL(blob), 
        message: t.toolPage.successTitle,
        previewUrl: previews[0],
        previewGallery: previews,
        resultType
      });

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Processing Error:", error);
        setProcessing({ 
          status: 'error', 
          progress: 0, 
          message: error.message || "An unexpected error occurred during processing."
        });
      }
    }
  };

  const generatePreviews = async (blob: Blob): Promise<string[]> => {
    try {
      if (blob.type !== 'application/pdf') return [];
      const pdf = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
      const count = Math.min(pdf.numPages, 5);
      const res: string[] = [];
      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        canvas.height = vp.height; canvas.width = vp.width;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp, canvas }).promise;
        res.push(canvas.toDataURL('image/jpeg', 0.8));
      }
      return res;
    } catch { return []; }
  };

  const base64ToBlob = (b64: string, type: string) => {
    const s = atob(b64); const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return new Blob([a], { type });
  };

  const launchButton = (
    <button onClick={handleProcess} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
      <Play className="mr-3 w-5 h-5 fill-current" /> {t.toolPage.processNow}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Breadcrumbs for SEO */}
        <nav className="flex items-center space-x-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-10 bg-white/60 backdrop-blur-md py-3 px-6 rounded-full border border-gray-100 shadow-sm w-fit">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">{toolTitle}</span>
        </nav>

        <div className="bg-white/95 backdrop-blur-xl rounded-[4rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 md:p-16 relative mb-12">
          {/* Main Header with H1 for SEO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-10">
            <div className="flex items-center space-x-10">
              <div className={`${tool.color} w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transform -rotate-3`}>
                {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-14 h-14' })}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">{seoHeader}</h1>
                <p className="text-gray-500 font-bold text-lg">{toolDesc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.toolPage.secureEnterprise}</span>
            </div>
          </div>

          {processing.status === 'idle' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {isRearrange && files.length > 0 && (
                <div className="mb-12">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 bg-cyan-50 p-8 rounded-[3rem] border border-cyan-100 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-white p-5 rounded-[1.75rem] mr-6 text-cyan-600 shadow-sm"><ArrowDownUp className="w-8 h-8" /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{t.toolPage.reorderGuideTitle}</h3>
                        <p className="text-cyan-900/60 font-bold text-sm leading-snug">{t.toolPage.reorderGuideDesc}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <button onClick={() => setPageSequence([...pageSequence].reverse())} className="px-6 py-4 bg-white text-cyan-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-cyan-200 shadow-sm flex items-center"><RefreshCw className="w-3 h-3 mr-2" /> Reverse</button>
                      <button onClick={() => setPageSequence(Array.from({ length: totalPagesFound }, (_, i) => i))} className="px-6 py-4 bg-white text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-200 shadow-sm flex items-center"><RotateCcw className="w-3 h-3 mr-2" /> Reset</button>
                      {launchButton}
                    </div>
                  </div>
                  {loadingThumbnails ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                       <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                       <span className="font-black text-cyan-600 uppercase tracking-widest text-xs">Loading Previews...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                      {pageSequence.map((pageIdx, sequenceIdx) => (
                        <div key={pageIdx} className="group relative flex flex-col bg-white rounded-[2rem] border-2 border-gray-100 hover:border-cyan-400 hover:shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-all">
                          <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                            <img src={pageThumbnails.find(t=>t.index===pageIdx)?.url} className="w-full h-full object-cover" alt={`Page ${pageIdx + 1}`} />
                            <div className="absolute top-4 left-4 w-10 h-10 bg-cyan-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg border border-white/20">{sequenceIdx + 1}</div>
                          </div>
                          <div className="p-4 text-center bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">Orig. Page {pageIdx + 1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(!isRearrange || files.length === 0) && (
                <Dropzone 
                  onFilesSelected={setFiles} 
                  accept={tool.id==='img-to-pdf'?"image/*":tool.id==='word-to-pdf'||tool.id==='word-to-images'?".doc,.docx":tool.id==='excel-to-pdf'?".xls,.xlsx":"application/pdf"} 
                  multiple={['img-to-pdf','merge-pdf'].includes(tool.id)} 
                  actionButton={files.length > 0 ? launchButton : null} 
                  showReorder={['merge-pdf', 'img-to-pdf'].includes(tool.id)} 
                />
              )}
            </div>
          )}

          {processing.status === 'processing' && (
            <div className="py-24 flex flex-col items-center text-center">
              <div className="relative w-56 h-56 mb-16">
                <div className="absolute inset-0 rounded-full border-[12px] border-blue-50"></div>
                <div className="absolute inset-0 rounded-full border-[12px] border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-5xl text-blue-600">{processing.progress}%</span>
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">Optimization</span>
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t.toolPage.processingTitle}</h3>
              <p className="text-gray-500 max-w-sm font-bold text-lg mb-12">{processing.message}</p>
              <button onClick={() => abortControllerRef.current?.abort()} className="px-8 py-3 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all">Cancel Task</button>
            </div>
          )}

          {processing.status === 'success' && (
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
              
              {/* High-Fidelity Result Poster */}
              <div className="mb-16 relative w-full max-w-2xl mx-auto flex justify-center">
                {processing.resultType === 'zip' ? (
                  <div className="flex -space-x-12 hover:space-x-4 transition-all duration-700">
                    {(processing.previewGallery || [null, null, null]).slice(0, 3).map((src, i) => (
                      <div key={i} className="w-48 h-64 bg-white rounded-3xl shadow-2xl border-4 border-white rotate-[-5deg] transform hover:rotate-0 hover:-translate-y-4 transition-all overflow-hidden flex items-center justify-center">
                        {src ? <img src={src} className="w-full h-full object-cover" alt="Preview" /> : <div className="bg-gray-50 w-full h-full flex items-center justify-center"><FileText className="w-12 h-12 text-gray-200" /></div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative group perspective-1000">
                    <div className="w-64 h-80 bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white overflow-hidden transform group-hover:rotate-y-12 transition-transform duration-700">
                      {processing.previewUrl ? (
                         <img src={processing.previewUrl} className="w-full h-full object-cover" alt="Result Poster" />
                      ) : (
                        <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center p-8">
                          <FileText className="w-20 h-20 text-blue-200 mb-4" />
                          <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em]">{processing.resultType?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-2xl animate-bounce border-8 border-white">
                      <Download className="w-10 h-10" />
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">{t.toolPage.successTitle}</h2>
              <p className="text-gray-400 font-bold text-lg mb-12 uppercase tracking-widest">{t.toolPage.securityNote}</p>
              
              <div className="w-full max-w-md space-y-6">
                <a href={processing.downloadUrl} download={`PDFToolkitPro_${tool.id}_Result`} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all transform hover:-translate-y-2 group">
                  <Download className="mr-5 w-8 h-8 group-hover:animate-bounce" /> {t.toolPage.grabFile}
                </a>
                <button onClick={() => setProcessing({ status: 'idle', progress: 0 })} className="w-full py-6 bg-gray-50 text-gray-900 rounded-[2.5rem] font-black text-xl border-2 border-transparent hover:border-gray-200 transition-all flex items-center justify-center">
                  <RotateCw className="w-6 h-6 mr-3 text-gray-400" /> {t.toolPage.startNew}
                </button>
              </div>
            </div>
          )}

          {processing.status === 'error' && (
            <div className="py-24 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-40 h-40 bg-red-50 text-red-500 rounded-[3.5rem] flex items-center justify-center mb-12 shadow-2xl border-4 border-white rotate-6">
                <AlertTriangle className="w-20 h-20" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t.toolPage.errorTitle}</h3>
              <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 max-w-xl mb-12">
                 <p className="text-red-900 font-bold text-lg leading-relaxed">{processing.message}</p>
                 <div className="mt-6 pt-6 border-t border-red-100 flex items-center justify-center space-x-4">
                    <div className="flex h-10 w-10 rounded-full bg-white items-center justify-center text-red-500"><Info className="w-4 h-4" /></div>
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest text-left">Check your internet connection or try a smaller file.</span>
                 </div>
              </div>
              <button onClick={() => setProcessing({ status: 'idle', progress: 0 })} className="px-16 py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1">
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* SEO Enhanced Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
          
          <div className="lg:col-span-2 space-y-12">
            
            {/* SEO Visual Benefit Poster */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                     <Shield className="w-64 h-64" />
                  </div>
                  <h4 className="text-2xl font-black mb-4 leading-tight">100% Secure & Private</h4>
                  <p className="text-blue-100 font-bold text-sm leading-relaxed opacity-80">We use AES-256 encryption. Your files are auto-purged within 60 minutes. No data scraping, ever.</p>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-5 transform group-hover:scale-110 transition-transform duration-700 text-blue-600">
                     <Zap className="w-64 h-64" />
                  </div>
                  <h4 className="text-2xl font-black mb-4 leading-tight text-gray-900">Lightning Fast</h4>
                  <p className="text-gray-400 font-bold text-sm leading-relaxed">Our multi-threaded cloud engine handles even the most complex documents in under 15 seconds.</p>
               </div>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-blue-50 opacity-50 group-hover:rotate-12 transition-transform duration-700" />
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{t.toolPage.whyTitle.replace('{tool}', toolTitle)}</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  "Preserves high-resolution original formatting.",
                  "Permanent data wipe every 60 minutes.",
                  "Zero software installation required.",
                  "Optimized for mobile and desktop usage.",
                  "Enterprise-grade conversion fidelity.",
                  "Direct browser-to-cloud secure link."
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="bg-blue-50 p-2 rounded-lg mr-4 text-blue-600 flex-shrink-0 mt-1"><CheckCircle className="w-5 h-5" /></div>
                    <span className="text-gray-600 font-bold text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-10">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t.toolPage.faqTitle}</h2>
              </div>
              <div className="space-y-10">
                {[
                  { q: `Is it free to use the ${toolTitle}?`, a: "Yes, our tools are completely free for everyone. We support our mission through discreet advertising that doesn't interfere with your workflow." },
                  { q: "Is my data safe with PDF Toolkit Pro?", a: "Absolutely. We utilize TLS encryption for all uploads and strictly purge all files from our servers within 60 minutes of processing." },
                  { q: "Do I need to create an account?", a: "No account or registration is required. We believe in providing instant, frictionless tools for professional users." }
                ].map((faq, i) => (
                  <div key={i} className="group border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                    <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{faq.q}</h3>
                    <p className="text-gray-500 font-bold leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-8 ml-4">{t.toolPage.relatedTools}</h2>
              <div className="space-y-4">
                {relatedTools.map(item => (
                  <Link key={item.id} to={`/tool/${item.id}`} className="block group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all">
                    <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{t.tools[item.titleKey]}</h3>
                    <p className="text-gray-400 font-bold text-sm mt-2 line-clamp-2">{t.tools[item.descKey]}</p>
                  </Link>
                ))}
                <Link to="/" className="flex items-center justify-center w-full py-6 rounded-[2rem] bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-100/10 group">
                  <Search className="w-4 h-4 mr-3 opacity-0 group-hover:opacity-100 transition-all" />
                  {t.toolPage.allTools}
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ToolPage;
