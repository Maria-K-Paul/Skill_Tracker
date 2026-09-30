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
      console.log("Attempting login with:", email);

      // Call real backend authentication
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post("/auth/login", formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log("Login response:", res.data);

      if (!res.data.access_token || !res.data.user) {
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      login(res.data.access_token, res.data.refresh_token);

      // Navigate based on user role from backend
      const roles = res.data.user.roles || [];
      console.log("User roles:", roles);

      const primaryRole = roles.length > 0 ? roles[0] : "";
      console.log("Primary role:", primaryRole);

      switch (primaryRole) {
        case "student":
          navigate("/student/dashboard");
          break;
        case "invigilator":
          navigate("/invigilator/issue-key");
          break;
        case "track_owner":
        case "fullstack_domain_owner":
        case "cyber_domain_owner":
        case "cloud_devops_domain_owner":
        case "ml_domain_owner":
          navigate("/track-owner/students");
          break;
        case "admin":
          navigate("/admin/directory");
          break;
        default:
          console.log("Unknown role, redirecting to home");
          navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.detail || err.message || "Invalid credentials");
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
