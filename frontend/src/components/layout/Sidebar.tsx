import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  LayoutDashboard, BookOpen, Clock, Award, 
  Users, Key, Activity, Settings, List, Shield, UserPlus, 
  Calendar, FileText, Target, BarChart2
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const { user } = useAuth();
  
  // Conditionally include Level Roadmap if a domain is selected
  const studentLinks = [
    { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ...(user?.domain ? [{ to: "/student/roadmap", icon: Target, label: "Level Roadmap" }] : []),
    { to: "/student/upcoming-test", icon: Calendar, label: "Upcoming Test" },
    { to: "/student/exam-taker", icon: Key, label: "Exam Taker" },
    { to: "/student/skill-gap", icon: BarChart2, label: "Skill Gap" },
    { to: "/student/results", icon: FileText, label: "View Result" },
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
    { to: "/admin/analytics", icon: Activity, label: "Analytics" },
    { to: "/admin/users", icon: UserPlus, label: "User Management" },
    { to: "/admin/keys", icon: Key, label: "Exam Key" },
    { to: "/admin/invigilator", icon: Shield, label: "Invigilator" },
    { to: "/admin/details", icon: Users, label: "Details" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  let links: { to: string, icon: any, label: string }[] = [];
  if (user?.role === "student") links = studentLinks;
  if (user?.role === "invigilator") links = invigilatorLinks;
  if (user?.role === "track_owner") links = trackOwnerLinks;
  if (user?.role === "admin") links = adminLinks;

  return (
    <div className="flex w-64 flex-col border-r bg-secondary text-secondary-foreground">
      <div className="flex h-16 items-center px-6 border-b border-secondary-foreground/10">
        <Shield className="mr-2 h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">SkillTrack</span>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary-foreground/10"
              )
            }
          >
            <link.icon className="mr-3 h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
