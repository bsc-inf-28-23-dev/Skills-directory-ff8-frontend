import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
    <div id="resident-profile-page" className="container-fluid py-5 px-4 px-md-5" style={{ width: "100%", maxWidth: 1200, marginLeft: 0, marginRight: "auto", textAlign: "left" }}>
      
      {/* Header */}
      <header className="mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <Eyebrow>{hasProfile ? "Account" : "Welcome"}</Eyebrow>
          <h1 className="display-heading display-heading-lg">
            {hasProfile ? "My profile" : "Create your profile"}
          </h1>
        </div>
        
        {/* ONLY show the Edit button if they ALREADY have a profile */}
        {!editing && tab === "profile" && hasProfile && (
          <button
            type="button"
            className="btn btn-trade"
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
          >
            Edit profile <ArrowUpRight />
          </button>
        )}
      </header>

      {saved && !editing && (
        <p className="status-line mb-4" role="status">
          {hasProfile ? "Your profile has been updated." : "Your profile has been created."}
        </p>
      )}

      <section className="surface-box p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-4 flex-wrap pb-4 border-bottom">
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

        <div className="tab-strip mb-4 mt-4" role="tablist" aria-label="Profile sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "profile"}
            onClick={() => setTab("profile")}
          >
            Profile Details
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
          <div>
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
                <h3 className="section-label">About</h3>
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
              <div className="py-4">
                <span
                  className="d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64, background: "var(--primary)", color: "var(--primary-fg)" }}
                  aria-hidden="true"
                >
                  <UserPlus size={28} />
                </span>
                <h3 className="display-heading display-heading-md mb-2" style={{ fontSize: 24 }}>
                  You haven't created a profile yet
                </h3>
                <p className="text-muted-ink mb-4">
                  Add a photo, a short bio, your location and a few details so the community knows who you are.
                </p>
                {/* The ONLY Create Profile button */}
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
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <h3 className="section-label">My reviews</h3>
            <MyReviews />
          </div>
        )}
      </section>

      {/* Account / Logout Section at the bottom */}
      <section className="surface-box p-4 mb-4">
        <h3 className="section-label">Account</h3>
        <p className="text-muted-ink small mb-3">
          Signed in as <strong>{user.email}</strong>. Logging out will end this session on this device.
        </p>
        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={onLogout}
          disabled={loggingOut}
        >
          {loggingOut && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          <LogOut size={16} className="me-2" /> Log out
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