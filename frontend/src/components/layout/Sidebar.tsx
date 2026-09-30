import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, BookOpen, Clock, Award,
  Users, Key, Activity, Settings, List, Shield, UserPlus,
  Calendar, FileText, Target, BarChart2, UserX
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Sidebar({ isCollapsed }: { isCollapsed?: boolean }) {
  const { user } = useAuth();
  
  const studentLinks = [
    { to: "/student/dashboard", icon: LayoutDashboard, label: "My Tracks" },
    ...(user?.domain ? [{ to: "/student/roadmap", icon: Target, label: "Level Roadmap" }] : []),
    { to: "/student/upcoming-test", icon: Calendar, label: "Book Exam" },
    { to: "/student/exam-taker", icon: Key, label: "My Bookings" },
    { to: "/student/skill-gap", icon: BarChart2, label: "Skill Gap" },
    { to: "/student/results", icon: FileText, label: "My Results" },
    { to: "/student/certificates", icon: Award, label: "Certificates" },
  ];

  const invigilatorLinks = [
    { to: "/invigilator/issue-key", icon: Key, label: "Issue Key" },
    { to: "/invigilator/monitor", icon: Activity, label: "Active Exams" },
  ];

  const trackOwnerLinks = [
    { to: "/track-owner/analytics", icon: Activity, label: "Analytics" },
    { to: "/track-owner/students", icon: Users, label: "Enrolled Students" },
    { to: "/track-owner/levels", icon: List, label: "Manage Levels" },
  ];

  const adminLinks = [
    { to: "/admin/directory", icon: Users, label: "Students" },
    { to: "/admin/create-accounts", icon: UserPlus, label: "Add Users" },
    { to: "/admin/account-status", icon: UserX, label: "Account Status" },
    { to: "/admin/settings", icon: Settings, label: "Halls & Slots" },
    { to: "/admin/keys", icon: Key, label: "Key Generation" },
    { to: "/admin/analytics", icon: BarChart2, label: "Analytics" },
    { to: "/admin/audit", icon: FileText, label: "Audit Logs" },
  ];

  let links: { to: string, icon: any, label: string }[] = [];
  if (user?.role === "student") links = studentLinks;
  if (user?.role === "invigilator") links = invigilatorLinks;
  if (user?.role === "track_owner") links = trackOwnerLinks;
  if (user?.role === "admin") links = adminLinks;

  return (
    <div className={cn("flex flex-col bg-secondary transition-all duration-200 ease-out h-[calc(100vh-56px)]", isCollapsed ? "w-[72px]" : "w-[240px]")}>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={isCollapsed ? link.label : undefined}
            className={({ isActive }) =>
              cn(
                "relative flex items-center rounded-lg transition-colors",
                isCollapsed ? "flex-col justify-center px-1 py-3" : "px-3 py-2.5",
                isActive 
                  ? "bg-secondary text-primary font-medium" 
                  : "text-primary hover:bg-[#F2F2F2]"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-full" />
                )}
                <div className={cn("relative flex items-center justify-center", isCollapsed ? "mb-1" : "mr-4")}>
                  <link.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  isCollapsed ? "text-[10px] text-center w-full truncate leading-tight" : "text-sm flex-1",
                  isActive && !isCollapsed ? "font-medium" : "font-normal text-muted"
                )}>
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
