declare module 'react-pdf' {
  import { ComponentType } from 'react';

  interface DocumentProps {
    file: string | ArrayBuffer | Uint8Array;
    onLoadSuccess?: ({ numPages }: { numPages: number }) => void;
    onLoadError?: (error: any) => void;
    loading?: React.ReactNode;
    children?: React.ReactNode;
  }

  interface PageProps {
    pageNumber: number;
    scale?: number;
    rotate?: number;
    width?: number;
    height?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
    className?: string;
    loading?: React.ReactNode;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  export const pdfjs: {
    version: string;
    GlobalWorkerOptions: {
      workerSrc: string;
    };
  };
}

declare module 'react-pdf/dist/Page/AnnotationLayer.css';
declare module 'react-pdf/dist/Page/TextLayer.css';
declare module 'react-pdf/dist/esm/Page/AnnotationLayer.css';
declare module 'react-pdf/dist/esm/Page/TextLayer.css';
