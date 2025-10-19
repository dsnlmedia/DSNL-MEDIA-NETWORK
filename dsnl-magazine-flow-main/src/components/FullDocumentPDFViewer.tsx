import React, { useState, useEffect, useRef } from 'react';
import { Download, Maximize2, Minimize2, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullDocumentPDFViewerProps {
  fileUrl: string;
  fileName: string;
  title: string;
}

const FullDocumentPDFViewer: React.FC<FullDocumentPDFViewerProps> = ({ fileUrl, fileName, title }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [documentHeight, setDocumentHeight] = useState<number>(1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
    
    // Attempt to calculate better document height
    setTimeout(() => {
      // Use a reasonable height for PDFs - this will show the full document
      // and allow natural scrolling
      if (!isFullscreen) {
        setDocumentHeight(Math.max(window.innerHeight * 1.2, 1200));
      }
    }, 500);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF document');
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

  useEffect(() => {
    console.log('PDF Viewer initialized with URL:', fileUrl);
    
    // Set a timeout to handle cases where onLoad doesn't fire
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        handleLoad();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [fileUrl, loading]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {fileName}
          </h3>
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

      {/* PDF Content with Full Document Display */}
      <div ref={containerRef} className="relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
        
        <div 
          className="pdf-document-container"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: zoom !== 100 ? `${100 / (zoom / 100)}%` : '100%',
            height: isFullscreen ? '100vh' : 'auto',
            overflow: isFullscreen ? 'auto' : 'visible'
          }}
        >
          <object
            ref={embedRef}
            data={`${fileUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            width="100%"
            height={isFullscreen ? '100%' : `${documentHeight}px`}
            style={{
              border: 'none',
              display: 'block',
              minHeight: '800px'
            }}
            onLoad={handleLoad}
            onError={handleError}
          >
            {/* Fallback for browsers that don't support object tag */}
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              width="100%"
              height={isFullscreen ? '100%' : `${documentHeight}px`}
              style={{
                border: 'none',
                display: 'block',
                minHeight: '800px'
              }}
              title={title}
              onLoad={handleLoad}
              onError={handleError}
            />
          </object>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 sticky bottom-0">
        <span>PDF Document - Full View</span>
        <div className="flex items-center space-x-2">
          <span>Zoom: {zoom}%</span>
          <span>•</span>
          <button
            onClick={() => setZoom(100)}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullDocumentPDFViewer;