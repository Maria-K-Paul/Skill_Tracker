import { useAuth } from "../../hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground capitalize">
          {user?.role.replace('_', ' ')} Portal
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
