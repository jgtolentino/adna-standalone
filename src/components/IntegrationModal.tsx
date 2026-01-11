import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IntegrationHub } from './IntegrationHub';

interface IntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise bg-clip-text text-transparent">
            Connect Your Tools
          </DialogTitle>
        </DialogHeader>
        <IntegrationHub onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};