import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoDataDisplayProps {
  title?: string;
  message?: string;
  error?: string | null;
  onRetry?: () => void;
  showRetry?: boolean;
  fullHeight?: boolean;
}

export const NoDataDisplay = ({
  title = "No Data Available",
  message = "No data is currently available. Please check back later.",
  error = null,
  onRetry,
  showRetry = true,
  fullHeight = true
}: NoDataDisplayProps) => {
  const containerClass = fullHeight ? "h-64" : "h-48";
  
  return (
    <div className={`flex items-center justify-center ${containerClass}`}>
      <div className="text-center max-w-md">
        {error ? (
          <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        ) : (
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        )}
        
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        
        <p className="text-gray-500 mb-4">
          {error || message}
        </p>
        
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
        
        {error && (
          <p className="text-xs text-gray-400 mt-4">
            Backend connection required. Please ensure the backend service is running.
          </p>
        )}
      </div>
    </div>
  );
};

export default NoDataDisplay;