import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";

export interface MockUser {
  id: string; // User ID
  name: string;
  email: string;
  role: string;
  domain?: string;
  created: string;
  status: "active" | "inactive";
}

export function UserManagement() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Multi-step form state
  const [formStep, setFormStep] = useState(1);
  const [formDirection, setFormDirection] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    id: "",
    email: "",
    role: "student",
    domain: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("mockUsers");
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const defaultUsers: MockUser[] = [
        { id: "U001", name: "Admin User", email: "admin@example.com", role: "admin", created: new Date().toISOString(), status: "active" },
        { id: "U002", name: "Invigilator 1", email: "invigilator@example.com", role: "invigilator", created: new Date().toISOString(), status: "active" },
        { id: "U003", name: "Track Owner FS", email: "track@example.com", role: "track_owner", domain: "Full Stack", created: new Date().toISOString(), status: "active" },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("mockUsers", JSON.stringify(defaultUsers));
    }
  }, []);

  const saveUsers = (newUsers: MockUser[]) => {
    setUsers(newUsers);
    localStorage.setItem("mockUsers", JSON.stringify(newUsers));
  };

  const handleOpen = (user?: MockUser) => {
    setFormStep(1);
    setFormDirection(1);
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
        domain: user.domain || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", id: "", email: "", role: "student", domain: "" });
    }
    setIsOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const domainVal = (formData.role === "track_owner" || formData.role === "student") ? formData.domain : undefined;
    
    if (editingId) {
      saveUsers(users.map(u => u.id === editingId ? { ...u, ...formData, domain: domainVal } : u));
    } else {
      saveUsers([...users, { ...formData, domain: domainVal, created: new Date().toISOString(), status: "active" }]);
    }
    setIsOpen(false);
  };

  const toggleStatus = (id: string) => {
    saveUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
  };

  const nextStep = () => {
    setFormDirection(1);
    setFormStep(prev => prev + 1);
  };
  const prevStep = () => {
    setFormDirection(-1);
    setFormStep(prev => prev - 1);
  };

  const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="User Management" 
        description="Manage faculty and administrative roles."
        action={
          <Button onClick={() => handleOpen()} className="group">
             <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
             Add User
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Domain</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                <AnimatePresence>
                  {users.map((u, i) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: u.status === "inactive" ? 0.5 : 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="group relative border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {/* Left sliding highlight bar on hover */}
                      <td className="absolute inset-y-0 left-0 w-1 bg-primary transform scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300" />
                      
                      <td className="p-4 align-middle font-medium pl-6">{u.name}</td>
                      <td className="p-4 align-middle">{u.id}</td>
                      <td className="p-4 align-middle">{u.email}</td>
                      <td className="p-4 align-middle"><Badge variant="secondary">{u.role}</Badge></td>
                      <td className="p-4 align-middle">
                        {u.role === "student" 
                          ? (u.domain || "Entrance Level") 
                          : (u.domain || "-")}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => handleOpen(u)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => toggleStatus(u.id)}>
                            {u.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit User" : "Create Account"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Modify user details." : "Step-by-step account creation."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative h-[280px] overflow-hidden w-full mt-2">
              <AnimatePresence initial={false} custom={formDirection}>
                {formStep === 1 && (
                  <motion.div
                    key="step1"
                    custom={formDirection}
                    variants={stepVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 space-y-4 px-1"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                    </div>
                  </motion.div>
                )}
                {formStep === 2 && (
                  <motion.div
                    key="step2"
                    custom={formDirection}
                    variants={stepVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 space-y-4 px-1"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="id">User ID (Roll Number or Employee ID)</Label>
                      <Input id="id" required disabled={!!editingId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="e.g. 21CS001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role / Access Level</Label>
                      <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="invigilator">Invigilator</SelectItem>
                          <SelectItem value="track_owner">Track Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
                {formStep === 3 && (
                  <motion.div
                    key="step3"
                    custom={formDirection}
                    variants={stepVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 space-y-4 px-1 flex flex-col justify-center pb-8"
                  >
                    {(formData.role === "track_owner" || formData.role === "student") ? (
                      <div className="space-y-2">
                        <Label htmlFor="domain">Assign Domain {formData.role === "student" && "(Optional, defaults to Entrance)"}</Label>
                        <Select required={formData.role === "track_owner"} value={formData.domain} onValueChange={v => setFormData({...formData, domain: v})}>
                          <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Stack">Full Stack</SelectItem>
                            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                            <SelectItem value="Cloud & DevOps">Cloud & DevOps</SelectItem>
                            <SelectItem value="AI / ML">AI / ML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No domain assignment needed for {formData.role}.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <DialogFooter className="flex w-full items-center justify-between sm:justify-between">
              <div className="flex gap-1 text-xs text-muted-foreground w-1/3">
                 Step {formStep} of 3
              </div>
              <div className="flex gap-2">
                {formStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-1 w-4 h-4" /> Back
                  </Button>
                )}
                {formStep < 3 ? (
                  <Button type="button" onClick={nextStep} disabled={formStep === 1 ? (!formData.name || !formData.email) : (!formData.id || !formData.role)}>
                    Next <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={() => handleSubmit()} className="bg-success hover:bg-success">
                    <Check className="mr-2 w-4 h-4" /> {editingId ? "Update" : "Create Account"}
                  </Button>
                )}
              </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
