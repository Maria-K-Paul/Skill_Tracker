import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { FlipCard } from "../../components/ui/flip-card";

interface StudentVerificationProps {
  student: {
    name: string;
    rollNumber: string;
    photoUrl: string;
    domain: string;
    level: string;
  }
}

export function StudentVerification({ student }: StudentVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    setIsVerifying(true);
    const timer = setTimeout(() => setIsVerifying(false), 1200);
    return () => clearTimeout(timer);
  }, [student]);

  return (
    <div className="perspective-1000">
      <AnimatePresence mode="wait">
        {isVerifying ? (
          <motion.div
            key="pending"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-bold">Verifying Biometrics & Booking...</h3>
                <p className="text-muted-foreground mt-2">Connecting to student database for {student.rollNumber}</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="verified"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <FlipCard
              trigger="hover"
              axis="y"
              className="w-full h-40"
              front={
                <Card className="h-full relative overflow-hidden group border-primary/20 bg-primary/5">
                  <CardContent className="flex items-center space-x-6 p-6 h-full relative z-10">
                    <div className="relative">
                      <img 
                        src={student.photoUrl} 
                        alt={student.name} 
                        className="h-24 w-24 rounded-lg object-cover bg-muted ring-2 ring-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-primary">{student.name}</h3>
                      <p className="text-muted-foreground font-mono">{student.rollNumber}</p>
                      <p className="text-xs text-primary/60 mt-2 font-medium uppercase tracking-wide">Hover to verify details &rarr;</p>
                    </div>
                  </CardContent>
                </Card>
              }
              back={
                <Card className="h-full relative overflow-hidden bg-card border-success/30">
                  <div className="absolute inset-0 bg-success/100/10 rounded-xl" />
                  <CardContent className="flex flex-col justify-center h-full space-y-4 p-6 relative z-10">
                    <div className="flex items-center space-x-2 text-success font-bold text-lg">
                      <CheckCircle2 className="h-6 w-6" />
                      <span>Identity & Booking Verified</span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="bg-background">{student.domain}</Badge>
                      <Badge variant="secondary">{student.level}</Badge>
                      <Badge variant="outline" className="border-success text-success bg-success/10">Valid</Badge>
                    </div>
                  </CardContent>
                </Card>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
