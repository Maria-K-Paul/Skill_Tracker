import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code2, ShieldAlert, Cloud, BrainCircuit, Key, Play, BookOpen, Target, Calendar, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const domains = [
    { id: "fullstack", name: "Full Stack", icon: Code2, desc: "Frontend & Backend Development" },
    { id: "cyber", name: "Cybersecurity", icon: ShieldAlert, desc: "Network & Application Security" },
    { id: "cloud", name: "Cloud & DevOps", icon: Cloud, desc: "Infrastructure & CI/CD" },
    { id: "aiml", name: "AI / ML", icon: BrainCircuit, desc: "Machine Learning & Data Science" }
  ];

  const [activeBookings, setActiveBookings] = useState(0);

  useEffect(() => {
    api.get("/slots/student/my-bookings")
      .then((res) => {
        const bookings = res.data || [];
        setActiveBookings(bookings.filter((b: any) => b.status === "booked").length);
      })
      .catch(() => {});
  }, []);

  // If the student has already cleared a domain's entrance test, they are assigned that domain.
  if (user?.domain) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={`Welcome back, ${user?.name || "Student"}`}
          description="Here is an overview of your SkillTrack progress."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Domain</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.domain}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level 1</div>
              <p className="text-xs text-muted-foreground mt-1">3/3 Attempts Remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Test</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {activeBookings > 0 ? (
                <>
                  <div className="text-2xl font-bold">{activeBookings} Booked</div>
                  <Button variant="link" className="px-0 mt-1 text-primary" onClick={() => navigate("/student/upcoming-test")}>
                    View Details →
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">None</div>
                  <p className="text-xs text-muted-foreground mt-1">No tests booked</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Earned</div>
              <Button variant="link" className="px-0 mt-2 text-primary" onClick={() => navigate("/student/certificates")}>
                View Certificates →
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold">View your Roadmap</h4>
                  <p className="text-sm text-muted-foreground">See your path to mastering {user.domain}.</p>
                </div>
                <Button onClick={() => navigate("/student/roadmap")}>Go to Roadmap</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold">Review Skill Gaps</h4>
                  <p className="text-sm text-muted-foreground">Check areas where you need to improve.</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/student/skill-gap")}>Analyze</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Otherwise, they see all 4 domains and can take an entrance test for any.
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title={`Welcome, ${user?.name || "Student"}`} 
        description="Select a domain to take its Entrance Test. Passing will unlock the domain's learning roadmap." 
      />
      
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {domains.map((domain) => (
          <Card key={domain.id} className="flex flex-col overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E5E5] text-primary">
                  <domain.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div>
                  <CardTitle className="text-[16px] font-medium">{domain.name}</CardTitle>
                  <CardDescription className="text-[14px] text-muted mt-0.5">{domain.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Entrance Test Status:</span>
                  <span className="font-semibold text-amber-600">Not Attempted</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attempts Remaining:</span>
                  <div className="flex items-center space-x-1">
                    <Key className="h-4 w-4 text-amber-500" />
                    <Key className="h-4 w-4 text-amber-500" />
                    <Key className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/student/book-slot", { state: { testName: `${domain.name} Entrance Test`, domain: domain.name } })}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Take Entrance Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
