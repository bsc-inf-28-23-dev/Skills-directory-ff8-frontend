import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  ImagePlus,
  MapPin,
  Plus,
  Shield,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import type { User } from "../../types";
import type {
  ProviderBusinessProfile,
  ProviderProfileDocument,
  ProviderPortfolioItem,
  ServiceProvider,
} from "../../types/serviceProvider";
import { providerService } from "../../services/providerService";
import "./ProviderProfilePage.css";

const emptyProfile: ProviderBusinessProfile = {
  tagline: "",
  additionalCategories: [],
  yearsExperience: null,
  businessHours: "",
  registrationDetails: "",
  businessAddress: "",
  city: "",
  areasServed: [],
  physicalPremises: false,
  travelsToCustomer: true,
  skills: [],
  qualifications: [],
  previousExperience: "",
  showPublicPhone: false,
  showPublicEmail: false,
  portfolio: [],
  verificationStatus: "unverified",
  verificationDocuments: [],
};

const navigationSections = [
  { id: "personal", label: "Personal information", icon: UserRound },
  { id: "business", label: "Business information", icon: BriefcaseBusiness },
  { id: "location", label: "Location & coverage", icon: MapPin },
  { id: "experience", label: "Experience & qualifications", icon: BadgeCheck },
  { id: "portfolio", label: "Portfolio", icon: ImagePlus },
  { id: "contact", label: "Contact information", icon: Clock3 },
  { id: "verification", label: "Verification", icon: Shield },
];

function getProfileDetails(provider: ServiceProvider): ProviderBusinessProfile {
  return {
    ...emptyProfile,
    ...provider.profile,
    additionalCategories: provider.profile?.additionalCategories ?? [],
    areasServed: provider.profile?.areasServed ?? [],
    skills: provider.profile?.skills ?? [],
    qualifications: provider.profile?.qualifications ?? [],
    portfolio: provider.profile?.portfolio ?? [],
    verificationDocuments: provider.profile?.verificationDocuments ?? [],
  };
}

interface ProviderProfileManagementPageProps {
  provider: ServiceProvider;
  user: User;
  categories: string[];
  onBack: () => void;
  onSave: (provider: ServiceProvider, user: User) => Promise<boolean>;
}

async function readFile(
  file: File,
  maxBytes: number,
  allowed: (file: File) => boolean,
  onProgress: (progress: number) => void,
): Promise<string> {
  if (!allowed(file)) {
    throw new Error("Choose a supported file type.");
  }
  if (file.size > maxBytes) {
    throw new Error(`The file must be ${Math.floor(maxBytes / 1024 / 1024)} MB or smaller.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onProgress(100);
        resolve(reader.result);
      } else {
        reject(new Error("This file could not be previewed."));
      }
    };
    reader.onerror = () => reject(new Error("This file could not be read. Please try again."));
    reader.readAsDataURL(file);
  });
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <header className="provider-profile__section-heading">
      <span aria-hidden="true">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

function ProfileImageUpload({
  label,
  image,
  onUpload,
  onRemove,
  variant,
}: {
  label: string;
  image?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  variant: "avatar" | "logo" | "cover";
}) {
  const inputId = `provider-${variant}-upload`;
  return (
    <div className={`provider-profile__image-upload is-${variant}`}>
      <div className="provider-profile__image-preview">
        {image ? (
          <img src={image} alt={`${label} preview`} />
        ) : (
          <span aria-hidden="true">
            {variant === "cover" ? <ImagePlus /> : <Camera />}
          </span>
        )}
      </div>
      <div className="provider-profile__image-copy">
        <strong>{label}</strong>
        <small>JPG, PNG, GIF or WebP · Up to 5 MB</small>
        <div className="provider-profile__image-actions">
          <label htmlFor={inputId} className="btn btn-sm btn-outline-secondary">
            <Upload size={15} aria-hidden="true" />
            {image ? "Replace" : "Upload"}
          </label>
          {image && (
            <button type="button" className="provider-profile__text-button" onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export default function ProviderProfileManagementPage({
  provider,
  user,
  categories,
  onBack,
  onSave,
}: ProviderProfileManagementPageProps) {
  const [profile, setProfile] = useState<ProviderBusinessProfile>(() => getProfileDetails(provider));
  const [businessName, setBusinessName] = useState(provider.name);
  const [person, setPerson] = useState(user.fullName || provider.person);
  const [category, setCategory] = useState(provider.category);
  const [area, setArea] = useState(provider.area);
  const [services, setServices] = useState(provider.services.join(", "));
  const [quote, setQuote] = useState(provider.quote);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatar, setAvatar] = useState(user.avatarUrl ?? provider.photo ?? "");
  const [email, setEmail] = useState(user.email);
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const applyBackendProfile = useCallback((
    business: Awaited<ReturnType<typeof providerService.getMyProfile>>,
    account: User,
  ) => {
    setBusinessName(business.businessName);
    setPerson(account.fullName || business.contactPerson);
    setCategory(business.category);
    setArea(business.serviceArea);
    setQuote(business.about);
    setServices(business.skills.join(", "));
    setPhone(account.phone ?? "");
    setEmail(account.email);
    setAvatar(account.avatarUrl ?? business.photoUrl ?? provider.photo ?? "");
    setProfile((current) => ({
      ...current,
      skills: business.skills,
      city: current.city || business.serviceArea,
    }));
  }, [provider.photo]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileLoadError("");
      try {
        const [business, account] = await Promise.all([
          providerService.getMyProfile(),
          providerService.getMyAccount(),
        ]);
        if (!active) return;
        applyBackendProfile(business, account);
      } catch (error) {
        console.error("Could not load provider profile from the backend.", error);
        if (active) {
          setProfileLoadError(
            "Your business profile could not be loaded from the server. Check your connection and try again.",
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [applyBackendProfile]);

  const completion = useMemo(() => {
    const required = [
      person.trim(),
      businessName.trim(),
      category,
      quote.trim(),
      area.trim(),
      profile.tagline.trim(),
      profile.city.trim(),
      profile.areasServed.length > 0,
      profile.skills.length > 0,
      avatar,
    ];
    const completeCount = required.filter(Boolean).length;
    return Math.round((completeCount / required.length) * 100);
  }, [person, businessName, category, quote, area, profile, avatar]);

  function updateProfile<K extends keyof ProviderBusinessProfile>(
    key: K,
    value: ProviderBusinessProfile[K],
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  }

  async function handleImageUpload(
    file: File,
    setImage: (image: string) => void,
  ) {
    setUploadError("");
    setUploadProgress(0);
    try {
      const result = await readFile(
        file,
        5 * 1024 * 1024,
        (selected) => selected.type.startsWith("image/"),
        setUploadProgress,
      );
      setImage(result);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      window.setTimeout(() => setUploadProgress(null), 800);
    }
  }

  function handleDocumentUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setUploadError("");
    if (!files.length) return;

    const remaining = Math.max(0, 6 - profile.verificationDocuments.length);
    if (files.length > remaining) {
      setUploadError(`You can add up to ${remaining} more verification document${remaining === 1 ? "" : "s"}.`);
      return;
    }

    void Promise.all(
      files.map(async (file): Promise<ProviderProfileDocument> => ({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        dataUrl: await readFile(
          file,
          5 * 1024 * 1024,
          (selected) => selected.type === "application/pdf" || selected.type.startsWith("image/"),
          setUploadProgress,
        ),
        size: file.size,
        status: "unsubmitted",
      })),
    )
      .then((documents) => {
        updateProfile("verificationDocuments", [
          ...profile.verificationDocuments,
          ...documents,
        ]);
      })
      .catch((error: unknown) => {
        setUploadError(error instanceof Error ? error.message : "A document could not be uploaded.");
      })
      .finally(() => setUploadProgress(null));
  }

  function handlePortfolioUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setUploadError("");
    if (!files.length) return;
    const remaining = Math.max(0, 6 - profile.portfolio.length);
    if (files.length > remaining) {
      setUploadError(`You can add up to ${remaining} more portfolio image${remaining === 1 ? "" : "s"}.`);
      return;
    }

    void Promise.all(
      files.map(async (file): Promise<ProviderPortfolioItem> => ({
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        imageUrl: await readFile(
          file,
          3 * 1024 * 1024,
          (selected) => selected.type.startsWith("image/"),
          setUploadProgress,
        ),
      })),
    )
      .then((items) => updateProfile("portfolio", [...profile.portfolio, ...items]))
      .catch((error: unknown) => {
        setUploadError(error instanceof Error ? error.message : "A portfolio image could not be uploaded.");
      })
      .finally(() => setUploadProgress(null));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const updatedProvider: ServiceProvider = {
      ...provider,
      name: businessName.trim(),
      person: person.trim(),
      category,
      area: area.trim(),
      quote: quote.trim(),
      services: splitList(services),
      photo: avatar || undefined,
      profile,
    };
    const updatedUser: User = {
      ...user,
      fullName: person.trim(),
      phone: phone.trim() || null,
      avatarUrl: avatar || null,
    };

    try {
      const saved = await onSave(updatedProvider, updatedUser);
      setFeedback(
        saved
          ? { kind: "success", text: "Your business profile has been saved." }
          : { kind: "error", text: "Your changes could not be saved. Please try again." },
      );
    } catch (error) {
      console.error("Could not save provider profile.", error);
      setFeedback({ kind: "error", text: "Your changes could not be saved. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  function submitForVerification() {
    if (profile.verificationDocuments.length === 0) {
      setFeedback({ kind: "error", text: "Upload at least one verification document before submitting." });
      return;
    }
    updateProfile("verificationStatus", "pending");
    updateProfile(
      "verificationDocuments",
      profile.verificationDocuments.map((document) =>
        document.status === "verified"
          ? document
          : {
              ...document,
              status: "pending",
              submittedAt: document.submittedAt ?? new Date().toISOString(),
            },
      ),
    );
    setFeedback({
      kind: "success",
      text: "Documents are marked for submission. Save your profile to retain the change; an administrator must review them before your account can be verified.",
    });
  }

  function cancelChanges() {
    setProfile(getProfileDetails(provider));
    setFeedback(null);
    retryProfileLoad();
  }

  const retryProfileLoad = useCallback(() => {
    setProfileLoadError("");
    setProfileLoading(true);
    Promise.all([providerService.getMyProfile(), providerService.getMyAccount()])
      .then(([business, account]) => {
        applyBackendProfile(business, account);
      })
      .catch((error: unknown) => {
        console.error("Could not reload provider profile.", error);
        setProfileLoadError(
          "Your business profile could not be loaded from the server. Check your connection and try again.",
        );
      })
      .finally(() => setProfileLoading(false));
  }, [applyBackendProfile]);

  function navigateToSection(sectionId: string) {
    setActiveSection(sectionId);
    document.getElementById(`provider-profile-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const verificationLabel = {
    unverified: "Unverified",
    pending: "Pending verification",
    verified: "Verified",
    suspended: "Suspended",
  }[profile.verificationStatus];

  if (profileLoading || profileLoadError) {
    return (
      <main className="provider-profile">
        <div className="provider-profile__container">
          <div className="provider-profile__heading">
            <div>
              <p className="provider-profile__eyebrow">PROVIDER WORKSPACE</p>
              <h1>Business Profile</h1>
              <p>Manage your personal details, business information, and public profile.</p>
            </div>
            <button type="button" className="provider-profile__back" onClick={onBack}>
              Back to dashboard
            </button>
          </div>
          {profileLoading ? (
            <p className="alert alert-info" role="status">Loading your business profile…</p>
          ) : (
            <div className="alert alert-danger" role="alert">
              <p>{profileLoadError}</p>
              <button type="button" className="btn btn-outline-danger" onClick={retryProfileLoad}>
                Try again
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="provider-profile">
      <div className="provider-profile__container">
        <div className="provider-profile__heading">
          <div>
            <p className="provider-profile__eyebrow">PROVIDER WORKSPACE</p>
            <h1>Business Profile</h1>
            <p>
              Manage your personal details, business information, and how residents
              see your business on Skillz Directory.
            </p>
          </div>
          <button type="button" className="provider-profile__back" onClick={onBack}>
            Back to dashboard
          </button>
        </div>

        <div className="provider-profile__prototype-note" role="note">
          Business contact details are saved to your account. Branding images, portfolio items, and verification files remain in this browser and are not submitted for administrator review.
        </div>

        <section className="provider-profile__hero" aria-label="Profile overview">
          <div className="provider-profile__cover">
            {profile.coverImage && (
              <img className="provider-profile__cover-image" src={profile.coverImage} alt="" />
            )}
            <span>BUSINESS COVER</span>
            {profile.businessLogo && (
              <img className="provider-profile__hero-logo" src={profile.businessLogo} alt={`${businessName} logo`} />
            )}
          </div>
          <div className="provider-profile__hero-body">
            <div className="provider-profile__hero-avatar">
              {avatar ? <img src={avatar} alt={`${person} profile`} /> : <UserRound aria-hidden="true" />}
            </div>
            <div className="provider-profile__hero-copy">
              <div className="provider-profile__hero-title">
                <div>
                  <h2>{businessName || "Your business name"}</h2>
                  <p>{person || "Your name"}{profile.tagline ? ` · ${profile.tagline}` : ""}</p>
                </div>
                <span className={`provider-profile__verification is-${profile.verificationStatus}`}>
                  <Shield size={15} aria-hidden="true" />
                  {verificationLabel}
                </span>
              </div>
              <div className="provider-profile__hero-meta">
                <span><BriefcaseBusiness size={15} aria-hidden="true" />{category}</span>
                <span><MapPin size={15} aria-hidden="true" />{profile.city || area}</span>
                <span className="provider-profile__rating">
                  ★ {provider.rating.toFixed(1)} <small>{provider.reviews} reviews</small>
                </span>
              </div>
            </div>
          </div>
          <div className="provider-profile__completion">
            <div className="provider-profile__completion-copy">
              <strong>Profile completeness</strong>
              <span>{completion}%</span>
            </div>
            <div
              className="provider-profile__progress"
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${completion}%` }} />
            </div>
            <small>A complete profile helps residents choose your business with confidence.</small>
          </div>
        </section>

        {uploadProgress !== null && (
          <div className="provider-profile__upload-progress" role="status">
            <span>Preparing upload… {uploadProgress}%</span>
            <div><span style={{ width: `${uploadProgress}%` }} /></div>
          </div>
        )}
        {uploadError && <p className="alert alert-danger" role="alert">{uploadError}</p>}
        {feedback && (
          <p className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-danger"}`} role={feedback.kind === "success" ? "status" : "alert"}>
            {feedback.text}
          </p>
        )}

        <div className="provider-profile__layout">
          <nav className="provider-profile__sidebar" aria-label="Profile sections">
            {navigationSections.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                className={activeSection === id ? "is-active" : ""}
                onClick={() => navigateToSection(id)}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            ))}
            <div className="provider-profile__sidebar-hint">
              <CircleHelp size={17} aria-hidden="true" />
              <span>You control which contact details appear on your public profile.</span>
            </div>
          </nav>

          <form className="provider-profile__form" onSubmit={handleSubmit}>
            <section id="provider-profile-personal" className="provider-profile__panel">
              <SectionHeading
                icon={<UserRound size={20} />}
                title="Personal information"
                description="Your account details are private unless you choose to display contact information."
              />
              <div className="provider-profile__image-row">
                <ProfileImageUpload
                  label="Profile picture"
                  image={avatar}
                  variant="avatar"
                  onUpload={(file) => void handleImageUpload(file, setAvatar)}
                  onRemove={() => setAvatar("")}
                />
                <ProfileImageUpload
                  label="Business logo"
                  image={profile.businessLogo}
                  variant="logo"
                  onUpload={(file) => void handleImageUpload(file, (image) => updateProfile("businessLogo", image))}
                  onRemove={() => updateProfile("businessLogo", undefined)}
                />
              </div>
              <div className="provider-profile__fields">
                <Field label="Full name" htmlFor="profile-full-name">
                  <input id="profile-full-name" className="form-control" value={person} onChange={(event) => setPerson(event.target.value)} required />
                </Field>
                <Field label="Email address" htmlFor="profile-email">
                  <input id="profile-email" className="form-control" type="email" value={email} readOnly aria-describedby="profile-email-hint" />
                  <small id="profile-email-hint">Email changes require an account verification flow, which is not connected yet.</small>
                </Field>
                <Field label="Phone number" htmlFor="profile-phone">
                  <input id="profile-phone" className="form-control" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
                </Field>
                <p className="provider-profile__field-note">
                  Password changes are handled separately in Account Security.
                </p>
              </div>
            </section>

            <section id="provider-profile-business" className="provider-profile__panel">
              <SectionHeading
                icon={<BriefcaseBusiness size={20} />}
                title="Business information"
                description="Introduce your business and the work you do."
              />
              <ProfileImageUpload
                label="Business cover image"
                image={profile.coverImage}
                variant="cover"
                onUpload={(file) => void handleImageUpload(file, (image) => updateProfile("coverImage", image))}
                onRemove={() => updateProfile("coverImage", undefined)}
              />
              <div className="provider-profile__fields">
                <Field label="Business name" htmlFor="profile-business-name">
                  <input id="profile-business-name" className="form-control" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
                </Field>
                <Field label="Professional tagline" htmlFor="profile-tagline">
                  <input id="profile-tagline" className="form-control" value={profile.tagline} maxLength={100} onChange={(event) => updateProfile("tagline", event.target.value)} placeholder="e.g. Reliable home repairs, done right" />
                </Field>
                <Field label="Main business category" htmlFor="profile-category">
                  <select id="profile-category" className="form-select" value={category} onChange={(event) => setCategory(event.target.value)} required>
                    {!categories.includes(category) && <option value={category}>{category}</option>}
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Additional categories or skills" htmlFor="profile-additional-categories">
                  <input id="profile-additional-categories" className="form-control" value={profile.additionalCategories.join(", ")} onChange={(event) => updateProfile("additionalCategories", splitList(event.target.value))} placeholder="Separate items with commas" />
                </Field>
                <Field label="Business description" htmlFor="profile-description" wide>
                  <textarea id="profile-description" className="form-control" rows={5} value={quote} onChange={(event) => setQuote(event.target.value)} maxLength={2000} placeholder="Describe your experience, the services you offer, and what makes your business different." />
                  <small>{quote.length}/2000 characters</small>
                </Field>
                <Field label="Services offered" htmlFor="profile-services" wide>
                  <textarea id="profile-services" className="form-control" rows={3} value={services} onChange={(event) => setServices(event.target.value)} placeholder="Separate services with commas" />
                </Field>
                <Field label="Business operating hours" htmlFor="profile-hours">
                  <input id="profile-hours" className="form-control" value={profile.businessHours} onChange={(event) => updateProfile("businessHours", event.target.value)} placeholder="e.g. Mon–Sat, 8:00–17:00" />
                </Field>
                <Field label="Years of experience" htmlFor="profile-years">
                  <input id="profile-years" className="form-control" type="number" min={0} max={80} value={profile.yearsExperience ?? ""} onChange={(event) => updateProfile("yearsExperience", event.target.value ? Number(event.target.value) : null)} />
                </Field>
                <Field label="Business registration details (optional)" htmlFor="profile-registration" wide>
                  <input id="profile-registration" className="form-control" value={profile.registrationDetails} onChange={(event) => updateProfile("registrationDetails", event.target.value)} placeholder="Registration number or business type" />
                </Field>
              </div>
            </section>

            <section id="provider-profile-location" className="provider-profile__panel">
              <SectionHeading
                icon={<MapPin size={20} />}
                title="Location and service coverage"
                description="Help residents understand where your business is based and where you work."
              />
              <div className="provider-profile__fields">
                <Field label="Business address or operating location" htmlFor="profile-address">
                  <input id="profile-address" className="form-control" value={profile.businessAddress} onChange={(event) => updateProfile("businessAddress", event.target.value)} placeholder="Street, neighborhood or landmark" />
                </Field>
                <Field label="City or district" htmlFor="profile-city">
                  <input id="profile-city" className="form-control" value={profile.city || area} onChange={(event) => { updateProfile("city", event.target.value); setArea(event.target.value); }} required />
                </Field>
                <Field label="Areas or districts served" htmlFor="profile-areas" wide>
                  <input id="profile-areas" className="form-control" value={profile.areasServed.join(", ")} onChange={(event) => updateProfile("areasServed", splitList(event.target.value))} placeholder="e.g. Lilongwe, Area 10, Area 47" />
                </Field>
                <label className="provider-profile__check">
                  <input type="checkbox" checked={profile.travelsToCustomer} onChange={(event) => updateProfile("travelsToCustomer", event.target.checked)} />
                  I travel to customers
                </label>
                <label className="provider-profile__check">
                  <input type="checkbox" checked={profile.physicalPremises} onChange={(event) => updateProfile("physicalPremises", event.target.checked)} />
                  Customers can visit my premises
                </label>
              </div>
            </section>

            <section id="provider-profile-experience" className="provider-profile__panel">
              <SectionHeading
                icon={<BadgeCheck size={20} />}
                title="Experience and qualifications"
                description="Share your expertise. Qualifications you enter here are provider-supplied, not administrator verified."
              />
              <div className="provider-profile__fields">
                <Field label="Skills and areas of expertise" htmlFor="profile-skills" wide>
                  <textarea id="profile-skills" className="form-control" rows={3} value={profile.skills.join(", ")} onChange={(event) => updateProfile("skills", splitList(event.target.value))} placeholder="Separate skills with commas" />
                </Field>
                <Field label="Professional qualifications" htmlFor="profile-qualifications" wide>
                  <textarea id="profile-qualifications" className="form-control" rows={3} value={profile.qualifications.join(", ")} onChange={(event) => updateProfile("qualifications", splitList(event.target.value))} placeholder="List qualifications, certificates or licenses" />
                </Field>
                <Field label="Previous work experience" htmlFor="profile-previous-work" wide>
                  <textarea id="profile-previous-work" className="form-control" rows={4} value={profile.previousExperience} onChange={(event) => updateProfile("previousExperience", event.target.value)} placeholder="Describe relevant roles or projects." />
                </Field>
              </div>
              <div className="provider-profile__document-upload">
                <div>
                  <strong>Supporting certificates and licenses</strong>
                  <small>PDF or image · Up to 5 MB each · Maximum 6 documents</small>
                </div>
                <label className="btn btn-outline-secondary btn-sm" htmlFor="profile-documents">
                  <Upload size={15} aria-hidden="true" /> Add documents
                </label>
                <input id="profile-documents" type="file" accept="application/pdf,image/*" multiple className="visually-hidden" onChange={handleDocumentUpload} />
              </div>
              {profile.verificationDocuments.length > 0 && (
                <ul className="provider-profile__document-list">
                  {profile.verificationDocuments.map((document) => (
                    <li key={document.id}>
                      <FileCheck2 size={18} aria-hidden="true" />
                      <span>
                        <strong>{document.name}</strong>
                        <small>{formatDocumentStatus(document.status)}{document.submittedAt ? ` · Submitted ${new Date(document.submittedAt).toLocaleDateString()}` : ""}</small>
                        {document.feedback && <small className="text-danger">Reviewer feedback: {document.feedback}</small>}
                      </span>
                      <a href={document.dataUrl} target="_blank" rel="noreferrer" aria-label={`Preview ${document.name}`}>Preview</a>
                      <button type="button" aria-label={`Remove ${document.name}`} onClick={() => updateProfile("verificationDocuments", profile.verificationDocuments.filter((item) => item.id !== document.id))}>
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section id="provider-profile-portfolio" className="provider-profile__panel">
              <SectionHeading
                icon={<ImagePlus size={20} />}
                title="Portfolio"
                description="Show residents examples of your completed work."
              />
              <div className="provider-profile__portfolio-controls">
                <p>Upload up to six images. Avoid including personal customer information.</p>
                <label className="btn btn-outline-secondary btn-sm" htmlFor="profile-portfolio">
                  <Plus size={15} aria-hidden="true" /> Add work
                </label>
                <input id="profile-portfolio" type="file" accept="image/*" multiple className="visually-hidden" onChange={handlePortfolioUpload} />
              </div>
              {profile.portfolio.length === 0 ? (
                <div className="provider-profile__empty">
                  <ImagePlus size={22} aria-hidden="true" />
                  <span>Your portfolio is empty. Add a few examples of your work.</span>
                </div>
              ) : (
                <div className="provider-profile__portfolio-grid">
                  {profile.portfolio.map((item) => (
                    <article key={item.id}>
                      <img src={item.imageUrl} alt={item.title || "Portfolio work"} />
                      <label>
                        <span>Project title</span>
                        <input className="form-control form-control-sm" value={item.title} onChange={(event) => updateProfile("portfolio", profile.portfolio.map((work) => work.id === item.id ? { ...work, title: event.target.value } : work))} />
                      </label>
                      <label>
                        <span>Description</span>
                        <textarea className="form-control form-control-sm" rows={2} value={item.description} onChange={(event) => updateProfile("portfolio", profile.portfolio.map((work) => work.id === item.id ? { ...work, description: event.target.value } : work))} />
                      </label>
                      <button type="button" onClick={() => updateProfile("portfolio", profile.portfolio.filter((work) => work.id !== item.id))}>
                        <Trash2 size={15} aria-hidden="true" /> Remove
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="provider-profile-contact" className="provider-profile__panel">
              <SectionHeading
                icon={<Clock3 size={20} />}
                title="Contact information"
                description="Your account email and phone stay private unless you opt in to show contact details."
              />
              <div className="provider-profile__fields">
                <Field label="Public phone number" htmlFor="profile-public-phone">
                  <input id="profile-public-phone" className="form-control" type="tel" value={profile.publicPhone ?? ""} onChange={(event) => updateProfile("publicPhone", event.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Public email address" htmlFor="profile-public-email">
                  <input id="profile-public-email" className="form-control" type="email" value={profile.publicEmail ?? ""} onChange={(event) => updateProfile("publicEmail", event.target.value)} placeholder="Optional" />
                </Field>
                <label className="provider-profile__check">
                  <input type="checkbox" checked={profile.showPublicPhone} onChange={(event) => updateProfile("showPublicPhone", event.target.checked)} />
                  Show this phone number on my public profile
                </label>
                <label className="provider-profile__check">
                  <input type="checkbox" checked={profile.showPublicEmail} onChange={(event) => updateProfile("showPublicEmail", event.target.checked)} />
                  Show this email address on my public profile
                </label>
              </div>
            </section>

            <section id="provider-profile-verification" className="provider-profile__panel">
              <SectionHeading
                icon={<Shield size={20} />}
                title="Verification and account status"
                description="Only authorized administrators can approve a provider or qualification."
              />
              <div className={`provider-profile__verification-card is-${profile.verificationStatus}`}>
                <span><Shield size={20} aria-hidden="true" /></span>
                <div>
                  <strong>{verificationLabel}</strong>
                  <p>
                    {profile.verificationStatus === "verified"
                      ? "Your provider account has been verified."
                      : profile.verificationStatus === "pending"
                        ? "Your submitted documents are awaiting administrator review."
                        : profile.verificationStatus === "suspended"
                          ? "Your account is currently suspended. Contact Skillz Directory support for assistance."
                          : "Submit supporting documents to request verification. Submission does not guarantee approval."}
                  </p>
                </div>
              </div>
              {profile.verificationStatus !== "verified" && profile.verificationStatus !== "suspended" && (
                <button type="button" className="btn btn-outline-secondary" onClick={submitForVerification}>
                  <FileCheck2 size={16} aria-hidden="true" />
                  {profile.verificationStatus === "pending" ? "Resubmit documents for review" : "Submit for verification"}
                </button>
              )}
              {profile.verificationDocuments.some((document) => document.feedback) && (
                <div className="provider-profile__review-feedback">
                  <strong>Administrator feedback</strong>
                  {profile.verificationDocuments.filter((document) => document.feedback).map((document) => (
                    <p key={document.id}>{document.name}: {document.feedback}</p>
                  ))}
                </div>
              )}
              <p className="provider-profile__verification-note">
                This browser prototype cannot verify your identity or send documents to administrators. Verification remains pending until an authorized review process updates your status.
              </p>
            </section>

            <div className="provider-profile__actions">
              <button type="button" className="btn btn-outline-secondary" onClick={cancelChanges} disabled={saving || uploadProgress !== null}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving || uploadProgress !== null}>
                {saving ? "Saving profile…" : <><Check size={16} aria-hidden="true" /> Save changes</>}
              </button>
            </div>
          </form>

          <aside className="provider-profile__preview">
            <p className="provider-profile__eyebrow">PUBLIC PROFILE PREVIEW</p>
            <h2>Visible to residents</h2>
            <div className="provider-profile__preview-card">
              <div className="provider-profile__preview-cover">
                {profile.coverImage && <img src={profile.coverImage} alt="" />}
              </div>
              <div className="provider-profile__preview-logo">
                {profile.businessLogo ? <img src={profile.businessLogo} alt="" /> : <BriefcaseBusiness size={21} />}
              </div>
              <div className="provider-profile__preview-body">
                <span>{category}</span>
                <h3>{businessName || "Your business name"}</h3>
                <p>{person || "Your name"}</p>
                {profile.tagline && <strong>{profile.tagline}</strong>}
                <p className="provider-profile__preview-location"><MapPin size={14} />{profile.city || area}</p>
                <div className="provider-profile__preview-rating">
                  ★ {provider.rating.toFixed(1)} <small>{provider.reviews} reviews</small>
                </div>
                <hr />
                <p>{quote || "Your business description will appear here."}</p>
                {(profile.showPublicPhone && profile.publicPhone) || (profile.showPublicEmail && profile.publicEmail) ? (
                  <small>Public contact details are enabled.</small>
                ) : (
                  <small>Your contact information is hidden.</small>
                )}
              </div>
            </div>
            <p className="provider-profile__preview-note">
              Your public page uses this same profile data after you save. Private account details and verification documents are not shown.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
  wide = false,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`provider-profile__field${wide ? " is-wide" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

function formatDocumentStatus(status: ProviderProfileDocument["status"]) {
  if (status === "pending") return "Pending administrator review";
  if (status === "verified") return "Verified qualification";
  if (status === "rejected") return "Review requested resubmission";
  return "Not yet submitted for review";
}
