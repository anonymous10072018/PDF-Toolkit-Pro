
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Download, Sparkles, RefreshCw, 
  FileWarning, XCircle, CheckCircle, ShieldCheck, Info,
  Star, Eye, List, BookOpen, Layout, Printer, RotateCw, Image as ImageIcon, Settings2, Minimize2, Type, Stamp, ImagePlus, Upload, Lock, Shield, Bell, MessageSquare, MessageSquarePlus, Palette, Layers, Square, Circle, Hash, ArrowDownUp, Move, RotateCcw,
  FileText, ChevronRight, HelpCircle, AlertTriangle, Search, Zap, Maximize, ArrowDown, Check, Globe
} from 'lucide-react';
import { TOOLS, API_ENDPOINTS, CLIENT_KEY } from '../constants';
import Dropzone from './Dropzone';
import { ProcessingState } from '../types';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
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
  
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imgFormat, setImgFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Customization States
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [userPassword, setUserPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('Important: Please review this document carefully.');
  
  // Advanced Annotation States
  const [annotationX, setAnnotationX] = useState<number>(100);
  const [annotationY, setAnnotationY] = useState<number>(100);
  const [annotationSize, setAnnotationSize] = useState<number>(60);
  const [annotationNote, setAnnotationNote] = useState<string>('Verified & Protected');
  const [annotationHexColor, setAnnotationHexColor] = useState<string>('#2563EB');
  const [annotationShape, setAnnotationShape] = useState<'square' | 'circle'>('square');
  const [applyToAllPages, setApplyToAllPages] = useState<boolean>(true);

  // Rearrange State
  const [pageThumbnails, setPageThumbnails] = useState<{index: number, url: string}[]>([]);
  const [pageSequence, setPageSequence] = useState<number[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [totalPagesFound, setTotalPagesFound] = useState<number>(1);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Extract Images State
  const [extractedImages, setExtractedImages] = useState<{name: string, url: string, blob: Blob}[]>([]);
  const [selectedImageIndices, setSelectedImageIndices] = useState<Set<number>>(new Set());
  
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  });

  const toolTitle = tool ? t.tools[tool.titleKey] : '';
  const toolDesc = tool ? t.tools[tool.descKey] : '';
  const seoHeader = tool ? (t.tools[`${tool.id}SEO`] || toolTitle) : toolTitle;

  const isImageWatermark = useMemo(() => tool?.id === 'add-image-watermark', [tool?.id]);
  const isRearrange = useMemo(() => tool?.id === 'rearrange-pdf', [tool?.id]);
  const isAnnotation = useMemo(() => tool?.id === 'add-advanced-annotation', [tool?.id]);
  const isWatermark = useMemo(() => tool?.id === 'add-watermark', [tool?.id]);
  const isEncryption = useMemo(() => tool?.id === 'encrypt-pdf', [tool?.id]);
  const isAlert = useMemo(() => tool?.id === 'add-dynamic-alert', [tool?.id]);
  const isCompression = useMemo(() => tool?.id === 'compress-pdf', [tool?.id]);
  const isBooklet = useMemo(() => tool?.id === 'booklet-pdf', [tool?.id]);
  const isPdfToImg = useMemo(() => tool?.id === 'pdf-to-img', [tool?.id]);
  const isExtractImages = useMemo(() => tool?.id === 'extract-images', [tool?.id]);

  const relatedTools = useMemo(() => {
    return TOOLS.filter(item => item.id !== id).slice(0, 3);
  }, [id]);

  // Restored detailed content helpers
  const faqs = useMemo(() => {
    return [
      { q: "Is this tool free to use?", a: "Yes, PDF Toolkit Pro offers this tool completely free of charge with no hidden subscriptions." },
      { q: "Are my files secure?", a: "Absolutely. We use AES-256 encryption for transfers and all files are automatically purged from our servers within 60 minutes." },
      { q: "What is the maximum file size?", a: "We currently support files up to 100MB to ensure high-speed processing for all users." },
      { q: "Do you keep copies of my documents?", a: "Never. Your privacy is our priority. We do not store, view, or share your content." }
    ];
  }, []);

  const benefits = useMemo(() => [
    { title: "Enterprise Grade", desc: "Professional high-fidelity engines used by Fortune 500 companies.", icon: <ShieldCheck className="w-6 h-6" /> },
    { title: "Ultra Fast", desc: "Optimized server architecture for near-instant processing.", icon: <Zap className="w-6 h-6" /> },
    { title: "No Quality Loss", desc: "Maintain 100% of your document formatting and resolution.", icon: <Sparkles className="w-6 h-6" /> }
  ], []);

  useEffect(() => {
    const pagedTools = ['rearrange-pdf'];
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
              await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
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

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newSequence = [...pageSequence];
    const item = newSequence.splice(draggedItemIndex, 1)[0];
    newSequence.splice(index, 0, item);
    
    setPageSequence(newSequence);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleProcess = async () => {
    if (!isExtractImages && files.length === 0) return;
    if (isExtractImages && !websiteUrl) return;
    if (isImageWatermark && !watermarkImage) return;

    if (isExtractImages) {
      setExtractedImages([]);
      setSelectedImageIndices(new Set());
    }

    abortControllerRef.current = new AbortController();
    setProcessing({ status: 'processing', progress: 5, message: t.toolPage.initializing });
    
    try {
      const formData = new FormData();
      let endpoint = API_ENDPOINTS[tool.id.replace(/-/g, '_').toUpperCase() as keyof typeof API_ENDPOINTS];
      
      if (!endpoint) throw new Error("Endpoint configuration missing for this tool.");

      const originalFileSize = isCompression ? files[0]?.size : undefined;

      if (isExtractImages) {
        formData.append('url', websiteUrl);
      } else if (['img-to-pdf', 'merge-pdf'].includes(tool.id)) { 
        files.forEach(f => formData.append('files', f)); 
      } 
      else if (isImageWatermark) { 
        formData.append('pdfFile', files[0]); 
        formData.append('watermarkImage', watermarkImage!); 
      } 
      else { 
        formData.append('file', files[0]); 
      }

      // Apply User Customizations
      if (['word-to-images', 'pdf-to-img'].includes(tool.id)) formData.append('format', imgFormat);
      if (isWatermark) formData.append('watermarkText', watermarkText);
      if (isEncryption) formData.append('userPassword', userPassword || 'PDFTOOLKITPRO');
      if (isAlert) formData.append('alertMessage', alertMessage);
      
      if (isAnnotation) {
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
        headers: {
          'X-Client-Key': CLIENT_KEY
        },
        body: formData, 
        signal: abortControllerRef.current.signal 
      });

      if (!response.ok) { 
        if (response.status === 429) throw new Error("Server is too busy. Please wait 30 seconds.");
        throw new Error(`Server returned error ${response.status}`); 
      }
      
      setProcessing(prev => ({ ...prev, progress: 70, message: t.toolPage.finalizing }));

      const contentType = response.headers.get('content-type')?.toLowerCase() || '';

      if (contentType.includes('application/json')) {
        const data = await response.json(); 
        const zip = new JSZip();
        const previews: string[] = [];

        for (let i = 0; i < data.pages.length; i++) {
          const mime = tool.id === 'split-pdf' ? 'application/pdf' : 'image/jpeg';
          const ext = tool.id === 'split-pdf' ? 'pdf' : 'jpg';
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

      const blob = await response.blob();
      let resultType: 'pdf' | 'word' | 'zip' = 'pdf';
      if (contentType.includes('word')) resultType = 'word';
      else if (contentType.includes('zip') || contentType.includes('octet-stream')) resultType = 'zip';

      let previews: string[] = [];
      if (resultType === 'pdf') {
        previews = await generatePreviews(blob);
      } else if (resultType === 'zip') {
        if (isExtractImages) {
          const zip = await JSZip.loadAsync(blob);
          const imageFiles = Object.values(zip.files).filter(f => !f.dir);
          
          // Parallel processing for faster retrieval
          const images = await Promise.all(imageFiles.map(async (file) => {
            const fileBlob = await file.async('blob');
            return {
              name: file.name,
              url: URL.createObjectURL(fileBlob),
              blob: fileBlob
            };
          }));

          setExtractedImages(images);
          setSelectedImageIndices(new Set(images.map((_, i) => i))); // Select all by default
          setProcessing({ 
            status: 'success', 
            progress: 100, 
            message: t.toolPage.successTitle,
            resultType: 'zip'
          });
          return;
        }
        previews = await getPreviewsFromZip(blob);
      }

      setProcessing({ 
        status: 'success', 
        progress: 100, 
        downloadUrl: URL.createObjectURL(blob), 
        message: t.toolPage.successTitle,
        previewUrl: previews[0],
        previewGallery: previews,
        resultType,
        originalSize: originalFileSize,
        compressedSize: blob.size
      });

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setProcessing({ 
          status: 'error', 
          progress: 0, 
          message: error.message || "An unexpected error occurred during processing."
        });
      }
    }
  };

  const getPreviewsFromZip = async (blob: Blob): Promise<string[]> => {
    try {
      const zip = await JSZip.loadAsync(blob);
      const files = Object.values(zip.files).filter(f => 
        !f.dir && (f.name.toLowerCase().endsWith('.jpg') || f.name.toLowerCase().endsWith('.jpeg') || f.name.toLowerCase().endsWith('.png'))
      );
      const previews: string[] = [];
      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const content = await files[i].async('base64');
        const ext = files[i].name.split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        previews.push(`data:${mime};base64,${content}`);
      }
      return previews;
    } catch (e) {
      console.error("Error unzipping for previews:", e);
      return [];
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
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
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

  const handleDownloadSelected = async () => {
    if (selectedImageIndices.size === 0) return;
    const zip = new JSZip();
    extractedImages.forEach((img, i) => {
      if (selectedImageIndices.has(i)) {
        zip.file(img.name, img.blob);
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Selected_Images_${new Date().getTime()}.zip`;
    link.click();
  };

  const toggleSelectAll = () => {
    if (selectedImageIndices.size === extractedImages.length) {
      setSelectedImageIndices(new Set());
    } else {
      setSelectedImageIndices(new Set(extractedImages.map((_, i) => i)));
    }
  };

  const toggleImageSelection = (index: number) => {
    const newSelection = new Set(selectedImageIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedImageIndices(newSelection);
  };

  const launchButton = (
    <button onClick={handleProcess} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
      <Play className="mr-3 w-5 h-5 fill-current" /> {t.toolPage.processNow}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        <nav className="flex items-center space-x-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-10 bg-white/60 backdrop-blur-md py-3 px-6 rounded-full border border-gray-100 shadow-sm w-fit">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">{toolTitle}</span>
        </nav>

        <div className="bg-white/95 backdrop-blur-xl rounded-[4rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 md:p-16 relative mb-12">
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

          {isExtractImages && processing.status !== 'processing' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 bg-violet-50 p-10 rounded-[3rem] border border-violet-100 shadow-sm"
            >
              <div className="flex items-center mb-8">
                <div className="bg-white p-4 rounded-2xl mr-6 text-violet-600 shadow-sm"><Search className="w-6 h-6" /></div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Website URL</h3>
              </div>
              <div className="flex flex-col gap-6">
                <div className="relative w-full">
                  <Globe className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-violet-300" />
                  <input 
                    type="url" 
                    value={websiteUrl} 
                    onChange={(e) => setWebsiteUrl(e.target.value)} 
                    placeholder="https://example.com/very-long-url-path-that-needs-to-be-visible" 
                    className="w-full pl-20 pr-8 py-6 bg-white border border-violet-100 rounded-[2.5rem] font-bold text-xl text-gray-900 focus:ring-4 focus:ring-violet-200 focus:outline-none shadow-inner transition-all" 
                  />
                </div>
                <div className="flex justify-end">
                  {launchButton}
                </div>
              </div>
              <p className="mt-6 text-violet-900/60 font-bold text-sm italic ml-2">We'll crawl the page and package all found images into a single ZIP file.</p>
            </motion.div>
          )}

          {processing.status === 'idle' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              
              {!isExtractImages && (
                <div className="grid grid-cols-1 gap-12 mb-12">
                  {isAnnotation && (
                  <div className="bg-blue-50/50 p-10 rounded-[3rem] border border-blue-100 shadow-sm">
                    <div className="flex items-center mb-10">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-blue-600 shadow-sm"><Settings2 className="w-6 h-6" /></div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Annotation Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4"><Move className="w-3 h-3 mr-2" /> X Position ({annotationX})</label>
                          <input type="range" min="0" max="600" value={annotationX} onChange={(e) => setAnnotationX(parseInt(e.target.value))} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                        <div>
                          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4"><Move className="w-3 h-3 mr-2 rotate-90" /> Y Position ({annotationY})</label>
                          <input type="range" min="0" max="800" value={annotationY} onChange={(e) => setAnnotationY(parseInt(e.target.value))} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                        <div>
                          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4"><Maximize className="w-3 h-3 mr-2" /> Shape Size ({annotationSize})</label>
                          <input type="range" min="10" max="200" value={annotationSize} onChange={(e) => setAnnotationSize(parseInt(e.target.value))} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3"><MessageSquarePlus className="w-3 h-3 mr-2" /> Note Content</label>
                          <input type="text" value={annotationNote} onChange={(e) => setAnnotationNote(e.target.value)} className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                        </div>
                        <div className="flex gap-6">
                          <div className="flex-grow">
                            <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3"><Palette className="w-3 h-3 mr-2" /> Note Color</label>
                            <input type="color" value={annotationHexColor} onChange={(e) => setAnnotationHexColor(e.target.value)} className="w-full h-14 p-1 bg-white border border-blue-100 rounded-2xl cursor-pointer" />
                          </div>
                          <div>
                            <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3"><Layers className="w-3 h-3 mr-2" /> Shape</label>
                            <div className="flex bg-white p-1.5 rounded-2xl border border-blue-100">
                              <button onClick={() => setAnnotationShape('square')} className={`p-3 rounded-xl transition-all ${annotationShape === 'square' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-600'}`}><Square className="w-5 h-5" /></button>
                              <button onClick={() => setAnnotationShape('circle')} className={`p-3 rounded-xl transition-all ${annotationShape === 'circle' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-600'}`}><Circle className="w-5 h-5" /></button>
                            </div>
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer group mt-4">
                          <input type="checkbox" checked={applyToAllPages} onChange={(e) => setApplyToAllPages(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-600 transition-colors">Apply to all pages</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {isWatermark && (
                  <div className="bg-rose-50/50 p-10 rounded-[3rem] border border-rose-100 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-rose-600 shadow-sm"><Stamp className="w-6 h-6" /></div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Watermark Text</h3>
                    </div>
                    <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="e.g. DRAFT" className="w-full px-8 py-5 bg-white border border-rose-100 rounded-3xl font-black text-xl text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                  </div>
                )}

                {isEncryption && (
                  <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-slate-700 shadow-sm"><Lock className="w-6 h-6" /></div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Secure PDF Password</h3>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                      <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Set document password..." className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-3xl font-bold text-lg text-gray-900 focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                    </div>
                  </div>
                )}

                {isAlert && (
                  <div className="bg-indigo-50/50 p-10 rounded-[3rem] border border-indigo-100 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-indigo-600 shadow-sm"><Bell className="w-6 h-6" /></div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Alert Popup Content</h3>
                    </div>
                    <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="w-full px-8 py-6 bg-white border border-indigo-100 rounded-3xl font-bold text-lg text-gray-900 min-h-[120px] focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none" />
                  </div>
                )}

                {isBooklet && (
                  <div className="bg-teal-50/50 p-10 rounded-[3rem] border border-teal-100 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-teal-600 shadow-sm"><Printer className="w-6 h-6" /></div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t.toolPage.bookletTipTitle}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-teal-50">
                      <p className="text-teal-900 font-bold text-lg leading-relaxed">{t.toolPage.bookletTipDesc}</p>
                    </div>
                  </div>
                )}

                {(tool.id === 'word-to-images' || tool.id === 'pdf-to-img') && (
                  <div className="bg-orange-50/50 p-10 rounded-[3rem] border border-orange-100 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-white p-4 rounded-2xl mr-6 text-orange-600 shadow-sm"><ImageIcon className="w-6 h-6" /></div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Output Image Format</h3>
                    </div>
                    <div className="flex gap-6">
                      <button 
                        onClick={() => setImgFormat('jpeg')} 
                        className={`flex-1 py-5 rounded-3xl font-black text-lg transition-all border-2 ${imgFormat === 'jpeg' ? 'bg-orange-600 text-white border-orange-600 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
                      >
                        {t.toolPage.jpgFormat}
                      </button>
                      <button 
                        onClick={() => setImgFormat('png')} 
                        className={`flex-1 py-5 rounded-3xl font-black text-lg transition-all border-2 ${imgFormat === 'png' ? 'bg-orange-600 text-white border-orange-600 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
                      >
                        {t.toolPage.pngFormat}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {isImageWatermark && (
                <div className="mb-12 bg-amber-50 p-8 rounded-[3rem] border border-amber-100 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600 mb-6">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Select Watermark Overlay</h3>
                  <p className="text-amber-900/60 font-bold text-sm mb-8">Choose the transparent logo or image to overlay.</p>
                  <input 
                    type="file" 
                    onChange={(e) => setWatermarkImage(e.target.files?.[0] || null)} 
                    className="hidden" 
                    id="watermark-upload" 
                    accept="image/*"
                  />
                  <label htmlFor="watermark-upload" className="cursor-pointer px-10 py-5 bg-white border-2 border-dashed border-amber-200 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-amber-700 shadow-sm hover:bg-amber-100 hover:border-amber-400 transition-all flex items-center">
                    {watermarkImage ? watermarkImage.name : 'Click to Pick Image'}
                  </label>
                </div>
              )}

              {isRearrange && files.length > 0 && (
                <div className="mb-12">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 bg-cyan-50 p-8 rounded-[3rem] border border-cyan-100 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-white p-5 rounded-[1.75rem] mr-6 text-cyan-600 shadow-sm"><ArrowDownUp className="w-8 h-8" /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Reorder Pages</h3>
                        <p className="text-cyan-900/60 font-bold text-sm leading-snug">Drag and drop thumbnails to change the page sequence.</p>
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
                        <div 
                          key={pageIdx} 
                          draggable
                          onDragStart={() => handleDragStart(sequenceIdx)}
                          onDragOver={(e) => handleDragOver(e, sequenceIdx)}
                          onDragEnd={handleDragEnd}
                          className={`group relative flex flex-col bg-white rounded-[2rem] border-2 ${draggedItemIndex === sequenceIdx ? 'opacity-50 border-cyan-600 scale-95' : 'border-gray-100 hover:border-cyan-400 hover:shadow-2xl'} overflow-hidden cursor-grab active:cursor-grabbing transition-all`}
                        >
                          <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                            <img src={pageThumbnails.find(t=>t.index===pageIdx)?.url} className="w-full h-full object-cover" alt={`Page ${pageIdx + 1}`} />
                            <div className="absolute top-4 left-4 w-10 h-10 bg-cyan-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg border border-white/20">{sequenceIdx + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(!isRearrange && !isExtractImages || (isRearrange && files.length === 0)) && (
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
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Processing Customization...</h3>
              <p className="text-gray-500 max-w-sm font-bold text-lg mb-12">{processing.message}</p>
              <button onClick={() => abortControllerRef.current?.abort()} className="px-8 py-3 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all">Cancel Task</button>
            </div>
          )}

          {processing.status === 'success' && (
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
              {isExtractImages && extractedImages.length > 0 ? (
                <div className="w-full">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-12 bg-violet-50 p-8 rounded-[3rem] border border-violet-100 shadow-sm gap-6">
                    <div className="flex items-center">
                      <div className="bg-white p-5 rounded-[1.75rem] mr-6 text-violet-600 shadow-sm"><ImageIcon className="w-8 h-8" /></div>
                      <div className="text-left">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Images Found: {extractedImages.length}</h3>
                        <p className="text-violet-900/60 font-bold text-sm">Selected: <span className="text-violet-600">{selectedImageIndices.size}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={toggleSelectAll} 
                        className="px-8 py-4 bg-white text-violet-700 rounded-2xl font-black text-xs uppercase tracking-widest border border-violet-200 shadow-sm hover:bg-violet-50 transition-all"
                      >
                        {selectedImageIndices.size === extractedImages.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <button 
                        onClick={handleDownloadSelected} 
                        disabled={selectedImageIndices.size === 0}
                        className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center ${selectedImageIndices.size > 0 ? 'bg-violet-600 text-white hover:bg-violet-700 hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        <Download className="mr-3 w-5 h-5" /> Download Selected
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <AnimatePresence mode="popLayout">
                      {extractedImages.map((img, i) => (
                        <motion.div 
                          key={img.name + i}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: Math.min(i * 0.05, 1.5), // Staggered entry, capped at 1.5s
                            type: "spring",
                            stiffness: 100
                          }}
                          onClick={() => toggleImageSelection(i)}
                          className={`group relative aspect-square bg-white rounded-[2rem] border-4 overflow-hidden cursor-pointer transition-all duration-300 ${selectedImageIndices.has(i) ? 'border-violet-600 shadow-2xl scale-105' : 'border-gray-100 hover:border-violet-200'}`}
                        >
                          <img src={img.url} className="w-full h-full object-cover" alt={img.name} />
                          <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${selectedImageIndices.has(i) ? 'bg-violet-600 text-white shadow-lg' : 'bg-white/80 backdrop-blur-md text-gray-300'}`}>
                            {selectedImageIndices.has(i) ? <Check className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full border-2 border-gray-200" />}
                          </div>
                          <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/5 transition-colors" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-16 relative w-full max-w-2xl mx-auto flex flex-col items-center">
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

                {/* Compression Statistics Display */}
                {isCompression && processing.originalSize && processing.compressedSize && (
                  <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">{t.toolPage.originalSize}</span>
                      <span className="text-2xl font-black text-gray-900">{formatBytes(processing.originalSize)}</span>
                    </div>
                    <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl text-center flex flex-col items-center justify-center relative overflow-hidden group">
                      <ArrowDown className="absolute -top-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform duration-700" />
                      <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] block mb-2 relative z-10">{t.toolPage.compressedSize}</span>
                      <span className="text-2xl font-black text-white relative z-10">{formatBytes(processing.compressedSize)}</span>
                    </div>
                    <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 shadow-sm text-center">
                      <span className="text-[10px] font-black text-green-600/60 uppercase tracking-[0.2em] block mb-2">{t.toolPage.savings}</span>
                      <div className="flex flex-col items-center">
                         <span className="text-3xl font-black text-green-600">{Math.round(((processing.originalSize - processing.compressedSize) / processing.originalSize) * 100)}%</span>
                         <span className="text-[9px] font-bold text-green-700/40 uppercase tracking-widest mt-1">Smaller File</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isExtractImages && (
                <>
                  <h2 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter mt-8">Success!</h2>
                  <p className="text-gray-400 font-bold text-lg mb-12 uppercase tracking-widest">{t.toolPage.securityNote}</p>
                  
                  <div className="w-full max-w-md space-y-6">
                    <a href={processing.downloadUrl} download={`PDFToolkitPro_${tool.id}_Result`} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all transform hover:-translate-y-2 group">
                      <Download className="mr-5 w-8 h-8 group-hover:animate-bounce" /> {t.toolPage.grabFile}
                    </a>
                    <button onClick={() => setProcessing({ status: 'idle', progress: 0 })} className="w-full py-6 bg-gray-50 text-gray-900 rounded-[2.5rem] font-black text-xl border-2 border-transparent hover:border-gray-200 transition-all flex items-center justify-center">
                      <RotateCw className="w-6 h-6 mr-3 text-gray-400" /> Start Another
                    </button>
                  </div>
                </>
              )}
            </>
          )}
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
              </div>
              <button onClick={() => setProcessing({ status: 'idle', progress: 0 })} className="px-16 py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1">
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* New Informational Sections: Tool Benefits & FAQ */}
        <div className="space-y-32 mt-32">
          {/* Detailed Tool Benefits */}
          <section>
            <div className="flex flex-col items-center text-center mb-16">
              <div className="flex items-center space-x-3 mb-6">
                <span className="w-12 h-[3px] bg-blue-600 rounded-full"></span>
                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.5em]">Premium Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Why use our {toolTitle}?</h2>
              <p className="text-gray-500 max-w-2xl font-bold text-lg italic">Built for precision, engineered for privacy.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                    {b.icon}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{b.title}</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white/60 backdrop-blur-md rounded-[4rem] border border-white p-16 md:p-24 shadow-sm">
            <div className="flex flex-col md:flex-row gap-20">
              <div className="md:w-1/3">
                 <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-8">Frequently Asked <br /><span className="text-blue-600">Questions</span></h2>
                 <p className="text-gray-500 font-bold leading-relaxed mb-10">Common questions about using our {toolTitle} engine.</p>
                 <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                   <HelpCircle className="w-4 h-4" />
                   <span>Support Available 24/7</span>
                 </div>
              </div>
              <div className="md:w-2/3 space-y-12">
                {faqs.map((faq, i) => (
                  <div key={i} className="group">
                    <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                      <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center mr-5 text-sm font-black group-hover:bg-blue-600 transition-colors">?</div>
                      {faq.q}
                    </h4>
                    <div className="pl-14">
                      <p className="text-gray-500 font-bold text-lg leading-relaxed border-l-4 border-gray-50 pl-6 group-hover:border-blue-100 transition-colors">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                     <Shield className="w-64 h-64" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8"><Check className="w-8 h-8" /></div>
                    <h4 className="text-3xl font-black mb-4 leading-tight">100% Data Security</h4>
                    <p className="text-blue-100 font-bold text-lg leading-relaxed opacity-80">AES-256 encrypted transfers. Files are purged automatically after processing.</p>
                  </div>
               </div>
               <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-5 transform group-hover:scale-110 transition-transform duration-700 text-blue-600">
                     <Zap className="w-64 h-64" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600"><Zap className="w-8 h-8" /></div>
                    <h4 className="text-3xl font-black mb-4 leading-tight text-gray-900">Millisecond Latency</h4>
                    <p className="text-gray-400 font-bold text-lg leading-relaxed">Our optimized server logic processes documents in milliseconds using advanced OCR and conversion engines.</p>
                  </div>
               </div>
            </section>
        </div>

        <div className="mt-40">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-12 ml-4">Explore More Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedTools.map(item => (
              <Link key={item.id} to={`/tool/${item.id}`} className="block group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all">
                <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-all`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{t.tools[item.titleKey]}</h3>
                <p className="text-gray-400 text-sm font-bold truncate">{t.tools[item.descKey]}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
