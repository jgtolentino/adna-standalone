import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileText, Loader2, CheckCircle, AlertCircle, 
  BarChart, Brain, Target, Sparkles, TrendingUp, Award
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cesAPI, ExtractionResult, CESSummary } from '@/api/ces-backend';
import { DocumentCanvas } from './DocumentCanvas';

interface CESExtractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CESExtractionModal: React.FC<CESExtractionModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<string>('idle');
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedFeatures, setExtractedFeatures] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    setFiles(uploadedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const startExtraction = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setExtractionStatus('uploading');

    try {
      // Upload first file (extend to batch later)
      const file = files[0];
      const { doc_id, status } = await cesAPI.uploadDocument(file);
      
      setCurrentDocId(doc_id);
      setExtractionStatus('processing');
      
      // Simulate progress and feature extraction
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        setScanProgress(Math.floor(progress));
        
        // Add extracted features progressively
        if (progress > 30 && extractedFeatures.length < 3) {
          setExtractedFeatures(['Message Clarity', 'Brand Consistency', 'Call to Action']);
        }
        if (progress > 60 && extractedFeatures.length < 6) {
          setExtractedFeatures(prev => [...prev, 'Emotional Appeal', 'Visual Impact', 'ROI 3.2x']);
        }
        if (progress > 80 && extractedFeatures.length < 9) {
          setExtractedFeatures(prev => [...prev, 'Multi-platform', 'Cultural Relevance', 'Innovation']);
        }
        
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 500);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const docStatus = await cesAPI.getDocumentStatus(doc_id);
          
          if (docStatus.status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            setScanProgress(100);
            
            // Get full results
            const extractionResults = await cesAPI.getExtractionResults(doc_id);
            setResults(extractionResults);
            setExtractionStatus('completed');
            
            setTimeout(() => {
              setActiveTab('results');
              toast({
                title: 'Extraction completed!',
                description: `Successfully analyzed ${file.name}`,
              });
            }, 1000);
          } else if (docStatus.status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            setExtractionStatus('failed');
            throw new Error('Extraction failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          clearInterval(progressInterval);
          setExtractionStatus('failed');
          console.error('Polling error:', error);
        }
      }, 2000);
      
    } catch (error) {
      toast({
        title: 'Extraction failed',
        description: error.message,
        variant: 'destructive'
      });
      setExtractionStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const renderCESScore = (score: number, label: string) => {
    const getScoreColor = (score: number) => {
      if (score >= 8) return 'text-green-600';
      if (score >= 6) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise bg-clip-text text-transparent">
            Creative Effectiveness Analysis
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="processing" disabled={!processing && !results}>
              Processing
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-tbwa-yellow transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Drop campaign documents here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Support for PDF, DOCX, PPTX, images
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload">Browse Files</label>
              </Button>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files</h4>
                {files.map((file, index) => (
                  <Card key={index} className="p-3 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Extraction Options */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-3">What LayoutMind will extract:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-tbwa-yellow" />
                  <span className="text-sm">Creative Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-tbwa-turquoise" />
                  <span className="text-sm">Business Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Campaign KPIs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">CES Score</span>
                </div>
              </div>
            </Card>

            <Button
              onClick={startExtraction}
              disabled={files.length === 0 || processing}
              className="w-full bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise text-tbwa-black hover:opacity-90"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Analysis'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {/* Document Canvas Visualization */}
            <DocumentCanvas
              file={files[0]}
              isScanning={processing}
              scanProgress={scanProgress}
              extractedFeatures={extractedFeatures}
              onScanComplete={() => {
                console.log('Scan complete');
              }}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {results && (
              <>
                {/* CES Score Summary */}
                <Card className="p-6 bg-gradient-to-r from-tbwa-yellow/10 to-tbwa-turquoise/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Creative Effectiveness Score
                    </h3>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {results.summary.overall_ces_score >= 8 ? 'Excellent' :
                       results.summary.overall_ces_score >= 6 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {renderCESScore(results.summary.overall_ces_score, 'Overall CES')}
                    {renderCESScore(results.summary.message_clarity_score, 'Message Clarity')}
                    {renderCESScore(results.summary.emotional_impact_score, 'Emotional Impact')}
                    {renderCESScore(results.summary.creative_strength_index, 'Creative Strength')}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Award Likelihood</p>
                      <Progress value={results.summary.award_likelihood * 100} className="w-32 mt-1" />
                    </div>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Benchmarks
                    </Button>
                  </div>
                </Card>

                {/* Creative Features */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-tbwa-yellow" />
                    Creative Features Detected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.creative_features.slice(0, 10).map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature.feature_label}
                        <span className="ml-1 text-xs opacity-60">
                          {(feature.confidence * 100).toFixed(0)}%
                        </span>
                      </Badge>
                    ))}
                    {results.creative_features.length > 10 && (
                      <Badge variant="outline">
                        +{results.creative_features.length - 10} more
                      </Badge>
                    )}
                  </div>
                </Card>

                {/* Business Metrics */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-tbwa-turquoise" />
                    Business Metrics Extracted
                  </h4>
                  <div className="space-y-2">
                    {results.business_metrics.slice(0, 5).map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric_type}</span>
                        <Badge variant="outline">
                          {metric.metric_value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline">
                    Export Report
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise text-tbwa-black">
                    Save to Workspace
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for processing steps
const ProcessingStep: React.FC<{
  completed: boolean;
  active: boolean;
  label: string;
}> = ({ completed, active, label }) => (
  <div className="flex items-center gap-3">
    {completed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : active ? (
      <Loader2 className="w-5 h-5 animate-spin text-tbwa-yellow" />
    ) : (
      <div className="w-5 h-5 rounded-full border-2 border-muted" />
    )}
    <span className={completed ? 'text-muted-foreground' : active ? 'font-medium' : ''}>
      {label}
    </span>
  </div>
);