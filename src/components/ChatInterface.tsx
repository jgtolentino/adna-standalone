import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Mic, Paperclip, Sparkles } from "lucide-react";
import { DocumentExtractionModal } from "./DocumentExtractionModal";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [showDocumentExtraction, setShowDocumentExtraction] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      // Handle send logic here
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* AI Welcome Message */}
        <Card className="p-4 max-w-3xl">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-tbwa-black" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Ask Ces</h3>
              <p className="text-muted-foreground">
                Welcome to Ask Ces! I'm here to help you analyze campaigns, generate insights, 
                and unlock creative intelligence. What would you like to explore today?
              </p>
            </div>
          </div>
        </Card>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2 max-w-3xl">
          <Button variant="tbwa-outline" size="sm">
            Analyze campaign performance
          </Button>
          <Button variant="tbwa-outline" size="sm">
            Generate creative brief
          </Button>
          <Button variant="tbwa-outline" size="sm">
            Market research insights
          </Button>
          <Button variant="tbwa-outline" size="sm">
            Competitor analysis
          </Button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end space-x-2 bg-chat-bg rounded-2xl p-4 chat-glow">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask Ces anything..."
                  className="w-full bg-transparent text-chat-text placeholder-tbwa-gray resize-none outline-none min-h-[2.5rem] max-h-32"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-chat-text hover:text-chat-border"
                  onClick={() => setShowDocumentExtraction(true)}
                  title="Analyze Campaign Effectiveness"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-chat-text hover:text-chat-border">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  variant="tbwa" 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Extraction Modal */}
      <DocumentExtractionModal
        open={showDocumentExtraction}
        onOpenChange={setShowDocumentExtraction}
      />
    </div>
  );
};

export default ChatInterface;