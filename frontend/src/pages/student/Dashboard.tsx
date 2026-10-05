import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code2, ShieldAlert, Cloud, BrainCircuit, Key, Play, BookOpen, Target, Calendar, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const domains = [
    { 
      id: "fullstack", 
      name: "Full Stack", 
      icon: Code2, 
      desc: "Frontend & Backend Development",
      topics: ["React & Modern UI", "Node.js & Express APIs", "Database Design (SQL/NoSQL)", "System Architecture"]
    },
    { 
      id: "cyber", 
      name: "Cybersecurity", 
      icon: ShieldAlert, 
      desc: "Network & Application Security",
      topics: ["Ethical Hacking & Penetration Testing", "Network Defense", "Cryptography", "Security Auditing & Compliance"]
    },
    { 
      id: "cloud", 
      name: "Cloud & DevOps", 
      icon: Cloud, 
      desc: "Infrastructure & CI/CD",
      topics: ["Cloud Platforms (AWS/Azure/GCP)", "Docker & Kubernetes", "CI/CD Pipelines", "Infrastructure as Code"]
    },
    { 
      id: "aiml", 
      name: "AI / ML", 
      icon: BrainCircuit, 
      desc: "Machine Learning & Data Science",
      topics: ["Data Preprocessing & Analysis", "Deep Learning & Neural Networks", "NLP & Computer Vision", "Model Deployment"]
    }
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

        <Reveal delay={0.2}>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
            <CardContent className="space-y-3">
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="flex items-center justify-between rounded-xl border border-border/40 p-4 transition-all hover:bg-accent/50 cursor-pointer" onClick={() => navigate("/student/roadmap")}>
                  <div>
                    <h4 className="font-semibold text-sm">View your Roadmap</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">See your path to mastering {user.domain}.</p>
                  </div>
                  <div className="bg-background shadow-sm border border-border/50 p-2 rounded-lg text-primary">
                     <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="flex items-center justify-between rounded-xl border border-border/40 p-4 transition-all hover:bg-accent/50 cursor-pointer" onClick={() => navigate("/student/skill-gap")}>
                  <div>
                    <h4 className="font-semibold text-sm">Review Skill Gaps</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">Check areas where you need to improve.</p>
                  </div>
                  <div className="bg-background shadow-sm border border-border/50 p-2 rounded-lg text-primary">
                     <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </Reveal>
    </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-2">
      <PageHeader 
        title={`Welcome, ${user?.name || "Student"}`} 
        description="Select a domain to take its Entrance Test. Passing will unlock the domain's learning roadmap." 
      />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 mt-10"
      >
        {domains.map((domain) => (
          <motion.div variants={item} key={domain.id} className="h-full">
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 400 }} className="h-[280px]">
              <FlipCard 
                trigger="hover"
                axis="y"
                className="h-full w-full"
                front={
                  <Card className="flex flex-col overflow-hidden h-full group cursor-pointer border-border/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30">
                    <CardContent className="flex flex-col flex-1 p-8 items-center justify-center text-center relative">
                      <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4">
                        <domain.icon className="w-32 h-32" />
                      </div>
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary shadow-sm border border-primary/10 mb-6 transition-all duration-500">
                        <domain.icon className="h-10 w-10" strokeWidth={2} />
                      </div>
                      <CardTitle className="text-2xl font-bold tracking-tight relative z-10">{domain.name}</CardTitle>
                      <div className="mt-4 relative z-10 inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-warning/100/10 text-warning text-sm font-semibold">
                        <span>Not Attempted</span>
                      </div>
                    </CardContent>
                  </Card>
                }
                back={
                  <Card className="flex flex-col overflow-hidden h-full group border-primary bg-primary/5 shadow-xl">
                    <CardContent className="flex flex-col flex-1 p-6 relative z-10">
                      <CardTitle className="text-xl font-bold tracking-tight mb-2 text-primary">{domain.name}</CardTitle>
                      <CardDescription className="text-sm text-foreground mb-6 font-medium leading-relaxed">{domain.desc}</CardDescription>
                      
                      <div className="mb-4 space-y-3 p-3 rounded-xl bg-background/50 border border-border/40 text-sm flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Entrance Attempts</span>
                          <div className="flex items-center space-x-1">
                            <Key className="h-4 w-4 text-warning drop-shadow-sm" />
                            <Key className="h-4 w-4 text-warning drop-shadow-sm" />
                            <Key className="h-4 w-4 text-warning drop-shadow-sm" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto" onClick={e => e.stopPropagation()}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full shadow-md hover:shadow-xl transition-all duration-300 group-hover:bg-primary/90" 
                            >
                              <Target className="mr-2 h-4 w-4" />
                              Select Domain
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]" onClick={e => e.stopPropagation()}>
                            <DialogHeader>
                              <DialogTitle>Confirm Domain Selection</DialogTitle>
                              <DialogDescription>
                                You are about to select the <strong className="text-foreground">{domain.name}</strong> domain.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-2 space-y-4">
                              <p className="text-sm text-muted-foreground">
                                {domain.desc}
                              </p>
                              
                              <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                                <h4 className="text-sm font-semibold text-foreground">What you'll learn:</h4>
                                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                  {domain.topics.map((topic, i) => (
                                    <li key={i}>{topic}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex items-start space-x-3">
                                <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                                <p className="text-sm text-foreground">
                                  <strong>Warning:</strong> Once selected, you cannot change this domain until you complete its entire roadmap or lose all your exam keys.
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={() => updateUser({ domain: domain.name })}>
                                  Confirm Selection
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                }
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
