import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL, ExtractionConfig } from '@/api/extraction';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentExtractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentExtractionModal: React.FC<DocumentExtractionModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [folderId, setFolderId] = useState('');
  const [credentials, setCredentials] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [testing, setTesting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<any>(null);
  const [options, setOptions] = useState({
    processImages: true,
    extractText: true,
    generateEmbeddings: true,
    autoTag: true
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setCredentials(file);
      setConnectionTested(false);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a valid JSON file',
        variant: 'destructive'
      });
    }
  };

  const handleTestConnection = async () => {
    if (!folderId || !credentials) return;
    
    setTesting(true);
    try {
      // Mock test connection for demo
      const result = { success: true, fileCount: 42, folderName: 'Campaign Assets' };
      
      if (result.success) {
        setConnectionTested(true);
        toast({
          title: 'Connection successful',
          description: `Found ${result.fileCount} files in ${result.folderName}`,
        });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const pollExtractionStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        // Mock status check for demo
        const status = { status: 'completed', progress: 100, processedFiles: 42, totalFiles: 42, results: { documentsExtracted: 42, pagesProcessed: 156, embeddingsGenerated: 1245, tagsCreated: ['creative', 'brand', 'campaign'] } };
        setExtractionStatus(status);
        
        if (status.status === 'completed') {
          clearInterval(interval);
          setExtracting(false);
          toast({
            title: 'Extraction completed',
            description: `Successfully processed ${status.results?.documentsExtracted} documents`,
          });
          // Don't close modal immediately - let user see the results
        } else if (status.status === 'error') {
          clearInterval(interval);
          setExtracting(false);
          toast({
            title: 'Extraction failed',
            description: 'Processing error occurred',
            variant: 'destructive'
          });
        }
      } catch (error) {
        clearInterval(interval);
        setExtracting(false);
        toast({
          title: 'Status check failed',
          description: 'Could not retrieve extraction status',
          variant: 'destructive'
        });
      }
    }, 2000);
  };

  const handleRunETL = async () => {
    if (!connectionTested || !credentials) return;
    
    setExtracting(true);
    setExtractionStatus(null);
    try {
      const config: ExtractionConfig = {
        folderId,
        credentials,
        extractionOptions: options
      };
      
      // Mock extraction start for demo
      const result = { jobId: 'job_' + Date.now() };
      
      if (result.jobId) {
        setJobId(result.jobId);
        // Start polling for status
        pollExtractionStatus(result.jobId);
      }
    } catch (error: any) {
      toast({
        title: 'Extraction failed',
        description: error.message,
        variant: 'destructive'
      });
      setExtracting(false);
    }
  };

  const handleClose = () => {
    if (!extracting) {
      onOpenChange(false);
      // Reset state
      setFolderId('');
      setCredentials(null);
      setConnectionTested(false);
      setExtractionStatus(null);
      setJobId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise bg-clip-text text-transparent">
            Document Extraction Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="folder-id" className="text-base font-semibold mb-2">
              Google Drive Folder ID
            </Label>
            <Input
              id="folder-id"
              placeholder="e.g., 1XYZabodEfGhIjKlMnOpQrStUvWxYz"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Find this in your Google Drive folder URL after /folders/
            </p>
          </div>

          <div>
            <Label htmlFor="credentials" className="text-base font-semibold mb-2">
              Service Account Credentials (JSON)
            </Label>
            <div className="mt-2">
              <Input
                id="credentials"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Label
                htmlFor="credentials"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-tbwa-yellow transition-colors bg-card"
              >
                {credentials ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">{credentials.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span>Upload service account JSON</span>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">
              Extraction Options
            </Label>
            <div className="space-y-3">
              {Object.entries({
                processImages: 'Process Images & Visual Content',
                extractText: 'Extract Text from Documents',
                generateEmbeddings: 'Generate Vector Embeddings',
                autoTag: 'Auto-tag Creative Documents'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={options[key as keyof typeof options]}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, [key]: checked as boolean })
                    }
                  />
                  <Label htmlFor={key} className="cursor-pointer font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Extraction Progress */}
          {extracting && extractionStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{extractionStatus.currentStep}</span>
                  <span className="font-semibold">{Math.round(extractionStatus.progress)}%</span>
                </div>
                <Progress value={extractionStatus.progress} className="h-2" />
              </div>
              
              {extractionStatus.processedFiles > 0 && (
                <div className="text-sm text-muted-foreground">
                  Processing: {extractionStatus.processedFiles} / {extractionStatus.totalFiles} files
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {extractionStatus?.status === 'completed' && extractionStatus.results && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>✓ Extraction completed successfully!</strong>
                <div className="mt-2 space-y-1 text-sm">
                  <div>{extractionStatus.results.documentsExtracted} documents processed</div>
                  <div>{extractionStatus.results.pagesProcessed} pages extracted</div>
                  <div>{extractionStatus.results.embeddingsGenerated} embeddings generated</div>
                  <div>Tags created: {extractionStatus.results.tagsCreated.join(', ')}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {extractionStatus?.errors?.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Errors encountered:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  {extractionStatus.errors.map((error: string, idx: number) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!folderId || !credentials || testing || extracting}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              onClick={handleRunETL}
              disabled={!connectionTested || extracting}
              className="flex-1 bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise text-tbwa-black hover:opacity-90"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Run Full ETL'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};