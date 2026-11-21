import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import Avatar from "../components/Avatar";
import Eyebrow from "../components/Eyebrow";
import { useAuth } from "../hooks/useAuth";
import { providerService } from "../services/providerService";

export default function AdminProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [location, setLocation] = useState(user?.location ?? "");

  if (!user) return null;
  const currentUser = user;

  function cancelEdit() {
    setFullName(currentUser.fullName);
    setEmail(currentUser.email);
    setPhone(currentUser.phone ?? "");
    setLocation(currentUser.location ?? "");
    setError("");
    setEditing(false);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const updated = await providerService.updateMyAccount({
        id: currentUser.id,
        role: "admin",
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
      });
      setUser(updated);
      setEditing(false);
      setSaved(true);
    } catch (saveError) {
      console.error("Could not update administrator profile.", saveError);
      setError("We could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <main
      className="container-fluid py-5 px-4 px-md-5"
      style={{ maxWidth: 1000, margin: 0, textAlign: "left" }}
    >
      <header className="mb-5">
        <Eyebrow>Account</Eyebrow>
        <h1 className="mb-3" style={{ lineHeight: 1 }}>
          <span
            className="display-heading"
            style={{ fontSize: "clamp(42px, 9vw, 88px)", color: "var(--ink)" }}
          >
            ADMIN
          </span>{" "}
          <span
            className="display-heading"
            style={{ fontSize: "clamp(32px, 6vw, 56px)", color: "var(--primary)" }}
          >
            PROFILE.
          </span>
        </h1>
        <p className="text-muted-ink mb-4" style={{ maxWidth: 600, fontSize: 18 }}>
          View and manage your administrator account details.
        </p>
        <Link className="btn btn-outline-dark" to="/admin/dashboard">
          <ArrowLeft size={16} className="me-2" />
          Back to dashboard
        </Link>
      </header>

      {saved && !editing && (
        <p className="status-line mb-4" role="status">
          Your profile has been updated.
        </p>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <section className="surface-box p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-4 flex-wrap mb-4 pb-4 border-bottom">
          <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={88} />
          <div>
            <h2 className="display-heading display-heading-md mb-1" style={{ fontSize: 32 }}>
              {user.fullName}
            </h2>
            <div className="d-flex align-items-center gap-2 small text-muted-ink text-uppercase fw-bold">
              <ShieldCheck size={16} />
              Administrator
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={saveProfile}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="admin-full-name">
                  Full name
                </label>
                <input
                  id="admin-full-name"
                  className="form-control"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="admin-email">
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="admin-phone">
                  Phone number
                </label>
                <input
                  id="admin-phone"
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="admin-location">
                  Location
                </label>
                <input
                  id="admin-location"
                  className="form-control"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-athletic"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="section-label">Account Details</h3>
            <dl className="row mb-4 g-3">
              <ProfileDetail label="Full name" value={user.fullName} />
              <ProfileDetail label="Email address" value={user.email} />
              <ProfileDetail label="Phone number" value={user.phone} />
              <ProfileDetail label="Location" value={user.location} />
              <ProfileDetail label="Role" value="Administrator" />
            </dl>
            <button
              type="button"
              className="btn btn-athletic"
              onClick={() => {
                setSaved(false);
                setEditing(true);
              }}
            >
              Edit Profile
            </button>
          </>
        )}
      </section>

      <section className="surface-box p-4 mb-4" style={{ maxWidth: 500 }}>
        <h3 className="section-label">Account Security</h3>
        <p className="text-muted-ink small">
          Administrator password changes are managed through account security settings.
        </p>
        <button
          type="button"
          className="btn btn-danger-outline d-flex align-items-center gap-2"
          onClick={() => void handleLogout()}
        >
          <LogOut size={16} /> Log out
        </button>
      </section>
    </main>
  );
}

function ProfileDetail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="col-12 col-md-6">
      <dt className="small text-muted-ink text-uppercase">{label}</dt>
      <dd className="mb-0">{value || "Not provided"}</dd>
    </div>
  );
}
