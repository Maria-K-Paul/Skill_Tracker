import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="User Management" 
        description="Manage faculty and administrative roles."
        action={
          <Button onClick={() => handleOpen()}>+ Add User</Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className={u.status === "inactive" ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                  <TableCell>
                    {u.role === "student" 
                      ? (u.domain || "Entrance Level") 
                      : (u.domain || "-")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => handleOpen(u)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toggleStatus(u.id)}>
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Modify user details below." : "Create a new user account."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">User Name</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">User ID</Label>
                <Input id="id" required disabled={!!editingId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
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
              {(formData.role === "track_owner" || formData.role === "student") && (
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain {formData.role === "student" && "(Optional, defaults to Entrance)"}</Label>
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
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
