import React, { useState, useEffect } from 'react';
import { 
  Upload, X, FileText, Move, GripVertical, ChevronLeft, ChevronRight 
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  actionButton?: React.ReactNode;
  showReorder?: boolean;
}

const FilePreviewCard: React.FC<{
  file: File;
  index: number;
  total: number;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDraggingItem: boolean;
  showReorder: boolean;
}> = ({ 
  file, index, total, onRemove, onMove, 
  onDragStart, onDragOver, onDragEnd, onDrop,
  isDraggingItem, showReorder 
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (file.type === 'application/pdf') {
      const generateThumbnail = async () => {
        setLoading(true);
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            if (isMounted) setThumbnail(canvas.toDataURL());
          }
        } catch (e) {
          console.error("Thumbnail error:", e);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      generateThumbnail();
    }
    return () => { isMounted = false; };
  }, [file]);

  return (
    <div 
      draggable={showReorder}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-500 overflow-hidden
        ${isDraggingItem ? 'opacity-0 scale-90 grayscale' : 'border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-400'}
        ${showReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="relative aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {thumbnail ? (
          <img src={thumbnail} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
        ) : loading ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full mb-1" />
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-300">
            <FileText className="w-10 h-10 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-widest">{file.type.split('/')[1] || 'FILE'}</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3 w-7 h-7 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg border border-white/20">
          {index + 1}
        </div>

        {showReorder && (
          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 flex items-center justify-center pointer-events-none">
             <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full flex items-center shadow-xl scale-75 border border-blue-100">
               <Move className="w-4 h-4 text-blue-600 mr-2" />
               <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Hold to Move</span>
             </div>
          </div>
        )}

        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 shadow-lg z-20 border border-gray-100"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="mb-3">
          <p className="text-[11px] font-black text-gray-900 truncate tracking-tight" title={file.name}>{file.name}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>

        {showReorder && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex space-x-1.5">
              <button 
                onClick={(e) => { e.stopPropagation(); onMove('up'); }}
                disabled={index === 0}
                className={`p-2 rounded-lg border transition-all ${index === 0 ? 'border-gray-50 text-gray-100 cursor-not-allowed' : 'border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onMove('down'); }}
                disabled={index === total - 1}
                className={`p-2 rounded-lg border transition-all ${index === total - 1 ? 'border-gray-50 text-gray-100 cursor-not-allowed' : 'border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <GripVertical className="w-4 h-4 text-gray-200 group-hover:text-blue-300 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, accept = "*", multiple = true, actionButton, showReorder = false }) => {
  const [isDraggingRoot, setIsDraggingRoot] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const validateFiles = (files: File[]): File[] => {
    if (accept === "*") return files;
    const types = accept.split(',').map(t => t.trim().toLowerCase());
    return files.filter(f => {
      const name = f.name.toLowerCase();
      const type = f.type.toLowerCase();
      return types.some(t => t.startsWith('.') ? name.endsWith(t) : type === t || type.startsWith(t.replace('*', '')));
    });
  };

  const handleDropRoot = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRoot(false);
    const files = validateFiles(Array.from(e.dataTransfer.files));
    if (files.length) {
      const updated = multiple ? [...selectedFiles, ...files] : [files[0]];
      setSelectedFiles(updated);
      onFilesSelected(updated);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = validateFiles(Array.from(e.target.files || []));
    if (files.length) {
      const updated = multiple ? [...selectedFiles, ...files] : [files[0]];
      setSelectedFiles(updated);
      onFilesSelected(updated);
    }
    e.target.value = '';
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFiles = [...selectedFiles];
    const item = newFiles.splice(draggedIndex, 1)[0];
    newFiles.splice(index, 0, item);
    setSelectedFiles(newFiles);
    setDraggedIndex(index);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDraggingRoot(true); }}
        onDragLeave={() => setIsDraggingRoot(false)}
        onDrop={handleDropRoot}
        className={`relative border-2 border-dashed rounded-[3.5rem] p-16 transition-all duration-500 flex flex-col items-center justify-center group cursor-pointer
          ${isDraggingRoot ? 'border-blue-500 bg-blue-50/20 scale-[0.99]' : 'border-gray-200 bg-gray-50/10 hover:bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/10'}`}
      >
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple={multiple} accept={accept} onChange={handleInputChange} />
        <div className={`p-6 rounded-3xl transition-all duration-500 ${isDraggingRoot ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-white text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 shadow-sm'}`}>
          <Upload className="w-10 h-10" />
        </div>
        <h3 className="mt-8 text-2xl font-black text-gray-900 tracking-tight">Drop files or click to browse</h3>
        <p className="mt-2 text-gray-400 font-bold italic text-sm">Secure local processing</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-16 space-y-10 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-black text-gray-900 leading-none">{selectedFiles.length}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Documents</span>
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Ready to go</span>
                </div>
              </div>
              <button onClick={() => { setSelectedFiles([]); onFilesSelected([]); }} className="text-[9px] text-gray-400 hover:text-red-500 font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl border border-transparent hover:border-red-50 bg-gray-50 hover:bg-red-50">Clear All</button>
            </div>
            {actionButton}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {selectedFiles.map((file, idx) => (
              <FilePreviewCard 
                key={`${file.name}-${idx}`}
                file={file}
                index={idx}
                total={selectedFiles.length}
                onRemove={() => {
                  const updated = selectedFiles.filter((_, i) => i !== idx);
                  setSelectedFiles(updated);
                  onFilesSelected(updated);
                }}
                onMove={(dir) => {
                  const newFiles = [...selectedFiles];
                  const target = dir === 'up' ? idx - 1 : idx + 1;
                  [newFiles[idx], newFiles[target]] = [newFiles[target], newFiles[idx]];
                  setSelectedFiles(newFiles);
                  onFilesSelected(newFiles);
                }}
                onDragStart={(e, i) => { setDraggedIndex(i); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={handleItemDragOver}
                onDragEnd={() => setDraggedIndex(null)}
                onDrop={(e) => { e.preventDefault(); setDraggedIndex(null); }}
                isDraggingItem={draggedIndex === idx}
                showReorder={showReorder}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropzone;