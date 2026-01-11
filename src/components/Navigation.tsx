import { Button } from "@/components/ui/button";
import { Brain, User, Search, Bell, Video, BarChart3 } from "lucide-react";
import { SettingsDropdown } from "./SettingsDropdown";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-nav-bg text-nav-text px-6 py-4 border-b border-tbwa-gray/20">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-tbwa-yellow" />
          <div>
            <h1 className="text-xl font-bold">Ask Ces</h1>
            <p className="text-xs text-tbwa-gray">TBWA\SMP</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link to="/video-analysis">
            <Button 
              variant={location.pathname === "/video-analysis" ? "default" : "ghost"} 
              className={location.pathname === "/video-analysis" ? "bg-tbwa-yellow text-tbwa-black" : "text-nav-text hover:text-nav-hover"}
            >
              <Video className="h-4 w-4 mr-2" />
              Video Analysis
            </Button>
          </Link>
          <Link to="/campaign-dashboard">
            <Button 
              variant={location.pathname.includes("dashboard") ? "default" : "ghost"} 
              className={location.pathname.includes("dashboard") ? "bg-tbwa-yellow text-tbwa-black" : "text-nav-text hover:text-nav-hover"}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tbwa-gray" />
            <input
              type="text"
              placeholder="Search insights, reports, or campaigns..."
              className="w-full pl-10 pr-4 py-2 bg-tbwa-gray/10 border border-tbwa-gray/20 rounded-lg text-nav-text placeholder-tbwa-gray focus:outline-none focus:border-tbwa-yellow focus:ring-1 focus:ring-tbwa-yellow"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-nav-text hover:text-nav-hover">
            <Bell className="h-5 w-5" />
          </Button>
          <SettingsDropdown />
          <Button variant="ghost" size="icon" className="text-nav-text hover:text-nav-hover">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;