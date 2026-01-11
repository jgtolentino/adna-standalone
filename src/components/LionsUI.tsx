import Navigation from "./Navigation";
import ChatInterface from "./ChatInterface";
import InsightCards from "./InsightCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3, Lightbulb, Users } from "lucide-react";

const LionsUI = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-16 bg-nav-bg border-r border-tbwa-gray/20 flex flex-col items-center py-4 space-y-4">
          <div className="p-2 rounded-lg bg-tbwa-yellow/10">
            <MessageSquare className="h-5 w-5 text-tbwa-yellow" />
          </div>
          <div className="p-2 rounded-lg hover:bg-tbwa-gray/10 cursor-pointer transition-colors">
            <BarChart3 className="h-5 w-5 text-tbwa-gray" />
          </div>
          <div className="p-2 rounded-lg hover:bg-tbwa-gray/10 cursor-pointer transition-colors">
            <Lightbulb className="h-5 w-5 text-tbwa-gray" />
          </div>
          <div className="p-2 rounded-lg hover:bg-tbwa-gray/10 cursor-pointer transition-colors">
            <Users className="h-5 w-5 text-tbwa-gray" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="chat" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-tbwa-yellow data-[state=active]:bg-transparent px-6 py-3"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-tbwa-yellow data-[state=active]:bg-transparent px-6 py-3"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger 
                value="creative" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-tbwa-yellow data-[state=active]:bg-transparent px-6 py-3"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Creative
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-tbwa-yellow data-[state=active]:bg-transparent px-6 py-3"
              >
                <Users className="h-4 w-4 mr-2" />
                Audience
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <ChatInterface />
            </TabsContent>
            
            <TabsContent value="insights" className="flex-1 mt-0">
              <InsightCards />
            </TabsContent>
            
            <TabsContent value="creative" className="flex-1 p-6 mt-0">
              <div className="max-w-4xl mx-auto text-center py-20">
                <Lightbulb className="h-16 w-16 text-tbwa-yellow mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Creative Intelligence</h2>
                <p className="text-muted-foreground">AI-powered creative tools and insights coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="audience" className="flex-1 p-6 mt-0">
              <div className="max-w-4xl mx-auto text-center py-20">
                <Users className="h-16 w-16 text-tbwa-turquoise mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Audience Intelligence</h2>
                <p className="text-muted-foreground">Deep audience analysis and segmentation tools</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LionsUI;