import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Key, RotateCw, Copy, Check } from "lucide-react";
import { StudentVerification } from "./StudentVerification";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { FlipCard } from "../../components/ui/flip-card";

function SlotMachineDigit({ digit, index }: { digit: string, index: number }) {
  return (
    <div className="relative inline-flex h-[1em] w-[0.7em] overflow-hidden justify-center items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "-100%", filter: "blur(4px)", opacity: 0 }}
          animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
          exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.5, delay: index * 0.1 }}
          className="absolute"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function KeyIssue() {
  const [rollNumber, setRollNumber] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null);
  const [examKey, setExamKey] = useState<string | null>(null);
  const [ttl, setTtl] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollNumber) {
      setVerifiedStudent({
        name: "Alice Smith",
        rollNumber: rollNumber,
        photoUrl: "https://ui-avatars.com/api/?name=Alice+Smith",
        domain: "Full Stack",
        level: "Level 2"
      });
      setExamKey(null);
    }
  };

  const issueKey = () => {
    setExamKey(Math.random().toString(36).substring(2, 10).toUpperCase());
    setTtl(300); // 5 minutes
    setCopied(false);
    
    const interval = setInterval(() => {
      setTtl(t => {
        if (t <= 1) {
          clearInterval(interval);
          setExamKey(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleCopy = () => {
    if (examKey) {
      navigator.clipboard.writeText(examKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate dash offset for TTL ring (max 300)
  const circumference = 2 * Math.PI * 45;
  const dashoffset = circumference - (ttl / 300) * circumference;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader 
        title="Issue Exam Key" 
        description="Verify student and generate a time-limited exam key for them to start their test."
      />

      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle>Student Lookup</CardTitle>
          <CardDescription>Enter the student's roll number to verify their identity and booking.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="roll" className="sr-only">Roll Number</Label>
              <Input 
                id="roll" 
                placeholder="Enter Roll Number..." 
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
              />
            </div>
            <Button type="submit">Lookup</Button>
          </form>
        </CardContent>
      </Card>

      {verifiedStudent && (
        <div className="mb-6">
          <StudentVerification student={verifiedStudent} />
        </div>
      )}

      <AnimatePresence>
        {verifiedStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }} // Wait for verification flip to finish
          >
            <FlipCard
              trigger="click"
              axis="y"
              flipped={!!examKey}
              onFlip={(flipped) => {
                if (flipped && !examKey) {
                  issueKey();
                }
              }}
              className="w-full min-h-[350px]"
              front={
                <Card className="border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors h-full flex flex-col items-center justify-center p-8">
                  <Key className="h-12 w-12 text-primary mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold text-primary">Tap to Generate Key</h3>
                  <p className="text-muted-foreground mt-2">Creates a secure 5-minute access token</p>
                </Card>
              }
              back={
                <Card className="border-primary/20 bg-primary/5 overflow-hidden relative h-full flex flex-col items-center justify-center p-6">
                  {examKey && (
                    <div className="space-y-6 w-full flex flex-col items-center">
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Generated Exam Key</div>
                      
                      <div className="flex items-center space-x-4 bg-background px-6 py-4 rounded-xl border shadow-inner">
                        <div className="text-5xl font-mono font-black tracking-widest text-primary flex">
                          {examKey.split('').map((char, i) => (
                            <SlotMachineDigit key={`${i}-${char}`} digit={char} index={i} />
                          ))}
                        </div>
                        
                        <div onClick={e => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full hover:bg-primary/10"
                            onClick={handleCopy}
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
                                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <Check className="h-5 w-5 text-success" />
                                </motion.div>
                              ) : (
                                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <Copy className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center relative">
                         {/* TTL Countdown Ring */}
                         <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                           <svg className="transform -rotate-90 w-24 h-24">
                             <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted opacity-30" />
                             <motion.circle 
                               cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="4" fill="transparent" 
                               strokeDasharray={circumference}
                               animate={{ strokeDashoffset: dashoffset }}
                               transition={{ duration: 1, ease: "linear" }}
                               className={ttl < 60 ? "text-destructive" : "text-primary"}
                             />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className={cn("text-xl font-bold font-mono", ttl < 60 ? "text-destructive" : "text-primary")}>
                               {Math.floor(ttl / 60)}:{(ttl % 60).toString().padStart(2, '0')}
                             </span>
                           </div>
                         </div>
                         <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Valid For</div>
                      </div>

                      <div onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="mt-2" onClick={issueKey}>
                          <RotateCw className="mr-2 h-4 w-4" /> Reissue Key
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
