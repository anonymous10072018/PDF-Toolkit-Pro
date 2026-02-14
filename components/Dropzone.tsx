
import React, { useCallback, useState } from 'react';
import { Upload, X, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  actionButton?: React.ReactNode;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, accept = "*", multiple = true, actionButton }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    if (accept === "*") return files;

    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const validFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      return acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });
    });

    if (validFiles.length < files.length) {
      setError(`Some files were ignored. Only ${accept.replace(/application\//g, '').replace(/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/g, 'DOCX')} files are allowed.`);
      setTimeout(() => setError(null), 5000);
    }

    return validFiles;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    const validFiles = validateFiles(droppedFiles);
    
    if (validFiles.length > 0) {
      const finalFiles = multiple ? [...selectedFiles, ...validFiles] : [validFiles[0]];
      setSelectedFiles(finalFiles);
      onFilesSelected(finalFiles);
    }
  }, [onFilesSelected, multiple, selectedFiles, accept]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(e.target.files || []) as File[];
    const validFiles = validateFiles(chosenFiles);
    
    if (validFiles.length > 0) {
      const finalFiles = multiple ? [...selectedFiles, ...validFiles] : [validFiles[0]];
      setSelectedFiles(finalFiles);
      onFilesSelected(finalFiles);
    }
    e.target.value = '';
  }, [onFilesSelected, multiple, selectedFiles, accept]);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center group cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300'}`}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
        />
        
        <div className={`p-4 rounded-2xl transition-all duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
          <Upload className="w-10 h-10" />
        </div>
        
        <h3 className="mt-6 text-xl font-bold text-gray-900">Choose files or drag them here</h3>
        <p className="mt-2 text-gray-500 text-sm italic">
          {accept === "*" ? "Unlimited file size for all users" : `Accepted format: ${accept.split(',')[0].replace('application/', '').toUpperCase()}`}
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50">
            <div className="flex flex-col">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Queue Overview</h4>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-black text-gray-900">Selected Files ({selectedFiles.length})</span>
                <button onClick={() => { setSelectedFiles([]); onFilesSelected([]); }} className="text-[10px] text-red-500 hover:text-red-600 font-black uppercase tracking-widest transition-colors hover:underline">Clear All</button>
              </div>
            </div>
            
            <div className="flex items-center">
              {actionButton}
            </div>
          </div>

          <div className="space-y-3">
            {selectedFiles.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center space-x-3 truncate">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
