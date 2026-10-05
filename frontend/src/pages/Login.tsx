import { useState, useRef } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, ArrowRight, Zap, Sparkles, Loader2, Check } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { AnimatedBackground } from "../components/ui/animated-background";
import { FallingLetters } from "../components/ui/falling-letters";
import { GradientBands } from "../components/ui/gradient-bands";
import { ANIMATION_CONFIG } from "../lib/animations";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // 3D Tilt Effect
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, ANIMATION_CONFIG.spring);
  const mouseYSpring = useSpring(y, ANIMATION_CONFIG.spring);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let role: any = "student";
      let name = "Demo Student";
      const emailLower = email.toLowerCase();
      
      if (emailLower.includes("admin")) {
        role = "admin";
        name = "System Admin";
      } else if (emailLower.includes("owner")) {
        role = "track_owner";
        name = "Domain Owner";
      } else if (emailLower.includes("invigilator")) {
        role = "invigilator";
        name = "Exam Invigilator";
      }

      const userData: any = { id: "mock-1", name, role };
      if (role !== "student") {
        userData.domain = "Full Stack";
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));

      try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password || "admin123");
        const res = await api.post("/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        localStorage.setItem("token", res.data.access_token);
      } catch (e) {
        console.warn("Backend login failed, continuing with mock user", e);
      }

      setSuccess(true);
      login(userData);

      setTimeout(() => {
        switch (role) {
          case "student": navigate("/student/dashboard"); break;
          case "invigilator": navigate("/invigilator/issue-key"); break;
          case "track_owner": navigate("/track-owner/students"); break;
          case "admin": navigate("/admin/directory"); break;
          default: navigate("/");
        }
      }, 500);
      
    } catch (err: any) {
      setError("Login failed");
      setLoading(false);
    }
  };

  const titleWords = "Welcome back".split(" ");

  return (
    <div className="relative flex min-h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      <AnimatedBackground />
      
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-24 z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Shield className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SkillTrack</span>
          </motion.div>

          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold tracking-tight flex gap-2 overflow-hidden">
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: ANIMATION_CONFIG.transition.ease }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-muted-foreground text-lg"
            >
              Sign in to your account to continue your journey.
            </motion.p>
          </div>

          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-6"
            initial="hidden"
            animate={error ? "shake" : "visible"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
              shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Username or Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="Try 'student' or 'admin'"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 bg-background/60 backdrop-blur-md transition-all focus:bg-background"
              />
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 bg-background/60 backdrop-blur-md transition-all focus:bg-background"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <Button 
                type="submit" 
                className="h-12 w-full text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 relative overflow-hidden" 
                disabled={loading || success}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                  ) : success ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex items-center absolute inset-0 justify-center">
                      Sign In <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            
            <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-center text-sm font-medium text-muted-foreground mt-6 bg-muted/50 py-2 rounded-lg backdrop-blur-sm border border-border/50">
              UI Preview mode. No real backend required.
            </motion.p>
          </motion.form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-l border-border/40">
        <GradientBands overlayClassName="bg-black/30 dark:bg-black/50" speed={1.5} className="absolute inset-0 z-0">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <h2 className="text-[10rem] font-black text-white leading-none tracking-tighter mix-blend-overlay rotate-90 transform -translate-x-1/4">LEVEL UP</h2>
          </div>
        </GradientBands>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 perspective-1000">
        <div className="absolute inset-0 pointer-events-none z-0 flex items-start justify-center pt-32">
          <FallingLetters text="LEVEL UP" variant="pass" className="scale-75 opacity-30 transform -rotate-6" />
        </div>

        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY }}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ 
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            default: { duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }
          }}
          className="relative z-10 w-full max-w-lg transform-style-3d"
        >
          <div className="p-10 rounded-3xl border border-white/20 shadow-2xl bg-white/10 dark:bg-black/10 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            
            <div className="flex space-x-3 mb-8">
              <div className="w-3.5 h-3.5 rounded-full bg-destructive/80 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-warning/80 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-success/80 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            </div>

            <div className="space-y-8 transform-translate-z-10">
              <div className="flex items-center gap-5 border-b border-border/20 pb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-white shadow-lg shadow-primary/10">
                  <Zap className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Master Your Skills</h3>
                  <p className="text-base text-white/70 mt-1">AI-driven progression tracks tailored for you.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20 text-white shadow-lg shadow-secondary/10">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Interactive Learning</h3>
                  <p className="text-base text-white/70 mt-1">Engage with dynamic assessments and grow.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
