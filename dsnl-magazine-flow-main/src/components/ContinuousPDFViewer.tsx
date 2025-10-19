import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Maximize2, Minimize2, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../styles/pdf-viewer.css';

// Set up PDF.js worker
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
} catch (error) {
  console.error('Failed to set PDF.js worker:', error);
  // Fallback worker source
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface ContinuousPDFViewerProps {
  fileUrl: string;
  fileName: string;
  title: string;
}

const ContinuousPDFViewer: React.FC<ContinuousPDFViewerProps> = ({ fileUrl, fileName, title }) => {
  console.log('ContinuousPDFViewer mounted with URL:', fileUrl);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(1400);
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    
    // Set page width based on container - make it much larger
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setPageWidth(Math.max(containerWidth - 10, 1400)); // Minimum 1400px width, nearly full container width
      console.log('Set page width to:', Math.max(containerWidth - 10, 1400));
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    console.error('PDF URL:', fileUrl);
    setLoading(false);
    setError(`Failed to load PDF document: ${error.message}`);
    setShowFallback(true);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  // Update page width on window resize and initial mount
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setPageWidth(Math.max(containerWidth - 10, 1400)); // Minimum 1400px width, nearly full container width
      }
    };

    // Set initial size
    setTimeout(handleResize, 100); // Small delay to ensure container is rendered
    
    // Force fallback after 1 second if react-pdf hasn't loaded
    const fallbackTimer = setTimeout(() => {
      if (loading && !error && numPages === 0) {
        console.log('React-PDF taking too long, using fallback');
        setLoading(false);
        setShowFallback(true);
      }
    }, 1000);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(fallbackTimer);
    };
  }, [loading, error, numPages]);

  // Show fallback PDF viewer without toolbars if react-pdf fails or takes too long
  if (error || showFallback) {
    return (
      <div className={`pdf-viewer-container w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`} style={{
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Toolbar Overlay - Covers any native PDF toolbar */}
        <div 
          className="absolute top-0 left-0 right-0 h-12 bg-white z-50"
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Custom Toolbar */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {fileName}
            </h3>
            <span className="text-xs text-gray-500">PDF Document</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="h-8 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open
            </Button>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 p-0 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              title="Download PDF"
            >
              <Download className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* PDF Content with Hidden Toolbar */}
        <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : '100vh' }}>
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              backgroundColor: 'white',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
            title={title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`} style={{
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Toolbar Overlay - Covers any native PDF toolbar */}
      <div 
        className="absolute top-0 left-0 right-0 h-12 bg-white z-50"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {fileName}
          </h3>
          {numPages > 0 && (
            <span className="text-xs text-gray-500">
              {numPages} pages
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            className="h-8 px-2 text-xs"
          >
            <ZoomOut className="w-3 h-3 mr-1" />
            {zoom}%
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            className="h-8 px-2 text-xs"
          >
            <ZoomIn className="w-3 h-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="h-8 px-2 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 w-8 p-0 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* PDF Content - All Pages in Continuous Scroll */}
      <div 
        ref={containerRef} 
        className={`relative bg-white ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
        style={{ minHeight: '100vh' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading PDF pages...</p>
            </div>
          </div>
        )}
        
        <div 
          className="pdf-pages-container flex flex-col items-center py-2"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: '100%'
          }}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Loading document...</p>
                </div>
              </div>
            }
          >
            {/* Render all pages */}
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="mb-1 shadow-md w-full max-w-none">
                <Page
                  pageNumber={index + 1}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  loading={
                    <div className="flex items-center justify-center h-32 bg-white border rounded">
                      <div className="text-center">
                        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Page {index + 1}</p>
                      </div>
                    </div>
                  }
                />
                {/* Page number indicator - smaller and less prominent */}
                <div className="text-center py-1 text-xs text-gray-400 bg-gray-50">
                  Page {index + 1} of {numPages}
                </div>
              </div>
            ))}
          </Document>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 sticky bottom-0">
        <span>PDF Document - Continuous View</span>
        <div className="flex items-center space-x-2">
          <span>Zoom: {zoom}%</span>
          <span>•</span>
          <span>{numPages} pages</span>
          <span>•</span>
          <button
            onClick={() => setZoom(100)}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Reset Zoom
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinuousPDFViewer;