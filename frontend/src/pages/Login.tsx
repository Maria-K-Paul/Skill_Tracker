import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Shield } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Mocking API call for demo since backend might not be up
      // const res = await api.post("/auth/login", { email, password });
      // login(res.data.access_token, res.data.refresh_token);
      
      // MOCK LOGIN LOGIC:
      const savedUsersStr = localStorage.getItem("mockUsers");
      let foundUser = null;
      if (savedUsersStr) {
        const users = JSON.parse(savedUsersStr);
        foundUser = users.find((u: any) => u.email === email && u.status === "active");
      }

      let role, name, domain, sub;
      if (foundUser) {
        role = foundUser.role;
        name = foundUser.name;
        domain = foundUser.domain;
        sub = foundUser.id; // use ID for sub so user history is tied to ID
      } else {
        // Fallback for demo emails
        const roleMap: Record<string, string> = {
          "student": "student",
          "invigilator": "invigilator",
          "track": "track_owner",
          "admin": "admin"
        };
        
        const roleKey = Object.keys(roleMap).find(k => email.includes(k)) || "student";
        role = roleMap[roleKey];
        name = email.split('@')[0];
        domain = role === "track_owner" ? "Full Stack" : undefined;
        sub = email; // Fallback to email
      }
      
      // Create a fake JWT token payload
      const payload = {
        sub: sub,
        role: role,
        name: name,
        domain: domain,
        semester: 3,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };
      
      const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify(payload)) + ".signature";
      
      login(fakeToken, "fake-refresh");

      switch (role) {
        case "student": navigate("/student/dashboard"); break;
        case "invigilator": navigate("/invigilator/issue-key"); break;
        case "track_owner": navigate("/track-owner/students"); break;
        case "admin": navigate("/admin/directory"); break;
        default: navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-secondary">Welcome to SkillTrack</CardTitle>
          <CardDescription>
            Enter your credentials to access your portal.
            <br />
            <span className="text-xs text-muted-foreground mt-2 inline-block">Hint: use 'student@', 'invigilator@', 'track@', 'admin@' in email to mock roles</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
