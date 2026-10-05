import { PageHeader } from "../../components/layout/PageHeader";
import { Check, Lock, Key } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG, pageTransitionVariants, staggerContainer, revealVariants } from "../../lib/animations";
import { FlipCard } from "../../components/ui/flip-card";

export function LevelRoadmap() {
  const navigate = useNavigate();
  // Mock roadmap data
  const levels = [
    { 
      id: 1, 
      title: "Level 1: Fundamentals", 
      status: "completed", 
      attemptsLeft: 3,
      requirement: "Clear the basic aptitude test and complete 3 foundation modules."
    },
    { 
      id: 2, 
      title: "Level 2: Intermediate", 
      status: "unlocked", 
      attemptsLeft: 2,
      requirement: "Build a responsive web application using React and pass the coding assessment."
    },
    { 
      id: 3, 
      title: "Level 3: Advanced", 
      status: "locked", 
      attemptsLeft: 3,
      requirement: "Implement a full-stack application with authentication and database integration."
    },
    { 
      id: 4, 
      title: "Level 4: Expert", 
      status: "locked", 
      attemptsLeft: 3,
      requirement: "Design a scalable system architecture and complete the final capstone project."
    },
  ];

  return (
    <motion.div 
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto max-w-3xl"
    >
      <PageHeader 
        title="Level Roadmap" 
        description="Your progression path in Full Stack Development."
      />

      <div className="relative mt-12 py-8">
        {/* Animated SVG Line */}
        <div className="absolute inset-0 ml-5 md:mx-auto md:w-0.5 md:-translate-x-1/2 w-0.5 z-0 flex justify-center">
          <svg className="h-full w-4 overflow-visible" preserveAspectRatio="none">
            <motion.line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Glowing pulse moving down the active segment */}
            <motion.circle
              cx="50%"
              cy="0%"
              r="4"
              fill="hsl(var(--primary))"
              className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              whileInView={{ opacity: [0, 1, 1, 0] }}
              animate={{ 
                cy: ["0%", "50%"], // just an example path segment
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1.5 
              }}
            />
          </svg>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {levels.map((level, idx) => (
            <motion.div 
              key={level.id} 
              variants={revealVariants}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 shadow-lg md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-500",
                level.status === 'completed' ? "border-primary bg-primary text-primary-foreground" :
                level.status === 'unlocked' ? "border-primary bg-background text-primary shadow-primary/20" : 
                "border-muted text-muted-foreground bg-muted/50 backdrop-blur-md"
              )}>
                <AnimatePresence mode="wait">
                  {level.status === 'completed' && (
                    <motion.div key="completed" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}>
                      <Check className="h-6 w-6" />
                    </motion.div>
                  )}
                  {level.status === 'unlocked' && (
                    <motion.div key="unlocked" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <span className="font-bold text-lg">{level.id}</span>
                    </motion.div>
                  )}
                  {level.status === 'locked' && (
                    <motion.div 
                      key="locked" 
                      whileHover={{ x: [-2, 2, -2, 2, 0], transition: { duration: 0.3 } }}
                    >
                      <Lock className="h-5 w-5 opacity-50" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <FlipCard 
                trigger="hover"
                axis="y"
                className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] h-[160px]"
                front={
                  <div className={cn(
                    "w-full h-full rounded-xl border p-6 shadow-sm flex flex-col justify-center transition-all",
                    level.status === 'locked' ? "bg-card/50 border-muted opacity-80" : "bg-card hover:shadow-xl hover:border-primary/30"
                  )}>
                    <h3 className={cn(
                      "text-lg font-bold", 
                      level.status === 'locked' && "text-muted-foreground"
                    )}>
                      {level.title}
                    </h3>
                    {level.status === 'completed' && <div className="text-success font-medium text-sm mt-2">Completed</div>}
                    {level.status === 'unlocked' && <div className="text-primary font-medium text-sm mt-2">Hover to view requirements</div>}
                    {level.status === 'locked' && <div className="text-muted-foreground text-sm mt-2 flex items-center"><Lock className="h-3 w-3 mr-1 inline"/> Locked - Hover to view requirements</div>}
                  </div>
                }
                back={
                  <div className={cn(
                    "w-full h-full rounded-xl border p-5 shadow-xl flex flex-col",
                    level.status === 'locked' ? "border-muted bg-muted/20" : "border-primary/30 bg-primary/5"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold">Requirements</span>
                      {level.status === 'unlocked' && (
                        <div className="flex items-center space-x-1" title="Attempts Left">
                          {[1, 2, 3].map(k => (
                            <Key key={k} className={cn("h-3 w-3", k <= level.attemptsLeft ? "text-warning drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]" : "text-muted opacity-50")} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {level.requirement}
                    </p>
                    
                    {level.status === 'unlocked' && (
                      <div className="flex space-x-2 mt-auto pt-2" onClick={e => e.stopPropagation()}>
                        <Button size="sm" onClick={() => navigate("/student/prep")} className="shadow-lg shadow-primary/20 w-full h-8 text-xs">Prepare</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate("/student/book-slot")} className="w-full h-8 text-xs">Book</Button>
                      </div>
                    )}
                    
                    {level.status === 'completed' && (
                      <div className="text-sm text-success font-medium mt-auto flex items-center">
                        <Check className="h-4 w-4 mr-1" /> Requirements fulfilled
                      </div>
                    )}

                    {level.status === 'locked' && (
                       <div className="text-xs text-muted-foreground mt-auto flex items-center italic">
                         <Lock className="h-3 w-3 mr-1" /> Complete previous levels to unlock
                       </div>
                    )}
                  </div>
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
