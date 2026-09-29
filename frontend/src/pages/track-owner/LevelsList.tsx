import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Users, Trash2, Calendar, BrainCircuit, Loader2, Eye, Pencil } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function LevelsList() {
  const { user } = useAuth();
  const domain = user?.domain || "Unknown Domain";
  const storageKey = `mockLevels_${domain}`;

  const [levels, setLevels] = useState<any[]>([]);
  const [globalSlots, setGlobalSlots] = useState<any[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [viewingLevel, setViewingLevel] = useState<any>(null);

  const [newLevelData, setNewLevelData] = useState({
    title: "",
    slotId: "",
    easyCount: "10",
    mediumCount: "10",
    hardCount: "5",
    prompt: "",
    questions: [] as any[]
  });

  useEffect(() => {
    const savedLevels = localStorage.getItem(storageKey);
    if (savedLevels) {
      setLevels(JSON.parse(savedLevels));
    } else {
      const defaultLevels = [
        { 
          id: "L1", 
          title: "Level 1: Fundamentals", 
          status: "Active", 
          activeStudents: 45, 
          date: "Oct 15, 2026", 
          time: "10:00 AM", 
          questions: [{ 
            text: "What is HTML?", 
            diff: "Easy", 
            options: ["HyperText Markup Language", "HyperLinks and Text Markup Language", "Home Tool Markup Language", "Hyper Tool Multi Language"],
            correctAnswer: "HyperText Markup Language" 
          }],
          easyCount: "10",
          mediumCount: "10",
          hardCount: "5",
          prompt: "basics"
        },
      ];
      setLevels(defaultLevels);
      localStorage.setItem(storageKey, JSON.stringify(defaultLevels));
    }

    const savedSlots = localStorage.getItem("mockGlobalSlots");
    if (savedSlots) setGlobalSlots(JSON.parse(savedSlots));
  }, [domain, storageKey]);

  const saveLevels = (newLevels: any[]) => {
    setLevels(newLevels);
    localStorage.setItem(storageKey, JSON.stringify(newLevels));
  };

  const handleCreateNew = () => {
    setEditingLevelId(null);
    setNewLevelData({ title: "", slotId: "", easyCount: "10", mediumCount: "10", hardCount: "5", prompt: "", questions: [] });
    setStep(1);
    setIsCreating(true);
  };

  const handleEditLevel = (level: any) => {
    setEditingLevelId(level.id);
    setNewLevelData({
      title: level.title || "",
      slotId: level.slotId || "",
      easyCount: level.easyCount || "10",
      mediumCount: level.mediumCount || "10",
      hardCount: level.hardCount || "5",
      prompt: level.prompt || "",
      questions: level.questions || []
    });
    setStep(1);
    setIsCreating(true);
  };

  const handleGenerateQuestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const easy = parseInt(newLevelData.easyCount) || 0;
      const med = parseInt(newLevelData.mediumCount) || 0;
      const hard = parseInt(newLevelData.hardCount) || 0;
      
      const generated = [];
      for(let i=0; i<easy; i++) generated.push({ 
        text: `Easy question ${i+1} on ${newLevelData.prompt || 'basics'}`, 
        diff: 'Easy', 
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A"
      });
      for(let i=0; i<med; i++) generated.push({ 
        text: `Medium question ${i+1} on ${newLevelData.prompt || 'core concepts'}`, 
        diff: 'Medium', 
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option B"
      });
      for(let i=0; i<hard; i++) generated.push({ 
        text: `Hard question ${i+1} on ${newLevelData.prompt || 'advanced topics'}`, 
        diff: 'Hard', 
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option C"
      });
      
      setNewLevelData(prev => ({ ...prev, questions: generated }));
      setIsGenerating(false);
      setStep(2);
    }, 1500);
  };

  const handleApprove = () => {
    const selectedSlot = globalSlots.find(s => s.id === newLevelData.slotId);
    
    const levelToSave = {
      id: editingLevelId || `L${Date.now()}`,
      title: newLevelData.title || `New Level`,
      status: "Active",
      activeStudents: editingLevelId ? levels.find(l => l.id === editingLevelId)?.activeStudents || 0 : 0,
      date: selectedSlot?.date || "TBD",
      time: selectedSlot?.time || "TBD",
      slotId: newLevelData.slotId,
      easyCount: newLevelData.easyCount,
      mediumCount: newLevelData.mediumCount,
      hardCount: newLevelData.hardCount,
      prompt: newLevelData.prompt,
      questions: newLevelData.questions
    };
    
    if (editingLevelId) {
      saveLevels(levels.map(l => l.id === editingLevelId ? levelToSave : l));
    } else {
      saveLevels([...levels, levelToSave]);
    }
    
    setIsCreating(false);
    setEditingLevelId(null);
  };

  const handleDelete = (id: string) => {
    saveLevels(levels.filter(l => l.id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader 
        title={`${domain} Levels`}
        description="Manage progression levels and exam configuration for your domain."
        action={<Button onClick={handleCreateNew}>+ Create Level</Button>}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Card key={level.id} className="flex flex-col relative overflow-hidden">
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-7 w-7 opacity-50 hover:opacity-100"
              onClick={() => handleDelete(level.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="default">Active</Badge>
              </div>
              <CardTitle>{level.title}</CardTitle>
              <CardDescription>
                <div className="space-y-1 mt-2">
                  <span className="flex items-center text-sm"><Users className="mr-2 h-4 w-4" /> {level.activeStudents} students allocated</span>
                  <span className="flex items-center text-sm"><Calendar className="mr-2 h-4 w-4" /> {level.date} @ {level.time}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex gap-2">
              <Button variant="outline" size="sm" className="w-1/2" onClick={() => setViewingLevel(level)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button variant="outline" size="sm" className="w-1/2" onClick={() => handleEditLevel(level)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Creation / Editing Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingLevelId ? "Edit Level & Exam Configuration" : "Configure New Level & Exam"}</DialogTitle>
            <DialogDescription>
              Step {step} of 2: {step === 1 ? "Configuration" : "Review Generated Questions"}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Level Settings</h3>
                <div className="space-y-2">
                  <Label>Level Name</Label>
                  <Input placeholder="e.g., Level 2: Advanced Topics" value={newLevelData.title} onChange={e => setNewLevelData({...newLevelData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Select Exam Slot</Label>
                  <Select value={newLevelData.slotId} onValueChange={v => setNewLevelData({...newLevelData, slotId: v})}>
                    <SelectTrigger><SelectValue placeholder="Choose a global slot" /></SelectTrigger>
                    <SelectContent>
                      {globalSlots.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.date} at {s.time}</SelectItem>
                      ))}
                      {globalSlots.length === 0 && <SelectItem value="none" disabled>No slots configured by Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Question Generation</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Easy</Label>
                    <Input type="number" value={newLevelData.easyCount} onChange={e => setNewLevelData({...newLevelData, easyCount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Medium</Label>
                    <Input type="number" value={newLevelData.mediumCount} onChange={e => setNewLevelData({...newLevelData, mediumCount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hard</Label>
                    <Input type="number" value={newLevelData.hardCount} onChange={e => setNewLevelData({...newLevelData, hardCount: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subtopics / AI Prompt</Label>
                  <Input placeholder="e.g., React Hooks, Context API, Next.js routing" value={newLevelData.prompt} onChange={e => setNewLevelData({...newLevelData, prompt: e.target.value})} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" onClick={handleGenerateQuestions} disabled={isGenerating}>
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><BrainCircuit className="mr-2 h-4 w-4" /> Generate New</>}
                  </Button>
                  {editingLevelId && newLevelData.questions.length > 0 && (
                    <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                      Skip & Edit Existing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                <div className="text-sm">
                  <strong>Generated: </strong> 
                  {newLevelData.questions.length} total questions ({newLevelData.easyCount} Easy, {newLevelData.mediumCount} Med, {newLevelData.hardCount} Hard)
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>Edit Prompt & Reprompt</Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-3 border rounded-md p-4">
                {newLevelData.questions.map((q, i) => (
                  <div key={i} className="flex flex-col space-y-2 p-3 border rounded-md bg-muted/20">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">Question {i + 1}</Label>
                      <Badge variant={q.diff === 'Hard' ? 'destructive' : q.diff === 'Medium' ? 'default' : 'secondary'}>{q.diff}</Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Question Text</Label>
                      <Input 
                        value={q.text} 
                        onChange={(e) => {
                          const qs = [...newLevelData.questions];
                          qs[i].text = e.target.value;
                          setNewLevelData({...newLevelData, questions: qs});
                        }} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Options</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(q.options || ["", "", "", ""]).map((opt: string, optIdx: number) => (
                           <Input 
                             key={optIdx}
                             value={opt}
                             placeholder={`Option ${optIdx + 1}`}
                             onChange={(e) => {
                               const qs = [...newLevelData.questions];
                               if (!qs[i].options) qs[i].options = ["", "", "", ""];
                               qs[i].options[optIdx] = e.target.value;
                               setNewLevelData({...newLevelData, questions: qs});
                             }}
                           />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Correct Answer</Label>
                      <Select 
                        value={q.correctAnswer || ""} 
                        onValueChange={(val) => {
                          const qs = [...newLevelData.questions];
                          qs[i].correctAnswer = val;
                          setNewLevelData({...newLevelData, questions: qs});
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger>
                        <SelectContent>
                           {(q.options || ["", "", "", ""]).map((opt: string, optIdx: number) => (
                              <SelectItem key={optIdx} value={opt || `Empty ${optIdx}`}>{opt || `Empty ${optIdx}`}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Review and edit the questions. If they look good, approve and allocate this exam to students of this level.</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            {step === 2 && <Button onClick={handleApprove}>Approve & Allocate</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Read-only Viewing Dialog */}
      <Dialog open={!!viewingLevel} onOpenChange={(open) => !open && setViewingLevel(null)}>
        {viewingLevel && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>View Questions</DialogTitle>
              <DialogDescription>
                {viewingLevel.title}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {viewingLevel.questions && viewingLevel.questions.length > 0 ? (
                  viewingLevel.questions.map((q: any, i: number) => (
                    <div key={i} className="flex flex-col space-y-2 p-3 border rounded-md bg-muted/20">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold text-foreground">Question {i + 1}</Label>
                        <Badge variant={q.diff === 'Hard' ? 'destructive' : q.diff === 'Medium' ? 'default' : 'secondary'}>{q.diff}</Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {q.text}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {(q.options || []).map((opt: string, optIdx: number) => (
                           <div key={optIdx} className={`text-xs p-2 rounded border ${q.correctAnswer === opt ? 'bg-green-100 border-green-500 font-medium' : 'bg-background border-border text-muted-foreground'}`}>
                             {opt}
                           </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No questions allocated.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewingLevel(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
