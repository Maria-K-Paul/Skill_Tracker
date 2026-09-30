import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { UserCheck, UserX, Search, RefreshCw } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  account_expires_at: string | null;
}

export function AccountStatus() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: { limit: 1000 }
      });
      setUsers(res.data.items || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setMessage({ type: "error", text: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.full_name?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((user) => user.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((user) => !user.is_active);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.roles.includes(roleFilter));
    }

    setFilteredUsers(filtered);
  };

  const handleDeactivate = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to deactivate ${username}? They will be logged out and unable to login.`)) {
      return;
    }

    try {
      await api.post(`/users/${userId}/deactivate`);
      setMessage({ type: "success", text: `Account ${username} deactivated successfully!` });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to deactivate account",
      });
    }
  };

  const handleActivate = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to activate ${username}?`)) {
      return;
    }

    try {
      await api.post(`/users/${userId}/activate`);
      setMessage({ type: "success", text: `Account ${username} activated successfully!` });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to activate account",
      });
    }
  };

  const handleUnlock = async (userId: number, username: string) => {
    if (!confirm(`Unlock ${username}'s account? This will reset failed login attempts.`)) {
      return;
    }

    try {
      await api.post(`/users/${userId}/unlock`);
      setMessage({ type: "success", text: `Account ${username} unlocked successfully!` });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to unlock account",
      });
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Status Management</h1>
          <p className="text-muted">Activate or deactivate user accounts</p>
        </div>
        <Button onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder="Username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="fullstack_domain_owner">Fullstack Domain Owner</option>
                <option value="cyber_domain_owner">Cyber Domain Owner</option>
                <option value="cloud_devops_domain_owner">Cloud/DevOps Domain Owner</option>
                <option value="ml_domain_owner">ML Domain Owner</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted">
              Loading users...
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted">
              No users found matching your filters.
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{user.full_name || user.username}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {user.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                      {isExpired(user.account_expires_at) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                          EXPIRED
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted">
                      <div>
                        <span className="font-medium">Username:</span> {user.username}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Roles:</span>{" "}
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-block px-2 py-0.5 mr-1 rounded bg-secondary text-xs"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      {user.last_login_at && (
                        <div>
                          <span className="font-medium">Last Login:</span>{" "}
                          {new Date(user.last_login_at).toLocaleString()}
                        </div>
                      )}
                      {user.account_expires_at && (
                        <div>
                          <span className="font-medium">Expires:</span>{" "}
                          {new Date(user.account_expires_at).toLocaleString()}
                          {isExpired(user.account_expires_at) && (
                            <span className="text-warning font-semibold ml-2">(Expired)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user.is_active ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeactivate(user.id, user.username)}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleActivate(user.id, user.username)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlock(user.id, user.username)}
                    >
                      Unlock
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
