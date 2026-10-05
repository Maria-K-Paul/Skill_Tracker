import { useAuth } from "../../hooks/useAuth";
import { LogOut, User as UserIcon, Menu, Search, Hexagon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";

import { cn } from "../../lib/utils";

export function Topbar({ isCollapsed, setIsCollapsed, scrolled = false }: { isCollapsed: boolean, setIsCollapsed: (v: boolean) => void, scrolled?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 px-4",
      scrolled 
        ? "h-[56px] bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm" 
        : "h-[64px] bg-background border-b border-transparent"
    )}>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="rounded-full w-10 h-10 hover:bg-secondary/10 transition-colors">
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
        <div className="flex items-center space-x-2 cursor-pointer group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <Hexagon className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">SkillTrack</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-xl px-8 hidden md:block">
        <div className="relative flex items-center w-full h-10 border border-border rounded-full overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-background/50 transition-all duration-200">
          <div className="pl-4 pr-2">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            placeholder="Search resources, students, or tracks..." 
            className="flex-1 h-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground leading-none">{user?.name || "User"}</span>
            <span className="text-xs text-muted-foreground capitalize mt-1">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-colors cursor-pointer">
            {user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
          </div>
        </div>
        <div className="h-6 w-px bg-border mx-1"></div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full w-10 h-10 hover:bg-destructive/10 hover:text-destructive transition-colors" title="Log out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
