import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { UserPlus, Users } from "lucide-react";

interface Department {
  id: number;
  name: string;
  code: string;
}

export function CreateAccounts() {
  const [activeTab, setActiveTab] = useState<"student" | "staff">("student");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Student form fields
  const [studentForm, setStudentForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    password: "",
    department_id: "",
    curr_sem: "",
    reg_num: "",
    roll_number: "",
    account_expires_at: "",
  });

  // Staff form fields
  const [staffForm, setStaffForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    roles: [] as string[],
    emp_id: "",
  });

  const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({
    admin: false,
    fullstack_domain_owner: false,
    cyber_domain_owner: false,
    cloud_devops_domain_owner: false,
    ml_domain_owner: false,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...studentForm,
        department_id: parseInt(studentForm.department_id),
        curr_sem: parseInt(studentForm.curr_sem),
        account_expires_at: studentForm.account_expires_at
          ? new Date(studentForm.account_expires_at).toISOString()
          : null,
      };

      await api.post("/users/students", payload);
      setMessage({ type: "success", text: "Student account created successfully!" });

      // Reset form
      setStudentForm({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        password: "",
        department_id: "",
        curr_sem: "",
        reg_num: "",
        roll_number: "",
        account_expires_at: "",
      });
    } catch (err: any) {
      console.error("Student creation error:", err);
      let errorMsg = "Failed to create student account";

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
        } else {
          errorMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const roles = Object.entries(selectedRoles)
        .filter(([_, checked]) => checked)
        .map(([role]) => role);

      if (roles.length === 0) {
        setMessage({ type: "error", text: "Please select at least one role" });
        setLoading(false);
        return;
      }

      const payload = {
        username: staffForm.username,
        email: staffForm.email,
        full_name: staffForm.full_name,
        phone: staffForm.phone || null,
        roles: roles,
        emp_id: staffForm.emp_id || null,
      };

      const res = await api.post("/users", payload);
      const tempPassword = res.data.temporary_password;

      setMessage({
        type: "success",
        text: `Staff account created! Temporary password: ${tempPassword || "N/A"} (share with the user)`,
      });

      // Reset form
      setStaffForm({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        roles: [],
        emp_id: "",
      });
      setSelectedRoles({
        admin: false,
        fullstack_domain_owner: false,
        cyber_domain_owner: false,
        cloud_devops_domain_owner: false,
        ml_domain_owner: false,
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to create staff account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Accounts</h1>
          <p className="text-muted">Create student and domain incharge accounts</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => {
            setActiveTab("student");
            setMessage(null);
          }}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "student"
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-primary"
          }`}
        >
          <Users className="inline w-4 h-4 mr-2" />
          Create Student
        </button>
        <button
          onClick={() => {
            setActiveTab("staff");
            setMessage(null);
          }}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "staff"
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-primary"
          }`}
        >
          <UserPlus className="inline w-4 h-4 mr-2" />
          Create Domain Incharge
        </button>
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

      {/* Student Form */}
      {activeTab === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Student Account</CardTitle>
            <CardDescription>Fill in the student details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-username">Username *</Label>
                  <Input
                    id="student-username"
                    value={studentForm.username}
                    onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-email">Email *</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-fullname">Full Name *</Label>
                  <Input
                    id="student-fullname"
                    value={studentForm.full_name}
                    onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-phone">Phone</Label>
                  <Input
                    id="student-phone"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password">Password *</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-department">Department *</Label>
                  <select
                    id="student-department"
                    className="w-full border border-border rounded-lg px-3 py-2"
                    value={studentForm.department_id}
                    onChange={(e) => setStudentForm({ ...studentForm, department_id: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.code} - {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-semester">Current Semester (1-10) *</Label>
                  <Input
                    id="student-semester"
                    type="number"
                    min="1"
                    max="10"
                    value={studentForm.curr_sem}
                    onChange={(e) => setStudentForm({ ...studentForm, curr_sem: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-regno">Registration Number *</Label>
                  <Input
                    id="student-regno"
                    value={studentForm.reg_num}
                    onChange={(e) => setStudentForm({ ...studentForm, reg_num: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-rollno">Roll Number</Label>
                  <Input
                    id="student-rollno"
                    value={studentForm.roll_number}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-expires">Account Expires At</Label>
                  <Input
                    id="student-expires"
                    type="datetime-local"
                    value={studentForm.account_expires_at}
                    onChange={(e) => setStudentForm({ ...studentForm, account_expires_at: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Student Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff Form */}
      {activeTab === "staff" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Domain Incharge Account</CardTitle>
            <CardDescription>Create an admin or domain owner account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-username">Username *</Label>
                  <Input
                    id="staff-username"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email *</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-fullname">Full Name *</Label>
                  <Input
                    id="staff-fullname"
                    value={staffForm.full_name}
                    onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Phone</Label>
                  <Input
                    id="staff-phone"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-empid">Employee ID</Label>
                  <Input
                    id="staff-empid"
                    value={staffForm.emp_id}
                    onChange={(e) => setStaffForm({ ...staffForm, emp_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Roles * (Select at least one)</Label>
                <div className="space-y-2 border border-border rounded-lg p-4">
                  {Object.entries(selectedRoles).map(([role, checked]) => (
                    <label key={role} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelectedRoles({ ...selectedRoles, [role]: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span>
                        {role === "admin"
                          ? "Admin"
                          : role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Staff Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
