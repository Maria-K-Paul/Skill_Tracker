import { useAuth } from "../../hooks/useAuth";
import { LogOut, User as UserIcon, Menu, Search, PlayCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";

export function Topbar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (v: boolean) => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[56px] items-center justify-between bg-background px-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="rounded-full w-10 h-10 hover:bg-[#F2F2F2]">
          <Menu className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center space-x-1 cursor-pointer">
          <PlayCircle className="h-7 w-7 text-accent fill-accent" />
          <span className="text-xl font-bold tracking-tight text-primary">SkillTrack</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-2xl px-12">
        <div className="relative flex items-center w-full h-10 border border-border rounded-full overflow-hidden focus-within:border-primary focus-within:ml-0 bg-background">
          <div className="pl-4 pr-2">
            <Search className="h-5 w-5 text-muted" />
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            className="flex-1 h-full bg-transparent outline-none text-primary placeholder:text-muted" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full w-10 h-10 hover:bg-[#F2F2F2]" title="Log out">
          <LogOut className="h-5 w-5 text-primary" />
        </Button>
      </div>
    </header>
  );
}
