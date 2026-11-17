import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, Users, Store, Flag, LogOut, Plus
} from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/format";
import { adminService } from "../services/adminService";
import type { AdminOverview } from "../services/adminService";
import type { User, ProviderSummary, UserRole } from "../types";

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "providers">("overview");
  const [stats, setStats] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Fetch Real Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [overviewData, usersData, providersData] = await Promise.all([
          adminService.getOverview(),
          adminService.getAllUsers(),
          adminService.getPendingProviders()
        ]);
        setStats(overviewData);
        setUsers(usersData);
        setProviders(providersData);
      } catch (err: any) {
        // If we get a 401, we are not logged in as Admin
        if (err.status === 401) {
          setError("401_UNAUTHORIZED");
        } else {
          setError(err.message || "Failed to load admin data.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // --- HANDLERS ---
  const handleProviderAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await adminService.approveProviderListing(id);
      } else {
        await adminService.rejectProviderListing(id);
      }
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(`Failed to ${action} provider.`);
    }
  };

  const handleBanUser = async (id: string) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await adminService.updateUserStatus(id, "ban");
      alert("User banned.");
    } catch (err) {
      alert("Failed to ban user.");
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const submitRoleChange = async () => {
    if (!selectedUser) return;
    try {
      await adminService.changeUserRole(selectedUser.id, newRole as UserRole);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole as UserRole } : u));
      setIsRoleModalOpen(false);
    } catch (err) {
      alert("Failed to change role.");
    }
  };

  const submitNewAdmin = async () => {
    if (!newAdminEmail) return;
    try {
      // Note: If the backend requires a password to create an admin, you must add it here.
      const newUser = await adminService.createAdmin({ fullName: "New Admin", email: newAdminEmail });
      setUsers([newUser, ...users]);
      setIsAdminModalOpen(false);
      setNewAdminEmail("");
    } catch (err) {
      alert("Failed to create admin.");
    }
  };

  // --- TEMPORARY ADMIN LOGIN BYPASS ---
  // If the backend auth is not ready, you can click this button to force your way in.
  if (error === "401_UNAUTHORIZED") {
    return (
      <div className="container py-5 text-center">
        <h1 className="display-heading text-danger mb-3">401 UNAUTHORIZED</h1>
        <p className="text-muted-ink mb-4">You are not logged in as an Administrator.</p>
        
        <button 
          className="btn btn-athletic mb-3"
          onClick={() => {
            // Fake Admin Login for testing
            localStorage.setItem("user", JSON.stringify({
              id: "admin-1", fullName: "Admin User", email: "admin@test.com", role: "admin"
            }));
            window.location.reload();
          }}
        >
          Force Admin Login (Test Only)
        </button>
        
        <br />
        <button className="btn btn-trade" onClick={() => navigate("/login")}>Go to Real Login Page</button>
      </div>
    );
  }

  if (loading) return <div className="p-5 text-center text-muted-ink">Loading Admin Data...</div>;
  if (error) return <div className="p-5 text-center text-danger">{error}</div>;

  return (
    <div className="container-fluid py-5 px-4 px-md-5" style={{ width: "100%", maxWidth: 1400, margin: 0, textAlign: "left" }}>
      
      <header className="mb-4">
        <Eyebrow>System Administration</Eyebrow>
        <h1 className="mb-0" style={{ lineHeight: 1 }}>
          <span className="display-heading" style={{ fontSize: "72px", color: "var(--ink)" }}>ADMIN</span>{" "}
          <span className="display-heading" style={{ fontSize: "48px", color: "var(--primary)" }}>DASHBOARD.</span>
        </h1>
      </header>

      {/* TABS NAVIGATION */}
      <div className="tab-strip mb-4" role="tablist">
        <button role="tab" aria-selected={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
          Overview
        </button>
        <button role="tab" aria-selected={activeTab === "users"} onClick={() => setActiveTab("users")}>
          User Management
        </button>
        <button role="tab" aria-selected={activeTab === "providers"} onClick={() => setActiveTab("providers")}>
          Provider Moderation ({providers.length})
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && stats && (
        <div className="row g-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--primary)" }}><Users size={24} /></div>
              <div>
                <div className="stat-card-number">{stats.totalUsers || 0}</div>
                <div className="stat-card-label">Total Users</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--ink)" }}><Store size={24} /></div>
              <div>
                <div className="stat-card-number">{stats.totalProviders || 0}</div>
                <div className="stat-card-label">Active Providers</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--primary)" }}><ShieldAlert size={24} /></div>
              <div>
                <div className="stat-card-number">{stats.pendingListings || 0}</div>
                <div className="stat-card-label">Pending Listings</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--destructive)" }}><Flag size={24} /></div>
              <div>
                <div className="stat-card-number">{stats.reportedUsers || 0}</div>
                <div className="stat-card-label">Reported Users</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === "users" && (
        <div className="surface-box p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-label mb-0">All Registered Users</h2>
            <button className="btn btn-athletic btn-sm d-flex gap-2" onClick={() => setIsAdminModalOpen(true)}>
              <Plus size={16} /> Create Admin
            </button>
          </div>
          <ul className="list-unstyled mb-0">
            {users.map((u) => (
              <li key={u.id} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div>
                  <div className="fw-bold">{u.fullName}</div>
                  <div className="small text-muted-ink">{u.email} · Joined {formatDate(u.createdAt)}</div>
                  <span className={`badge mt-1 text-uppercase ${u.role === 'admin' ? 'text-bg-dark' : u.role === 'provider' ? 'text-bg-primary' : 'text-bg-secondary'}`}>
                    {u.role}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <button onClick={() => openRoleModal(u)} className="btn btn-sm btn-outline-dark">
                    Change Role
                  </button>
                  {u.role !== "admin" && (
                    <button onClick={() => handleBanUser(u.id)} className="btn btn-sm btn-outline-danger">
                      Ban
                    </button>
                  )}
                </div>
              </li>
            ))}
            {users.length === 0 && (
              <li className="text-center py-4 text-muted-ink">No users found.</li>
            )}
          </ul>
        </div>
      )}

      {/* TAB: PROVIDERS */}
      {activeTab === "providers" && (
        <div className="surface-box p-4">
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
                {providers.map((prov) => (
                  <tr key={prov.id}>
                    <td>
                      <div className="fw-bold">{prov.name}</div>
                      <div className="small text-muted-ink">{prov.description}</div>
                    </td>
                    <td>{prov.category}</td>
                    <td>{prov.serviceArea}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => handleProviderAction(prov.id, "approve")} className="btn btn-sm btn-outline-success">Approve</button>
                        <button onClick={() => handleProviderAction(prov.id, "reject")} className="btn btn-sm btn-outline-danger">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-ink">All caught up!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sign Out Section */}
      <section className="surface-box p-4 mt-5 mb-4" style={{ maxWidth: 500 }}>
        <h3 className="section-label">Admin Account</h3>
        <button
          type="button"
          className="btn btn-danger-outline d-flex align-items-center gap-2 mt-3"
          onClick={onLogout}
        >
          <LogOut size={16} /> Sign out
        </button>
      </section>

      {/* MODALS */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Change User Role">
        <p>Update the role for <strong>{selectedUser?.fullName}</strong></p>
        <select className="form-select mb-4" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="resident">Resident</option>
          <option value="provider">Service Provider</option>
          <option value="admin">Administrator</option>
        </select>
        <button className="btn btn-athletic w-100" onClick={submitRoleChange}>Save Changes</button>
      </Modal>

      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Create Administrator">
        <p>Enter the email of the user you want to promote to Admin.</p>
        <input 
          type="email" 
          className="form-control mb-4" 
          placeholder="user@example.com" 
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
        />
        <button className="btn btn-athletic w-100" onClick={submitNewAdmin}>Create Admin</button>
      </Modal>

    </div>
  );
}