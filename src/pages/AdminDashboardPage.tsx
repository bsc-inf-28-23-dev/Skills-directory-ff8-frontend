import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, Users, Store, Flag, CheckCircle, XCircle, LogOut, UserCog, Trash2, Plus
} from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/format";
import type { User, ProviderSummary } from "../types";

// --- MOCK DATA ---
const INITIAL_USERS: User[] = [
  { id: "u1", fullName: "John Banda", email: "john@test.com", role: "resident", createdAt: new Date().toISOString() },
  { id: "u2", fullName: "Mary Phiri", email: "mary@test.com", role: "provider", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "u3", fullName: "Admin Main", email: "admin@test.com", role: "admin", createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
];

const INITIAL_PROVIDERS: ProviderSummary[] = [
  { id: "p1", name: "Bright Spark", category: "Electrical", serviceArea: "Lilongwe", description: "Certified electrician." },
  { id: "p2", name: "Zomba Plumbing", category: "Plumbing", serviceArea: "Zomba", description: "Emergency repairs." },
];

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "providers">("overview");
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [providers, setProviders] = useState<ProviderSummary[]>(INITIAL_PROVIDERS);
  
  // Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  
  // Fake New Admin Form
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // --- HANDLERS ---
  const handleProviderAction = (id: string, action: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  const handleBanUser = (id: string) => {
    if (!window.confirm("Ban this user?")) return;
    alert("User banned.");
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const submitRoleChange = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole as any } : u));
    setIsRoleModalOpen(false);
  };

  const submitNewAdmin = () => {
    if (!newAdminEmail) return;
    const newUser: User = {
      id: `u${Date.now()}`,
      fullName: "New Admin",
      email: newAdminEmail,
      role: "admin",
      createdAt: new Date().toISOString()
    };
    setUsers([newUser, ...users]);
    setIsAdminModalOpen(false);
    setNewAdminEmail("");
  };

  // --- RENDER TABS ---
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
      {activeTab === "overview" && (
        <div className="row g-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--primary)" }}><Users size={24} /></div>
              <div>
                <div className="stat-card-number">{users.length}</div>
                <div className="stat-card-label">Total Users</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--ink)" }}><Store size={24} /></div>
              <div>
                <div className="stat-card-number">{providers.length}</div>
                <div className="stat-card-label">Active Providers</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--primary)" }}><ShieldAlert size={24} /></div>
              <div>
                <div className="stat-card-number">{providers.length}</div>
                <div className="stat-card-label">Pending Listings</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="surface-box p-4 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ background: "var(--destructive)" }}><Flag size={24} /></div>
              <div>
                <div className="stat-card-number">0</div>
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

      {/* Sign Out Section at the bottom */}
      <section className="surface-box p-4 mt-5 mb-4" style={{ maxWidth: 500 }}>
        <h3 className="section-label">Admin Account</h3>
        <p className="text-muted-ink small mb-3">
          Signed in as an Administrator.
        </p>
        <button
          type="button"
          className="btn btn-danger-outline d-flex align-items-center gap-2"
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