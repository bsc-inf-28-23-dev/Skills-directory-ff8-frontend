import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell, BriefcaseBusiness, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, Clock3, LayoutDashboard, LogOut, Menu,
  MessageSquareWarning, Search, Settings2, ShieldCheck, Star, Store,
  UserRound, Users, X, XCircle
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { adminService } from "../services/adminService";
import type { AdminOverview } from "../services/adminService";
import type { ProviderSummary, User } from "../types";
import "./AdminDashboardPage.css";

type ManagementTab = "provider-approval" | "users" | "providers" | "services" | "complaints" | "reviews";

const managementTabs: { id: ManagementTab; label: string; icon: typeof Users }[] = [
  { id: "provider-approval", label: "Provider Approval", icon: ShieldCheck },
  { id: "users", label: "User Management", icon: Users },
  { id: "providers", label: "Provider Management", icon: Store },
  { id: "services", label: "Service Management", icon: BriefcaseBusiness },
  { id: "complaints", label: "Complaints & Reports", icon: MessageSquareWarning },
  { id: "reviews", label: "Reviews & Ratings", icon: Star },
];

const sampleServices = [
  { id: "1", name: "Emergency Electrical Repairs", provider: "Brightline Electrical", category: "Electrical", price: "From R450", location: "Cape Town", status: "Pending", date: "18 Nov 2026" },
  { id: "2", name: "Residential Plumbing", provider: "FlowRight Plumbing", category: "Plumbing", price: "From R350", location: "Bellville", status: "Active", date: "16 Nov 2026" },
  { id: "3", name: "Garden Maintenance", provider: "GreenScape Services", category: "Gardening", price: "R280/hr", location: "Durbanville", status: "Rejected", date: "14 Nov 2026" },
];

const sampleComplaints = [
  { id: "CMP-1048", reporter: "Naledi M.", reported: "Brightline Electrical", category: "Poor service delivery", service: "Emergency Electrical Repairs", date: "18 Nov 2026", status: "New" },
  { id: "CMP-1044", reporter: "Thabo K.", reported: "FlowRight Plumbing", category: "Misleading advertisement", service: "Residential Plumbing", date: "17 Nov 2026", status: "Under Investigation" },
];

const sampleReviews = [
  { id: "1", customer: "Aisha Daniels", provider: "Brightline Electrical", service: "Electrical Repairs", rating: 5, text: "Fast response and excellent workmanship.", date: "18 Nov 2026", reported: false },
  { id: "2", customer: "John Petersen", provider: "FlowRight Plumbing", service: "Leak Repair", rating: 2, text: "The appointment was rescheduled twice.", date: "15 Nov 2026", reported: true },
];

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase().replace(/\s+/g, "-");
  return <span className={`admin-status admin-status--${normalized}`}>{value}</span>;
}

function initialAvatar(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isManagement = location.pathname === "/admin/management";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ManagementTab>("provider-approval");
  const [stats, setStats] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => void; danger?: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [overview, allUsers, pendingProviders] = await Promise.all([
          adminService.getOverview(),
          adminService.getAllUsers(),
          adminService.getPendingProviders(),
        ]);
        if (!active) return;
        setStats(overview);
        setUsers(allUsers);
        setProviders(pendingProviders);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load administrator data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, tone: "blue" },
    { label: "Total Providers", value: stats?.totalProviders ?? 0, icon: Store, tone: "orange" },
    { label: "Pending Approvals", value: providers.length, icon: Clock3, tone: "amber" },
    { label: "Active Services", value: 128, icon: BriefcaseBusiness, tone: "green" },
    { label: "Open Complaints", value: 3, icon: CircleAlert, tone: "red" },
  ];

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((item) => `${item.fullName} ${item.email} ${item.phone ?? ""}`.toLowerCase().includes(term));
  }, [search, users]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function openManagement(tab: ManagementTab = "provider-approval") {
    setActiveTab(tab);
    navigate("/admin/management");
    setSidebarOpen(false);
  }

  async function providerAction(provider: ProviderSummary, action: "approve" | "reject") {
    setConfirm({
      title: action === "approve" ? "Approve provider?" : "Reject provider?",
      message: action === "approve"
        ? `${provider.name} will be verified and notified.`
        : `Provide a reason and reject ${provider.name}'s application.`,
      danger: action === "reject",
      action: async () => {
        try {
          if (action === "approve") await adminService.approveProviderListing(provider.id);
          else await adminService.rejectProviderListing(provider.id);
          setProviders((current) => current.filter((item) => item.id !== provider.id));
          setToast(`Provider ${action === "approve" ? "approved" : "rejected"} successfully.`);
        } catch {
          setToast(`Unable to ${action} provider.`);
        }
      },
    });
  }

  function renderTableEmpty(message: string, columns: number) {
    return <tr><td colSpan={columns} className="admin-empty">{message}</td></tr>;
  }

  function ProviderApproval() {
    const [filter, setFilter] = useState("Pending");
    return (
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div><h2>Provider Approval</h2><p>Review and verify newly registered providers</p></div>
          <div className="admin-filter-tabs">
            {["Pending", "Approved", "Rejected", "All"].map((item) => (
              <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Provider</th><th>Business</th><th>Contact</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td><div className="admin-person"><span className="admin-avatar">{initialAvatar(provider.name)}</span><strong>{provider.name}</strong></div></td>
                  <td><strong>{provider.name}</strong><small>{provider.category}</small></td>
                  <td><small>{provider.serviceArea ?? "Location not provided"}</small></td>
                  <td>18 Nov 2026</td><td><StatusBadge value="Pending" /></td>
                  <td><div className="admin-row-actions"><button className="admin-icon-button" title="View details"><ChevronRight size={17} /></button><button className="admin-action approve" onClick={() => providerAction(provider, "approve")}><CheckCircle2 size={15} />Approve</button><button className="admin-action reject" onClick={() => providerAction(provider, "reject")}><XCircle size={15} />Reject</button></div></td>
                </tr>
              ))}
              {providers.length === 0 && renderTableEmpty("No provider applications match this view.", 6)}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function UserManagement() {
    const [role, setRole] = useState("All roles");
    const [status, setStatus] = useState("All statuses");
    return (
      <section className="admin-panel">
        <div className="admin-panel__header"><div><h2>User Management</h2><p>Manage residents, providers and administrator accounts</p></div></div>
        <div className="admin-controls"><label className="admin-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" /></label><select value={role} onChange={(e) => setRole(e.target.value)}><option>All roles</option><option>Resident</option><option>Service Provider</option><option>Administrator</option></select><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All statuses</option><option>Active</option><option>Suspended</option></select></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {filteredUsers.filter((item) => role === "All roles" || item.role === role.toLowerCase().replace("service ", "")).map((item) => (
            <tr key={item.id}><td><div className="admin-person"><span className="admin-avatar">{initialAvatar(item.fullName)}</span><strong>{item.fullName}</strong></div></td><td>{item.email}</td><td><span className="admin-role">{item.role}</span></td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-ZA") : "—"}</td><td><StatusBadge value="Active" /></td><td><div className="admin-row-actions"><button className="admin-icon-button" title="View details"><ChevronRight size={17} /></button>{item.role !== "admin" && <button className="admin-action reject" onClick={() => setConfirm({title:"Suspend account?", message:`Suspend ${item.fullName}?`, danger:true, action:()=>setToast("Account suspended.")})}>Suspend</button>}</div></td></tr>
          ))}
          {filteredUsers.length === 0 && renderTableEmpty("No users found.", 6)}
        </tbody></table></div>
      </section>
    );
  }

  function ProviderManagement() {
    const [query, setQuery] = useState("");
    const listed = users.filter((item) => item.role === "provider" && `${item.fullName} ${item.email}`.toLowerCase().includes(query.toLowerCase()));
    return (
      <section className="admin-panel"><div className="admin-panel__header"><div><h2>Provider Management</h2><p>Manage verified businesses and account status</p></div></div><div className="admin-controls"><label className="admin-search"><Search size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search providers" /></label><select><option>All verification statuses</option><option>Verified</option><option>Pending</option></select><select><option>All account statuses</option><option>Active</option><option>Suspended</option></select></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Provider</th><th>Contact</th><th>Verification</th><th>Services</th><th>Rating</th><th>Account</th><th>Actions</th></tr></thead><tbody>
        {listed.map((item)=><tr key={item.id}><td><div className="admin-person"><span className="admin-avatar">{initialAvatar(item.fullName)}</span><strong>{item.fullName}</strong></div></td><td>{item.email}</td><td><StatusBadge value="Verified"/></td><td>{providers.length}</td><td><span className="admin-rating"><Star size={14} fill="currentColor"/> 4.8</span></td><td><StatusBadge value="Active"/></td><td><button className="admin-icon-button" title="View provider"><ChevronRight size={17}/></button></td></tr>)}
        {listed.length===0&&renderTableEmpty("No providers found.",7)}
      </tbody></table></div></section>
    );
  }

  function ServiceManagement() {
    const [filter, setFilter] = useState("All services");
    const [rows, setRows] = useState(sampleServices);
    const visible = rows.filter((item) => filter==="All services" || item.status===filter.replace(" services","").replace(" approval",""));
    return <section className="admin-panel"><div className="admin-panel__header"><div><h2>Service Management</h2><p>Moderate listings across the marketplace</p></div></div><div className="admin-controls"><label className="admin-search"><Search size={16}/><input placeholder="Search services" /></label><select value={filter} onChange={(e)=>setFilter(e.target.value)}><option>All services</option><option>Pending approval</option><option>Active</option><option>Inactive</option><option>Rejected</option></select></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Service</th><th>Provider</th><th>Category</th><th>Price</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((item)=><tr key={item.id}><td><strong>{item.name}</strong><small>{item.date}</small></td><td>{item.provider}</td><td>{item.category}</td><td>{item.price}</td><td>{item.location}</td><td><StatusBadge value={item.status}/></td><td><div className="admin-row-actions"><button className="admin-icon-button"><ChevronRight size={17}/></button>{item.status==="Pending"&&<><button className="admin-action approve" onClick={()=>{setRows((r)=>r.map((x)=>x.id===item.id?{...x,status:"Active"}:x));setToast("Service approved.");}}>Approve</button><button className="admin-action reject" onClick={()=>setConfirm({title:"Reject service?",message:"A rejection reason is required.",danger:true,action:()=>{setRows((r)=>r.map((x)=>x.id===item.id?{...x,status:"Rejected"}:x));setToast("Service rejected.");}})}>Reject</button></>}</div></td></tr>)}{visible.length===0&&renderTableEmpty("No services found.",7)}</tbody></table></div></section>;
  }

  function Complaints() {
    const [rows, setRows] = useState(sampleComplaints);
    return <section className="admin-panel"><div className="admin-panel__header"><div><h2>Complaints & Reports</h2><p>Investigate platform reports and take appropriate action</p></div></div><div className="admin-controls"><label className="admin-search"><Search size={16}/><input placeholder="Search complaints" /></label><select><option>All statuses</option><option>New</option><option>Under Investigation</option><option>Resolved</option></select></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reference</th><th>Reporter</th><th>Reported User</th><th>Category</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((item)=><tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.reporter}</td><td>{item.reported}</td><td>{item.category}</td><td>{item.date}</td><td><StatusBadge value={item.status}/></td><td><div className="admin-row-actions"><button className="admin-icon-button"><ChevronRight size={17}/></button><button className="admin-action approve" onClick={()=>{setRows((r)=>r.map((x)=>x.id===item.id?{...x,status:"Resolved"}:x));setToast("Complaint resolved.");}}>Resolve</button></div></td></tr>)}</tbody></table></div></section>;
  }

  function Reviews() {
    const [rows, setRows] = useState(sampleReviews);
    return <section className="admin-panel"><div className="admin-panel__header"><div><h2>Reviews & Ratings</h2><p>Monitor feedback and investigate policy violations</p></div></div><div className="admin-controls"><label className="admin-search"><Search size={16}/><input placeholder="Search reviews" /></label><select><option>All ratings</option><option>5 stars</option><option>4 stars</option><option>3 stars</option><option>2 stars</option><option>1 star</option></select><select><option>All reviews</option><option>Reported only</option></select></div><div className="admin-review-list">{rows.map((item)=><article className="admin-review" key={item.id}><div className="admin-review__top"><div className="admin-person"><span className="admin-avatar">{initialAvatar(item.customer)}</span><div><strong>{item.customer}</strong><small>Reviewed {item.provider}</small></div></div><div className="admin-review__stars" aria-label={`${item.rating} stars`}>{[1,2,3,4,5].map((star)=><Star key={star} size={16} fill={star<=item.rating?"currentColor":"none"}/>)}</div></div><p>{item.text}</p><div className="admin-review__footer"><span>{item.date} · {item.service}</span>{item.reported?<button className="admin-action reject" onClick={()=>setConfirm({title:"Remove review?",message:"The removal will be recorded with a moderation reason.",danger:true,action:()=>{setRows((r)=>r.filter((x)=>x.id!==item.id));setToast("Review removed.");}})}>Remove review</button>:<StatusBadge value="Genuine"/>}</div></article>)}</div></section>;
  }

  function renderManagementTab() {
    if (activeTab === "users") return <UserManagement />;
    if (activeTab === "providers") return <ProviderManagement />;
    if (activeTab === "services") return <ServiceManagement />;
    if (activeTab === "complaints") return <Complaints />;
    if (activeTab === "reviews") return <Reviews />;
    return <ProviderApproval />;
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={20}/></button>
        <button className="admin-brand" onClick={() => navigate("/admin/dashboard")}><span>SD</span><div><strong>Skillz <b>Directory</b></strong><small>Administration</small></div></button>
        <nav className="admin-nav" aria-label="Administrator navigation">
          <button className={!isManagement ? "is-active" : ""} onClick={() => navigate("/admin/dashboard")}><LayoutDashboard size={18}/>Dashboard</button>
          <button className={isManagement ? "is-active" : ""} onClick={() => openManagement()}><Settings2 size={18}/>Management Centre</button>
          <button className={location.pathname === "/admin/profile" ? "is-active" : ""} onClick={() => navigate("/admin/profile")}><UserRound size={18}/>Admin Profile</button>
        </nav>
        <button className="admin-sidebar__logout" onClick={handleLogout}><LogOut size={18}/>Logout</button>
      </aside>
      {sidebarOpen && <button className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"/>}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title"><button className="admin-mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button><div><small>Skillz Directory</small><strong>{isManagement ? "Management Centre" : "Admin Dashboard"}</strong></div></div>
          <div className="admin-topbar__actions"><button className="admin-notification" aria-label="Notifications"><Bell size={19}/><span/></button><button className="admin-profile" onClick={() => navigate("/admin/profile")}><span className="admin-profile__avatar">{initialAvatar(user?.fullName ?? "Admin User")}</span><span><strong>{user?.fullName ?? "Administrator"}</strong><small>System Admin</small></span><ChevronDown size={16}/></button></div>
        </header>
        <div className="admin-content">
          {loading ? <div className="admin-loading"><span/><p>Loading administration data...</p></div> : error ? <div className="admin-error">{error}</div> : isManagement ? (
            <>
              <div className="admin-page-heading"><div><p>Management Centre</p><h1>Platform Administration</h1></div></div>
              <div className="admin-tabs" role="tablist">{managementTabs.map((tab)=>{const Icon=tab.icon;return <button key={tab.id} role="tab" aria-selected={activeTab===tab.id} className={activeTab===tab.id?"is-active":""} onClick={()=>setActiveTab(tab.id)}><Icon size={17}/>{tab.label}</button>})}</div>
              {renderManagementTab()}
            </>
          ) : (
            <>
              <div className="admin-page-heading"><div><p>Overview</p><h1>Admin Dashboard</h1></div><span className="admin-date">{new Date().toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"})}</span></div>
              <div className="admin-stat-grid">{cards.map((card)=>{const Icon=card.icon;return <article className="admin-stat-card" key={card.label}><div className={`admin-stat-card__icon ${card.tone}`}><Icon size={20}/></div><div><strong>{card.value.toLocaleString("en-ZA")}</strong><span>{card.label}</span></div></article>})}</div>
              <div className="admin-dashboard-grid">
                <section className="admin-panel admin-priority"><div className="admin-panel__header"><div><h2>Pending Provider Approvals</h2><p>Applications requiring verification</p></div><button onClick={()=>openManagement("provider-approval")}>View all <ChevronRight size={15}/></button></div>{providers.length ? providers.slice(0,4).map((provider)=><div className="admin-approval-row" key={provider.id}><div className="admin-person"><span className="admin-avatar">{initialAvatar(provider.name)}</span><div><strong>{provider.name}</strong><small>{provider.category}</small></div></div><div className="admin-approval-row__meta"><StatusBadge value="Pending"/><small>18 Nov 2026</small></div><div className="admin-row-actions"><button className="admin-action approve" onClick={()=>providerAction(provider,"approve")}><CheckCircle2 size={15}/>Approve</button><button className="admin-action reject" onClick={()=>providerAction(provider,"reject")}><XCircle size={15}/>Reject</button></div></div>):<div className="admin-empty">No pending applications.</div>}</section>
                <section className="admin-panel"><div className="admin-panel__header"><div><h2>Quick Actions</h2><p>Common administration tasks</p></div></div><div className="admin-quick-actions"><button onClick={()=>openManagement("provider-approval")}><ShieldCheck size={19}/><span>Review Providers<small>{providers.length} pending</small></span><ChevronRight size={17}/></button><button onClick={()=>openManagement("users")}><Users size={19}/><span>Manage Users<small>All accounts</small></span><ChevronRight size={17}/></button><button onClick={()=>openManagement("services")}><BriefcaseBusiness size={19}/><span>Manage Services<small>Listings & moderation</small></span><ChevronRight size={17}/></button><button onClick={()=>openManagement("complaints")}><MessageSquareWarning size={19}/><span>View Complaints<small>3 unresolved</small></span><ChevronRight size={17}/></button></div></section>
                <section className="admin-panel"><div className="admin-panel__header"><div><h2>Recent Complaints</h2><p>Latest unresolved reports</p></div><button onClick={()=>openManagement("complaints")}>View all <ChevronRight size={15}/></button></div>{sampleComplaints.map((item)=><button className="admin-complaint" key={item.id} onClick={()=>openManagement("complaints")}><span className="admin-complaint__icon"><CircleAlert size={18}/></span><span><strong>{item.category}</strong><small>{item.reporter} reported {item.reported}</small></span><StatusBadge value={item.status}/></button>)}</section>
                <section className="admin-panel"><div className="admin-panel__header"><div><h2>Recent Activity</h2><p>Latest platform events</p></div></div><div className="admin-activity"><div><span className="green"><UserRound size={14}/></span><p><strong>New provider application</strong><small>Brightline Electrical · 12 min ago</small></p></div><div><span className="blue"><BriefcaseBusiness size={14}/></span><p><strong>New service submitted</strong><small>Emergency Electrical Repairs · 28 min ago</small></p></div><div><span className="orange"><CircleAlert size={14}/></span><p><strong>Complaint submitted</strong><small>CMP-1048 · 1 hr ago</small></p></div></div></section>
              </div>
            </>
          )}
        </div>
      </main>
      {confirm && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true"><button className="admin-modal__close" onClick={()=>setConfirm(null)}><X size={19}/></button><div className={`admin-modal__icon${confirm.danger?" is-danger":""}`}><ShieldCheck size={22}/></div><h2>{confirm.title}</h2><p>{confirm.message}</p>{confirm.danger&&<textarea placeholder="Enter reason..." aria-label="Reason"/>}<div className="admin-modal__actions"><button onClick={()=>setConfirm(null)}>Cancel</button><button className={confirm.danger?"danger":""} onClick={()=>{const action=confirm.action;setConfirm(null);void action();}}>Confirm</button></div></section></div>}
      {toast && <div className="admin-toast"><CheckCircle2 size={17}/>{toast}</div>}
    </div>
  );
}
