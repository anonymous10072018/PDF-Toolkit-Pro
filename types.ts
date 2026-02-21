
// Fix: Import React to resolve 'Cannot find namespace React' when using React.ReactNode
import React from 'react';

export type ToolType = 
  | 'img-to-pdf' 
  | 'merge-pdf' 
  | 'split-pdf' 
  | 'compress-pdf' 
  | 'pdf-to-img' 
  | 'pdf-to-word' 
  | 'word-to-pdf'
  | 'booklet-pdf'
  | 'excel-to-pdf'
  | 'word-to-images'
  | 'add-watermark'
  | 'add-image-watermark'
  | 'encrypt-pdf'
  | 'add-dynamic-alert'
  | 'add-advanced-annotation'
  | 'rearrange-pdf'
  | 'extract-images';

export interface PDFTool {
  id: ToolType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
  downloadUrl?: string;
  previewUrl?: string;
  previewGallery?: string[];
  originalSize?: number;
  compressedSize?: number;
  resultType?: 'pdf' | 'zip' | 'json' | 'word';
}
