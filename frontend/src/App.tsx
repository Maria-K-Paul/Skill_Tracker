import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./components/layout/AppShell";

// Pages
import { Login } from "./pages/Login";

// Student
import { StudentDashboard } from "./pages/student/Dashboard";
import { LevelRoadmap } from "./pages/student/LevelRoadmap";
import { TestPrep } from "./pages/student/TestPrep";
import { SlotBooking } from "./pages/student/SlotBooking";
import { UpcomingTest } from "./pages/student/UpcomingTest";
import { ExamTaker } from "./pages/student/ExamTaker";
import { ExamScreen } from "./pages/student/ExamScreen";
import { SkillGap } from "./pages/student/SkillGap";
import { Results } from "./pages/student/Results";
import { Certificates } from "./pages/student/Certificates";

// Invigilator
import { KeyIssue } from "./pages/invigilator/KeyIssue";
import { ActiveExamsMonitor } from "./pages/invigilator/ActiveExamsMonitor";

// Track Owner
import { EnrolledStudents } from "./pages/track-owner/EnrolledStudents";
import { LevelsList } from "./pages/track-owner/LevelsList";
import { QuestionGeneratorPrompt } from "./pages/track-owner/QuestionGeneratorPrompt";
import { QuestionReviewApprove } from "./pages/track-owner/QuestionReviewApprove";
import { DifficultyConfig } from "./pages/track-owner/DifficultyConfig";
import { TestScheduling } from "./pages/track-owner/TestScheduling";
import { DomainAnalytics } from "./pages/track-owner/DomainAnalytics";

// Admin
import { StudentDirectory } from "./pages/admin/StudentDirectory";
import { Analytics } from "./pages/admin/Analytics";
import { DomainSemesterStats } from "./pages/admin/DomainSemesterStats";
import { SkillGapOverview } from "./pages/admin/SkillGapOverview";
import { UserManagement } from "./pages/admin/UserManagement";
import { KeyGeneration } from "./pages/admin/KeyGeneration";
import { InvigilatorManagement } from "./pages/admin/InvigilatorManagement";
import { UserDetails } from "./pages/admin/UserDetails";
import { AuditLog } from "./pages/admin/AuditLog";
import { SystemSettings } from "./pages/admin/SystemSettings";
import { CreateAccounts } from "./pages/admin/CreateAccounts";
import { AccountStatus } from "./pages/admin/AccountStatus";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />; // Basic fallback
  
  // Exam screen has no shell (fullscreen)
  const isExam = window.location.pathname.includes('/exam') && !window.location.pathname.includes('/exam-taker');
  if (isExam) return <>{children}</>;
  
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/roadmap" element={<ProtectedRoute allowedRoles={['student']}><LevelRoadmap /></ProtectedRoute>} />
          <Route path="/student/prep" element={<ProtectedRoute allowedRoles={['student']}><TestPrep /></ProtectedRoute>} />
          <Route path="/student/book-slot" element={<ProtectedRoute allowedRoles={['student']}><SlotBooking /></ProtectedRoute>} />
          <Route path="/student/upcoming-test" element={<ProtectedRoute allowedRoles={['student']}><UpcomingTest /></ProtectedRoute>} />
          <Route path="/student/exam-taker" element={<ProtectedRoute allowedRoles={['student']}><ExamTaker /></ProtectedRoute>} />
          <Route path="/student/exam" element={<ProtectedRoute allowedRoles={['student']}><ExamScreen /></ProtectedRoute>} />
          <Route path="/student/skill-gap" element={<ProtectedRoute allowedRoles={['student']}><SkillGap /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><Results /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={['student']}><Certificates /></ProtectedRoute>} />

          {/* Invigilator Routes */}
          <Route path="/invigilator/issue-key" element={<ProtectedRoute allowedRoles={['invigilator']}><KeyIssue /></ProtectedRoute>} />
          <Route path="/invigilator/monitor" element={<ProtectedRoute allowedRoles={['invigilator']}><ActiveExamsMonitor /></ProtectedRoute>} />

          {/* Track Owner Routes */}
          <Route path="/track-owner/analytics" element={<ProtectedRoute allowedRoles={['track_owner']}><DomainAnalytics /></ProtectedRoute>} />
          <Route path="/track-owner/students" element={<ProtectedRoute allowedRoles={['track_owner']}><EnrolledStudents /></ProtectedRoute>} />
          <Route path="/track-owner/levels" element={<ProtectedRoute allowedRoles={['track_owner']}><LevelsList /></ProtectedRoute>} />
          <Route path="/track-owner/generator" element={<ProtectedRoute allowedRoles={['track_owner']}><QuestionGeneratorPrompt /></ProtectedRoute>} />
          <Route path="/track-owner/review" element={<ProtectedRoute allowedRoles={['track_owner']}><QuestionReviewApprove /></ProtectedRoute>} />
          <Route path="/track-owner/config" element={<ProtectedRoute allowedRoles={['track_owner']}><DifficultyConfig /></ProtectedRoute>} />
          <Route path="/track-owner/schedule" element={<ProtectedRoute allowedRoles={['track_owner']}><TestScheduling /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/directory" element={<ProtectedRoute allowedRoles={['admin']}><StudentDirectory /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['admin']}><DomainSemesterStats /></ProtectedRoute>} />
          <Route path="/admin/gaps" element={<ProtectedRoute allowedRoles={['admin']}><SkillGapOverview /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/create-accounts" element={<ProtectedRoute allowedRoles={['admin']}><CreateAccounts /></ProtectedRoute>} />
          <Route path="/admin/account-status" element={<ProtectedRoute allowedRoles={['admin']}><AccountStatus /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>} />
          <Route path="/admin/keys" element={<ProtectedRoute allowedRoles={['admin']}><KeyGeneration /></ProtectedRoute>} />
          <Route path="/admin/invigilator" element={<ProtectedRoute allowedRoles={['admin']}><InvigilatorManagement /></ProtectedRoute>} />
          <Route path="/admin/details" element={<ProtectedRoute allowedRoles={['admin']}><UserDetails /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLog /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
