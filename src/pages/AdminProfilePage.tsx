import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { providerService } from "../services/providerService";
import "./AdminDashboardPage.css";

export default function AdminProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setLocation(user.location ?? "");
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!user) return null;

  const initials = fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await providerService.updateMyAccount({
        id: user!.id,
        role: "admin",
        fullName,
        email,
        phone,
        location,
      });
      setUser(updated);
      setEditing(false);
      setToast("Profile updated successfully.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={20}/></button>
        <button className="admin-brand" onClick={() => navigate("/admin/dashboard")}><span>SD</span><div><strong>Skillz <b>Directory</b></strong><small>Administration</small></div></button>
        <nav className="admin-nav" aria-label="Administrator navigation">
          <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/admin/management")}>Management Centre</button>
          <button className="is-active" onClick={() => setSidebarOpen(false)}>Admin Profile</button>
        </nav>
        <button className="admin-sidebar__logout" onClick={handleLogout}><LogOut size={18}/>Logout</button>
      </aside>
      {sidebarOpen && <button className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"/>}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title"><button className="admin-mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button><div><small>Skillz Directory</small><strong>Admin Profile</strong></div></div>
          <div className="admin-topbar__actions"><button className="admin-notification" aria-label="Notifications"><Bell size={19}/><span/></button><button className="admin-profile"><span className="admin-profile__avatar">{initials}</span><span><strong>{fullName}</strong><small>System Admin</small></span><ChevronDown size={16}/></button></div>
        </header>
        <div className="admin-content">
          <div className="admin-page-heading"><div><p>Account</p><h1>Administrator Profile</h1></div></div>
          <section className="admin-panel admin-profile-panel">
            <div className="admin-profile-hero">
              <span className="admin-profile-hero__avatar">{initials}</span>
              <div><h2>{fullName}</h2><p><ShieldCheck size={14}/> System Administrator</p></div>
              {!editing && <button className="admin-profile-edit" onClick={() => setEditing(true)}>Edit Profile</button>}
            </div>
            {editing ? (
              <form className="admin-profile-form" onSubmit={saveProfile}>
                <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required/></label>
                <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label>
                <label>Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)}/></label>
                <label>Location<input value={location} onChange={(event) => setLocation(event.target.value)}/></label>
                <div className="admin-profile-form__actions"><button type="button" onClick={() => setEditing(false)}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
              </form>
            ) : (
              <dl className="admin-profile-details">
                <div><dt>Full name</dt><dd>{fullName}</dd></div>
                <div><dt>Email address</dt><dd>{email}</dd></div>
                <div><dt>Phone number</dt><dd>{phone || "Not provided"}</dd></div>
                <div><dt>Location</dt><dd>{location || "Not provided"}</dd></div>
                <div><dt>Account role</dt><dd><span className="admin-status admin-status--active">Administrator</span></dd></div>
              </dl>
            )}
          </section>
          <section className="admin-panel admin-profile-security"><div><ShieldCheck size={20}/><span><strong>Account Security</strong><small>This account has administrative access. Password changes must be managed through account security settings.</small></span></div></section>
        </div>
      </main>
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
