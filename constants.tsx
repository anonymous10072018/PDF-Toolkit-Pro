
import React from 'react';
import { 
  FileImage, 
  Files, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  FileText, 
  FileOutput,
  BookOpen,
  FileSpreadsheet,
  FileImageIcon,
  Stamp,
  ImagePlus,
  Lock,
  Bell,
  MessageSquarePlus,
  ArrowDownUp
} from 'lucide-react';
import { PDFTool } from './types';

export const API_BASE_URL = 'https://possysstemapi.runasp.net/api/ImagetoPdfConversion';

/**
 * Secured Client Key for API Authorization. 
 * Note: In a production environment, sensitive keys should be managed via environment 
 * variables or a secure vault.
 */
export const CLIENT_KEY = '72f8a1c4-9b2e-4d5a-8f3c-1a2b3c4d5e6f';

export const API_ENDPOINTS = {
  IMG_TO_PDF: `${API_BASE_URL}/ConvertImagesToPdf`,
  MERGE_PDF: `${API_BASE_URL}/MergePdf`,
  COMPRESS_PDF: `${API_BASE_URL}/CompressPdf`,
  PDF_TO_WORD: `${API_BASE_URL}/PdfToWord`,
  WORD_TO_PDF: `${API_BASE_URL}/WordToPdf`,
  SPLIT_PDF_RANGE: `${API_BASE_URL}/SplitPdfRange`,
  SPLIT_PDF: `${API_BASE_URL}/SplitPdf`,
  PDF_TO_IMG: `${API_BASE_URL}/PdfToImages`,
  BOOKLET_PDF: `${API_BASE_URL}/PdfToBooklet`,
  EXCEL_TO_PDF: `${API_BASE_URL}/ExcelToPdf`,
  WORD_TO_IMAGES: `${API_BASE_URL}/WordToImages`,
  ADD_WATERMARK: `${API_BASE_URL}/AddWatermark`,
  ADD_IMAGE_WATERMARK: `${API_BASE_URL}/AddImageWatermark`,
  ENCRYPT_PDF: `${API_BASE_URL}/EncryptPdf`,
  ADD_DYNAMIC_ALERT: `${API_BASE_URL}/AddDynamicAlert`,
  ADD_ADVANCED_ANNOTATION: `${API_BASE_URL}/AddAdvancedAnnotation`,
  REARRANGE_PDF: `${API_BASE_URL}/RearrangePdfPages`,
  EXTRACT_IMAGES: `${API_BASE_URL}/ExtractImages`,
};

export const TOOLS: (PDFTool & { titleKey: string; descKey: string })[] = [
  {
    id: 'extract-images',
    title: 'Extract Images from URL',
    titleKey: 'extractImages',
    description: 'Download all images from any website URL as a ZIP file.',
    descKey: 'extractImagesDesc',
    icon: <ImagePlus className="w-8 h-8" />,
    color: 'bg-violet-600'
  },
  {
    id: 'img-to-pdf',
    title: 'Images to PDF',
    titleKey: 'imgToPdf',
    description: 'Convert JPG, PNG, and more into a professional PDF document.',
    descKey: 'imgToPdfDesc',
    icon: <FileImage className="w-8 h-8" />,
    color: 'bg-blue-500'
  },
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    titleKey: 'mergePdf',
    description: 'Combine multiple PDF files into one single document effortlessly.',
    descKey: 'mergePdfDesc',
    icon: <Files className="w-8 h-8" />,
    color: 'bg-indigo-500'
  },
  {
    id: 'rearrange-pdf',
    title: 'Rearrange Pages',
    titleKey: 'rearrangePdf',
    description: 'Change the order of pages in your PDF file visually.',
    descKey: 'rearrangePdfDesc',
    icon: <ArrowDownUp className="w-8 h-8" />,
    color: 'bg-cyan-500'
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    titleKey: 'splitPdf',
    description: 'Extract pages from your PDF or save each page as a separate file.',
    descKey: 'splitPdfDesc',
    icon: <Scissors className="w-8 h-8" />,
    color: 'bg-purple-500'
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    titleKey: 'compressPdf',
    description: 'Reduce the file size of your PDF while maintaining quality.',
    descKey: 'compressPdfDesc',
    icon: <Minimize2 className="w-8 h-8" />,
    color: 'bg-green-500'
  },
  {
    id: 'add-advanced-annotation',
    title: 'Advanced Annotation',
    titleKey: 'addAdvancedAnnotation',
    description: 'Add shaped notes with custom colors and choose between square or circle.',
    descKey: 'addAdvancedAnnotationDesc',
    icon: <MessageSquarePlus className="w-8 h-8" />,
    color: 'bg-orange-600'
  },
  {
    id: 'encrypt-pdf',
    title: 'Encrypt PDF',
    titleKey: 'encryptPdf',
    description: 'Secure your PDF with a password using enterprise-grade encryption.',
    descKey: 'encryptPdfDesc',
    icon: <Lock className="w-8 h-8" />,
    color: 'bg-slate-700'
  },
  {
    id: 'add-dynamic-alert',
    title: 'Add Alert',
    titleKey: 'addDynamicAlert',
    description: 'Embed a popup message that triggers when the PDF is opened.',
    descKey: 'addDynamicAlertDesc',
    icon: <Bell className="w-8 h-8" />,
    color: 'bg-indigo-600'
  },
  {
    id: 'add-watermark',
    title: 'Add Watermark',
    titleKey: 'addWatermark',
    description: 'Apply text watermarks to all pages of your PDF document.',
    descKey: 'addWatermarkDesc',
    icon: <Stamp className="w-8 h-8" />,
    color: 'bg-rose-500'
  },
  {
    id: 'add-image-watermark',
    title: 'Image Watermark',
    titleKey: 'addImageWatermark',
    description: 'Overlay an image as a transparent watermark on your PDF pages.',
    descKey: 'addImageWatermarkDesc',
    icon: <ImagePlus className="w-8 h-8" />,
    color: 'bg-amber-500'
  },
  {
    id: 'booklet-pdf',
    title: 'PDF to Booklet',
    titleKey: 'bookletPdf',
    description: 'Reorder pages automatically for professional booklet printing.',
    descKey: 'bookletPdfDesc',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'bg-teal-500'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    titleKey: 'excelToPdf',
    description: 'Convert Excel spreadsheets into professional PDF documents.',
    descKey: 'excelToPdfDesc',
    icon: <FileSpreadsheet className="w-8 h-8" />,
    color: 'bg-green-600'
  },
  {
    id: 'pdf-to-img',
    title: 'PDF to Images',
    titleKey: 'pdfToImg',
    description: 'Convert PDF pages into high-quality JPG or PNG images.',
    descKey: 'pdfToImgDesc',
    icon: <ImageIcon className="w-8 h-8" />,
    color: 'bg-orange-500'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    titleKey: 'pdfToWord',
    description: 'Transform your PDFs into editable Microsoft Word documents.',
    descKey: 'pdfToWordDesc',
    icon: <FileText className="w-8 h-8" />,
    color: 'bg-sky-600'
  },
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    titleKey: 'wordToPdf',
    description: 'Convert Microsoft Word files into standard PDF documents.',
    descKey: 'wordToPdfDesc',
    icon: <FileOutput className="w-8 h-8" />,
    color: 'bg-blue-600'
  },
  {
    id: 'word-to-images',
    title: 'Word to Images',
    titleKey: 'wordToImages',
    description: 'Convert Microsoft Word pages into high-quality images.',
    descKey: 'wordToImagesDesc',
    icon: <FileImageIcon className="w-8 h-8" />,
    color: 'bg-pink-500'
  }
];
