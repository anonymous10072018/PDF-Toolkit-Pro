
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
  FileImageIcon
} from 'lucide-react';
import { PDFTool } from './types';

export const API_BASE_URL = 'https://possysstemapi.runasp.net/api/ImagetoPdfConversion';

export const API_ENDPOINTS = {
  IMG_TO_PDF: `${API_BASE_URL}/ConvertImagesToPdf`,
  MERGE_PDF: `${API_BASE_URL}/MergePdf`,
  COMPRESS_PDF: `${API_BASE_URL}/CompressPdf`,
  PDF_TO_WORD: `${API_BASE_URL}/PdfToWord`,
  WORD_TO_PDF: `${API_BASE_URL}/WordToPdf`,
  SPLIT_PDF_RANGE: `${API_BASE_URL}/SplitPdfRange`,
  SPLIT_PDF: `${API_BASE_URL}/SplitPdf`,
  PDF_TO_BOOKLET: `${API_BASE_URL}/PdfToBooklet`,
  EXCEL_TO_PDF: `${API_BASE_URL}/ExcelToPdf`,
  WORD_TO_IMAGES: `${API_BASE_URL}/WordToImages`,
};

export const TOOLS: (PDFTool & { titleKey: string; descKey: string })[] = [
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
