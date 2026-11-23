import { useEffect, useState, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Flag,
  LogOut,
  Plus,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { adminService } from "../services/adminService";
import type { AdminOverview } from "../services/adminService";
import type { ProviderSummary, User, UserRole } from "../types";
import { formatDate } from "../utils/format";

type AdminTab = "overview" | "users" | "providers";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>(
    location.pathname === "/admin/management" ? "providers" : "overview",
  );
  const [stats, setStats] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("resident");
  
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [overview, allUsers, pendingProviders] = await Promise.all([
          adminService.getOverview(),
          adminService.getAllUsers(),
          adminService.getPendingProviders(),
        ]);
        if (!active) return;
        setStats(overview);
        setUsers(allUsers);
        setProviders(pendingProviders);
      } catch (loadError: unknown) {
        if (!active) return;
        console.error("Could not load administrator data.", loadError);
        setError(
          isAxiosError(loadError) &&
            (loadError.response?.status === 401 || loadError.response?.status === 403)
            ? "You are not authorized to view administrator data."
            : "We could not load administrator data. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  async function handleProviderAction(provider: ProviderSummary, action: "approve" | "reject") {
    setActionError("");
    setNotice("");
    try {
      if (action === "approve") {
        await adminService.approveProviderListing(provider.id);
      } else {
        await adminService.rejectProviderListing(provider.id);
      }
      setProviders((current) => current.filter((item) => item.id !== provider.id));
      setNotice(`Provider ${action === "approve" ? "approved" : "rejected"}.`);
    } catch (actionFailure) {
      console.error(`Could not ${action} provider listing.`, actionFailure);
      setActionError("We could not update that provider. Please try again.");
    }
  }

  async function handleBanUser(target: User) {
    if (!window.confirm(`Ban ${target.fullName}?`)) return;
    setActionError("");
    setNotice("");
    try {
      await adminService.updateUserStatus(target.id, "ban");
      setUsers((current) => current.filter((item) => item.id !== target.id));
      setNotice("User banned.");
    } catch (actionFailure) {
      console.error("Could not ban user.", actionFailure);
      setActionError("We could not update that account. Please try again.");
    }
  }

  function openRoleModal(target: User) {
    setSelectedUser(target);
    setNewRole(target.role);
    setActionError("");
    setIsRoleModalOpen(true);
  }

  async function submitRoleChange() {
    if (!selectedUser) return;
    setActionError("");
    try {
      await adminService.changeUserRole(selectedUser.id, newRole);
      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id ? { ...item, role: newRole } : item,
        ),
      );
      setIsRoleModalOpen(false);
      setNotice("User role updated.");
    } catch (actionFailure) {
      console.error("Could not change user role.", actionFailure);
      setActionError("We could not change this user's role. Please try again.");
    }
  }

  async function submitNewAdmin() {
    setAdminError("");
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      setAdminError("Enter a name and an email address.");
      return;
    }
    if (newAdminPassword.length < 8) {
      setAdminError("Password must be at least 8 characters.");
      return;
    }
    try {
      setAdminSaving(true);
      const newUser = await adminService.createAdmin({
        fullName: newAdminName.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword,
      });
      setUsers((current) => [newUser, ...current]);
      setIsAdminModalOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNotice("Administrator created.");
    } catch (error) {
      console.error("Could not create administrator.", error);
      const message = isAxiosError<{ message?: string | string[] }>(error)
        ? error.response?.data?.message
        : undefined;
      setAdminError(
        Array.isArray(message)
          ? message.join(" ")
          : message ?? (error instanceof Error ? error.message : "Failed to create admin."),
      );
    } finally {
      setAdminSaving(false);
    }
  }

  return (
    <main className="container-fluid py-5 px-4 px-md-5" style={{ width: "100%", maxWidth: 1400, margin: 0, textAlign: "left" }}>
      <header className="mb-4">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div>
            <Eyebrow>System Administration</Eyebrow>
            <h1 className="mb-0" style={{ lineHeight: 1 }}>
              <span className="display-heading" style={{ fontSize: "clamp(42px, 8vw, 72px)", color: "var(--ink)" }}>ADMIN</span>{" "}
              <span className="display-heading" style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--primary)" }}>DASHBOARD.</span>
            </h1>
          </div>
          <Link className="btn btn-outline-dark" to="/admin/profile">My Profile</Link>
        </div>
      </header>

      <div className="tab-strip mb-4" role="tablist">
        <button role="tab" aria-selected={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</button>
        <button role="tab" aria-selected={activeTab === "users"} onClick={() => setActiveTab("users")}>User Management</button>
        <button role="tab" aria-selected={activeTab === "providers"} onClick={() => setActiveTab("providers")}>Provider Moderation ({providers.length})</button>
      </div>

      {actionError && <div className="alert alert-danger" role="alert">{actionError}</div>}
      {notice && <p className="status-line mb-4" role="status">{notice}</p>}

      {loading ? (
        <p className="p-4 text-center text-muted-ink" role="status">Loading admin data...</p>
      ) : error ? (
        <div className="alert alert-danger" role="alert">{error}</div>
      ) : (
        <>
          {activeTab === "overview" && stats && (
            <div className="row g-4">
              <StatCard label="Total Users" value={stats.totalUsers} icon={<Users size={24} />} color="var(--primary)" />
              <StatCard label="Active Providers" value={stats.totalProviders} icon={<Store size={24} />} color="var(--ink)" />
              <StatCard label="Pending Listings" value={stats.pendingListings} icon={<ShieldAlert size={24} />} color="var(--primary)" />
              <StatCard label="Reported Users" value={stats.reportedUsers} icon={<Flag size={24} />} color="var(--destructive)" />
            </div>
          )}

          {activeTab === "users" && (
            <section className="surface-box p-4">
              <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">
                <h2 className="section-label mb-0">All Registered Users</h2>
                <button type="button" className="btn btn-athletic btn-sm d-flex gap-2" onClick={() => { setActionError(""); setIsAdminModalOpen(true); }}>
                  <Plus size={16} /> Create Admin
                </button>
              </div>
              <ul className="list-unstyled mb-0">
                {users.map((item) => (
                  <li key={item.id} className="d-flex align-items-center justify-content-between gap-3 flex-wrap py-3 border-bottom">
                    <div>
                      <div className="fw-bold">{item.fullName}</div>
                      <div className="small text-muted-ink">{item.email} · Joined {formatDate(item.createdAt)}</div>
                      <span className={`badge mt-1 text-uppercase ${item.role === "admin" ? "text-bg-dark" : item.role === "provider" ? "text-bg-primary" : "text-bg-secondary"}`}>
                        {item.role}
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="button" onClick={() => openRoleModal(item)} className="btn btn-sm btn-outline-dark">Change Role</button>
                      {item.role !== "admin" && (
                        <button type="button" onClick={() => void handleBanUser(item)} className="btn btn-sm btn-outline-danger">Ban</button>
                      )}
                    </div>
                  </li>
                ))}
                {users.length === 0 && <li className="text-center py-4 text-muted-ink">No users found.</li>}
              </ul>
            </section>
          )}

          {activeTab === "providers" && (
            <section className="surface-box p-4">
              <h2 className="section-label mb-4">Pending Provider Listings</h2>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Provider Name</th>
                      <th>Category</th>
                      <th>Area</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id}>
                        <td>
                          <div className="fw-bold">{provider.name}</div>
                          <div className="small text-muted-ink">{provider.description}</div>
                        </td>
                        <td>{provider.category}</td>
                        <td>{provider.serviceArea ?? "Not provided"}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button type="button" onClick={() => void handleProviderAction(provider, "approve")} className="btn btn-sm btn-outline-success">Approve</button>
                            <button type="button" onClick={() => void handleProviderAction(provider, "reject")} className="btn btn-sm btn-outline-danger">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {providers.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-muted-ink">All caught up!</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <section className="surface-box p-4 mt-5 mb-4" style={{ maxWidth: 500 }}>
        <h2 className="section-label">Admin Account</h2>
        <p className="text-muted-ink small">Signed in as <strong>{user?.email}</strong>.</p>
        <button type="button" className="btn btn-danger-outline d-flex align-items-center gap-2 mt-3" onClick={() => void handleLogout()}>
          <LogOut size={16} /> Sign out
        </button>
      </section>

      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Change User Role">
        <p>Update the role for <strong>{selectedUser?.fullName}</strong></p>
        <select className="form-select mb-4" value={newRole} onChange={(event) => { const value = event.currentTarget.value; if (value === "resident" || value === "provider" || value === "admin") { setNewRole(value); } }}>
          <option value="resident">Resident</option>
          <option value="provider">Service Provider</option>
          <option value="admin">Administrator</option>
        </select>
        <button type="button" className="btn btn-athletic w-100" onClick={() => void submitRoleChange()}>Save Changes</button>
      </Modal>

      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Create Administrator">
        <p>Create a new administrator account.</p>
        <input type="text" className="form-control mb-3" placeholder="Full name" autoComplete="off" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} />
        <input type="email" className="form-control mb-3" placeholder="admin@example.com" autoComplete="off" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
        <input type="password" className="form-control mb-3" placeholder="Password (at least 8 characters)" autoComplete="new-password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} />
        {adminError && <p className="text-danger small mb-3" role="alert">{adminError}</p>}
        <button className="btn btn-athletic w-100" onClick={submitNewAdmin} disabled={adminSaving}>
          {adminSaving ? "Creating..." : "Create Admin"}
        </button>
      </Modal>
    </main>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: ReactNode; color: string; }) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="surface-box p-4 d-flex align-items-center gap-3">
        <div className="p-3 rounded-circle text-white" style={{ background: color }} aria-hidden="true">{icon}</div>
        <div>
          <div className="stat-card-number">{value || 0}</div>
          <div className="stat-card-label">{label}</div>
        </div>
      </div>
    </div>
  );
}