import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Image, FileSpreadsheet, FileCode, 
  Scan, Brain, Sparkles, CheckCircle2, Loader2 
} from 'lucide-react';

interface DocumentCanvasProps {
  file: File | null;
  isScanning: boolean;
  scanProgress: number;
  extractedFeatures?: string[];
  onScanComplete?: () => void;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  file,
  isScanning,
  scanProgress,
  extractedFeatures = [],
  onScanComplete
}) => {
  const [scanLines, setScanLines] = useState<number[]>([]);
  const [highlightedAreas, setHighlightedAreas] = useState<any[]>([]);
  const [currentPhase, setCurrentPhase] = useState<'scanning' | 'analyzing' | 'extracting' | 'complete'>('scanning');

  useEffect(() => {
    if (isScanning) {
      // Generate scan lines animation
      const interval = setInterval(() => {
        setScanLines(prev => [...prev, Date.now()]);
      }, 300);

      // Update phase based on progress
      if (scanProgress < 30) {
        setCurrentPhase('scanning');
      } else if (scanProgress < 60) {
        setCurrentPhase('analyzing');
      } else if (scanProgress < 90) {
        setCurrentPhase('extracting');
      } else {
        setCurrentPhase('complete');
        onScanComplete?.();
      }

      return () => clearInterval(interval);
    }
  }, [isScanning, scanProgress, onScanComplete]);

  // Generate random highlight areas to simulate feature detection
  useEffect(() => {
    if (currentPhase === 'analyzing' && highlightedAreas.length < 5) {
      const timer = setTimeout(() => {
        setHighlightedAreas(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          width: Math.random() * 100 + 50,
          height: Math.random() * 30 + 20,
          type: ['text', 'metric', 'feature', 'image'][Math.floor(Math.random() * 4)]
        }]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, highlightedAreas]);

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image;
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('code')) return FileCode;
    return FileText;
  };

  const FileIcon = file ? getFileIcon(file.type) : FileText;

  return (
    <Card className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Document Preview Area */}
      <div className="absolute inset-4 bg-white dark:bg-gray-950 rounded-lg shadow-inner overflow-hidden">
        {/* File Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <FileIcon className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{file?.name || 'Document'}</span>
            <Badge variant="secondary" className="text-xs">
              {file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}
            </Badge>
          </div>
          <AnimatePresence mode="wait">
            {currentPhase === 'scanning' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-blue-600"
              >
                <Scan className="w-4 h-4 animate-pulse" />
                Scanning document...
              </motion.div>
            )}
            {currentPhase === 'analyzing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-yellow-600"
              >
                <Brain className="w-4 h-4 animate-pulse" />
                Analyzing content...
              </motion.div>
            )}
            {currentPhase === 'extracting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-purple-600"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Extracting insights...
              </motion.div>
            )}
            {currentPhase === 'complete' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-green-600"
              >
                <CheckCircle2 className="w-4 h-4" />
                Analysis complete
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Document Content Area */}
        <div className="relative p-8 h-full">
          {/* Mock document lines */}
          <div className="space-y-3">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="h-2 bg-gray-200 dark:bg-gray-700 rounded"
                style={{
                  width: `${Math.random() * 40 + 60}%`,
                  opacity: isScanning ? 0.3 : 0.2
                }}
              />
            ))}
          </div>

          {/* Scan Lines Animation */}
          <AnimatePresence>
            {isScanning && scanLines.slice(-3).map((line, index) => (
              <motion.div
                key={line}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                initial={{ top: 0, opacity: 0 }}
                animate={{ 
                  top: '100%', 
                  opacity: [0, 1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: 'linear' }}
              />
            ))}
          </AnimatePresence>

          {/* Highlighted Areas for Feature Detection */}
          <AnimatePresence>
            {highlightedAreas.map((area) => (
              <motion.div
                key={area.id}
                className="absolute border-2 rounded"
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.width}px`,
                  height: `${area.height}px`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`
                  w-full h-full rounded
                  ${area.type === 'text' && 'border-blue-500 bg-blue-500/10'}
                  ${area.type === 'metric' && 'border-green-500 bg-green-500/10'}
                  ${area.type === 'feature' && 'border-purple-500 bg-purple-500/10'}
                  ${area.type === 'image' && 'border-yellow-500 bg-yellow-500/10'}
                `} />
                <motion.div
                  className={`
                    absolute -top-6 left-0 text-xs px-2 py-1 rounded
                    ${area.type === 'text' && 'bg-blue-500 text-white'}
                    ${area.type === 'metric' && 'bg-green-500 text-white'}
                    ${area.type === 'feature' && 'bg-purple-500 text-white'}
                    ${area.type === 'image' && 'bg-yellow-500 text-white'}
                  `}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {area.type === 'text' && 'Key Message'}
                  {area.type === 'metric' && 'ROI: 3.2x'}
                  {area.type === 'feature' && 'Emotional Appeal'}
                  {area.type === 'image' && 'Visual Asset'}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Grid Overlay */}
          {isScanning && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(59, 130, 246, 0.1) 20px, rgba(59, 130, 246, 0.1) 21px),
                    repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(59, 130, 246, 0.1) 20px, rgba(59, 130, 246, 0.1) 21px)
                  `
                }}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {isScanning && (
        <motion.div
          className="absolute bottom-4 left-4 right-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Analysis Progress</span>
              <span className="text-sm text-muted-foreground">{scanProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Extracted Features Preview */}
            {extractedFeatures.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {extractedFeatures.slice(0, 4).map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  </motion.div>
                ))}
                {extractedFeatures.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{extractedFeatures.length - 4} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
};