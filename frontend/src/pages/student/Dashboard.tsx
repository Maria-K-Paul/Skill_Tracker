import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code2, ShieldAlert, Cloud, BrainCircuit, Key, Play, BookOpen, Target, Calendar, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "../../components/ui/reveal";
import { SpotlightCard } from "../../components/ui/spotlight-card";
import { CountUp } from "../../components/ui/count-up";
import { FlipCard } from "../../components/ui/flip-card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../../components/ui/dialog";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: "spring" as const, 
      stiffness: 200, 
      damping: 20,
      mass: 0.8
    } 
  }
};

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

  if (user?.domain) {
    return (
      <div className="mx-auto max-w-5xl px-2">
        <PageHeader 
          title={`Welcome back, ${user?.name || "Student"}`} 
          description="Here is an overview of your SkillTrack progress." 
        />
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4 auto-rows-[160px]"
        >
          <motion.div variants={item} className="lg:col-span-2">
            <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }} className="h-full">
              <SpotlightCard className="h-full border-border/40 overflow-hidden relative group bg-card border rounded-xl shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-6 flex flex-col h-full">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">Current Domain</h3>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight mt-auto">{user.domain}</div>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
          
          <motion.div variants={item}>
            <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }} className="h-full">
              <SpotlightCard className="h-full border-border/40 overflow-hidden relative group bg-card border rounded-xl shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-6 flex flex-col h-full">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">Current Level</h3>
                    <div className="p-2 rounded-lg bg-secondary/20 text-secondary-foreground">
                      <Target className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight mt-auto">Level 1</div>
                  <p className="text-xs font-medium text-muted-foreground mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success/100"></span>
                    <CountUp value={3} delay={0.2} />/3 Attempts
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
          
          <motion.div variants={item}>
            <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }} className="h-full">
              <SpotlightCard className="h-full border-border/40 overflow-hidden relative group bg-card border rounded-xl shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-6 flex flex-col h-full">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">Certificates</h3>
                    <div className="p-2 rounded-lg bg-warning/100/10 text-warning">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight mt-auto flex items-center gap-2">
                    {(() => {
                      try {
                        const saved = localStorage.getItem(`mockResults_${user.id}`);
                        if (saved) {
                          const results = JSON.parse(saved);
                          const num = Array.isArray(results) ? results.filter((r: any) => r.passed).length : 0;
                          return <CountUp value={num} delay={0.3} />;
                        }
                      } catch (e) {}
                      return <CountUp value={0} />;
                    })()} Earned
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-4">
            <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }} className="h-full">
              <SpotlightCard className="h-full border-border/40 overflow-hidden relative group bg-card border rounded-xl shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-6 flex flex-row items-center justify-between h-full">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-muted-foreground mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-info/100/10 text-info"><Calendar className="h-3 w-3" /></div> Upcoming Test
                    </h3>
                    {(() => {
                      try {
                        const saved = localStorage.getItem(`bookedSlot_${user.id}`);
                        if (saved) {
                          const slot = JSON.parse(saved);
                          return (
                            <>
                              <div className="text-2xl font-bold truncate tracking-tight">{slot.testName}</div>
                              <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning/100"></span>
                                {slot.date} at {slot.time}
                              </p>
                            </>
                          );
                        }
                      } catch (e) {}
                      return (
                        <>
                          <div className="text-2xl font-bold tracking-tight text-muted-foreground">None</div>
                          <p className="text-sm font-medium text-muted-foreground mt-1.5">No tests booked right now.</p>
                        </>
                      );
                    })()}
                  </div>
                  <Button variant="outline" className="hidden md:flex">View Calendar</Button>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </motion.div>

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
