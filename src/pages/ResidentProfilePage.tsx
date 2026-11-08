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
    <div className="container-fluid py-5 px-4 px-md-5" style={{ maxWidth: 1000, margin: 0, textAlign: "left" }}>
      
      {/* Header with Two-Tone Color and Different Sizes */}
      <header className="mb-5">
        <Eyebrow>{hasProfile ? "Account" : "Welcome"}</Eyebrow>
        

      <h1 className="mb-3" style={{ lineHeight: 1 }}>
  {hasProfile ? (
    <>
      <span className="display-heading" style={{ fontSize: "88px", color: "var(--ink)" }}>MY</span>{" "}
      <span className="display-heading" style={{ fontSize: "56px", color: "var(--primary)" }}>PROFILE.</span>
    </>
  ) : (
    <>
      <span className="display-heading" style={{ fontSize: "88px", color: "var(--ink)" }}>CREATE</span>{" "}
      <span className="display-heading" style={{ fontSize: "56px", color: "var(--primary)" }}>YOUR PROFILE.</span>
    </>
  )}
</h1>   
        <p className="text-muted-ink mb-4" style={{ maxWidth: 600, fontSize: 18 }}>
          {hasProfile 
            ? "Manage your personal information and see the reviews you have written."
            : "Add a photo, a short bio, your location and a few details so the community knows who you are."}
        </p>
      </header>

      {saved && !editing && (
        <p className="status-line mb-4" role="status">
          {hasProfile ? "Your profile has been updated." : "Your profile has been created."}
        </p>
      )}

      <div className="row">
        <div className="col-12">
          
          {/* Profile Card */}
          <section className="surface-box p-4 p-md-5 mb-4">
            <div className="d-flex align-items-center gap-4 flex-wrap mb-4 pb-4 border-bottom">
              <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={96} />
              <div>
                <h2 className="display-heading display-heading-md mb-1" style={{ fontSize: 32 }}>
                  {displayName}
                </h2>
                <div className="small text-muted-ink text-uppercase fw-bold" style={{ letterSpacing: "0.08em" }}>
                  Resident{memberSince ? ` · Member since ${memberSince}` : ""}
                </div>
              </div>
            </div>

            <div className="tab-strip mb-4" role="tablist" aria-label="Profile sections">
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
                    <h3 className="display-heading display-heading-md mb-2" style={{ fontSize: 28 }}>
                      You haven't created a profile yet
                    </h3>
                    <p className="text-muted-ink mb-4" style={{ fontSize: 16 }}>
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
              </div>
            )}

            {tab === "reviews" && (
              <div>
                <h3 className="section-label">My reviews</h3>
                <MyReviews />
              </div>
            )}
          </section>

          {/* Account / Logout Box */}
          <section className="surface-box p-4 mb-4" style={{ maxWidth: 500 }}>
            <h3 className="section-label">Account</h3>
            <p className="text-muted-ink small mb-4">
              Signed in as <strong>{user.email}</strong>.
            </p>
            <button
              type="button"
              className="btn btn-danger-outline d-flex align-items-center gap-2"
              onClick={onLogout}
              disabled={loggingOut}
            >
              {loggingOut && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              <LogOut size={16} /> Log out
            </button>
          </section>
          
        </div>
      </div>
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
        className="col-sm-4 text-uppercase small text-muted-ink d-flex align-items-center gap-2 fw-bold"
        style={{ letterSpacing: "0.06em" }}
      >
        {icon}
        {label}
      </dt>
      <dd className="col-sm-8 mb-0" style={{ fontSize: 15 }}>
        {value ? value : <span className="text-muted-ink">Not provided</span>}
      </dd>
    </>
  );
}