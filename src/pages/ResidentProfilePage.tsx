import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  Languages,
  LogOut,
  MapPin,
  Phone,
  UserPlus,
} from "lucide-react";
import Avatar from "../components/Avatar";
import Eyebrow from "../components/Eyebrow";
import { useAuth } from "../hooks/useAuth";
import MyReviews from "../features/resident/MyReviews";
import ProfileForm from "../features/resident/ProfileForm";
import { formatDate } from "../utils/format";

type Tab = "profile" | "reviews";

export default function ResidentProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");

  if (!user) return null;

  const memberSince = formatDate(user.createdAt);
  const displayName = user.displayName || user.fullName;

  const hasProfile = Boolean(
    user.bio ||
      user.avatarUrl ||
      user.location ||
      user.occupation ||
      (user.languages && user.languages.length > 0)
  );

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="page-container py-5" style={{ maxWidth: 1000 }}>
      <nav className="mb-4">
        <Link to="/resident/dashboard" className="text-uppercase small fw-semibold">
          ← Back to dashboard
        </Link>
      </nav>

      <header className="mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <Eyebrow>{hasProfile ? "Account" : "Welcome"}</Eyebrow>
          <h1 className="display-heading display-heading-lg">
            {hasProfile ? "My profile" : "Create your profile"}
          </h1>
        </div>
        {!editing && tab === "profile" && (
          <button
            type="button"
            className={hasProfile ? "btn btn-trade" : "btn btn-athletic"}
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
          >
            {hasProfile ? "Edit profile" : "Create profile"} <ArrowUpRight />
          </button>
        )}
      </header>

      {saved && !editing && (
        <p className="status-line mb-4" role="status">
          {hasProfile ? "Your profile has been updated." : "Your profile has been created."}
        </p>
      )}

      <section className="surface-box p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={96} />
          <div>
            <h2 className="display-heading display-heading-md mb-1" style={{ fontSize: 28 }}>
              {displayName}
            </h2>
            <div className="small text-muted-ink text-uppercase" style={{ letterSpacing: "0.08em" }}>
              Resident{memberSince ? ` · Member since ${memberSince}` : ""}
            </div>
          </div>
        </div>
      </section>

      <div className="tab-strip mb-4" role="tablist" aria-label="Profile sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "reviews"}
          onClick={() => setTab("reviews")}
        >
          My reviews
        </button>
      </div>

      {tab === "profile" && (
        <section className="surface-box p-4 p-md-5 mb-4" aria-labelledby="about-heading">
          {editing ? (
            <ProfileForm
              user={user}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setUser(updated);
                setEditing(false);
                setSaved(true);
              }}
            />
          ) : hasProfile ? (
            <>
              <h2 id="about-heading" className="section-label">About</h2>

              {user.bio && <p className="review-text mb-4">{user.bio}</p>}

              <dl className="row mb-0 g-3">
                <InfoRow icon={<MapPin size={16} />} label="Location" value={user.location} />
                <InfoRow icon={<Briefcase size={16} />} label="Occupation" value={user.occupation} />
                <InfoRow
                  icon={<Languages size={16} />}
                  label="Languages"
                  value={user.languages && user.languages.length ? user.languages.join(", ") : null}
                />
                <InfoRow icon={<Phone size={16} />} label="Phone" value={user.phone} />
                <InfoRow label="Email" value={user.email} />
              </dl>
            </>
          ) : (
            <div className="text-center py-4">
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                }}
                aria-hidden="true"
              >
                <UserPlus size={28} />
              </span>
              <h2 id="about-heading" className="display-heading display-heading-md mt-3 mb-2" style={{ fontSize: 24 }}>
                You haven't created a profile yet
              </h2>
              <p className="text-muted-ink mb-4" style={{ maxWidth: 480, margin: "0 auto" }}>
                Add a photo, a short bio, your location and a few details so the community knows who you are.
              </p>
              <button
                type="button"
                className="btn btn-athletic"
                onClick={() => {
                  setSaved(false);
                  setEditing(true);
                }}
              >
                Create profile <ArrowUpRight />
              </button>
            </div>
          )}
        </section>
      )}

      {tab === "reviews" && (
        <section className="surface-box p-4 p-md-5 mb-4" aria-labelledby="my-reviews-heading">
          <h2 id="my-reviews-heading" className="section-label">My reviews</h2>
          <MyReviews />
        </section>
      )}

      <section className="surface-box p-4 mb-4">
        <h2 className="section-label">Account</h2>
        <p className="text-muted-ink small mb-3">
          Signed in as <strong>{user.email}</strong>. Logging out will end this session on this device.
        </p>
        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={onLogout}
          disabled={loggingOut}
        >
          {loggingOut && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
          <LogOut /> Log out
        </button>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <>
      <dt
        className="col-sm-4 text-uppercase small text-muted-ink d-flex align-items-center gap-2"
        style={{ letterSpacing: "0.06em" }}
      >
        {icon}
        {label}
      </dt>
      <dd className="col-sm-8 mb-0">
        {value ? value : <span className="text-muted-ink">Not provided</span>}
      </dd>
    </>
  );
}