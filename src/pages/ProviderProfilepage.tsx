
import { useState } from "react";
import type { FormEvent } from "react";
import type { Provider } from "../types/provider";

interface ProviderProfilePageProps {
  provider: Provider;
  providers: Provider[];
  categories: string[];
  onBack: () => void;
  onSave: (updatedProvider: Provider) => Promise<boolean>;
  onSelectProvider: (providerId: string) => void;
}

export default function ProviderProfilePage({
  provider,
  providers,
  categories,
  onBack,
  onSave,
  onSelectProvider,
}: ProviderProfilePageProps) {
  const [form, setForm] = useState({
    name: provider.name,
    person: provider.person,
    category: provider.category,
    area: provider.area,
    quote: provider.quote,
    services: provider.services.join(", "),
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(provider.photo ?? "");
  const [photoError, setPhotoError] = useState("");
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  function handlePhotoChange(file?: File) {
    setPhotoError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Your image must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoPreview(reader.result);
        setPhotoLoadFailed(false);
        setSaved(false);
      }
    };

    reader.onerror = () => {
      setPhotoError("We couldn't read that image. Please try again.");
    };

    reader.readAsDataURL(file);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const updatedProvider: Provider = {
      ...provider,
      name: form.name.trim(),
      person: form.person.trim(),
      category: form.category,
      area: form.area.trim(),
      quote: form.quote.trim(),
      services: form.services
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean),
      photo: photoPreview || undefined,
    };

    try {
      setSaved(await onSave(updatedProvider));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-page">
      <div className="page-container">
        <button
          type="button"
          className="btn-provider-outline mb-4"
          onClick={onBack}
        >
          ← Back to service listings
        </button>

        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">PROVIDER WORKSPACE</p>
            <h1 className="profile-title">Manage your profile.</h1>
            <p className="profile-description">
              Keep your details accurate so customers know who you are,
              what you do, and where you work.
            </p>
          </div>

          <div className="profile-status">
            <span className="profile-status-dot" />
            Local editor
          </div>
        </div>

        <div className="profile-provider-select">
          <label htmlFor="profile-provider">Editing provider</label>
          <select
            id="profile-provider"
            className="form-select"
            value={provider.id}
            onChange={(event) => onSelectProvider(event.target.value)}
          >
            {providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="profile-layout">
          <form className="profile-form" onSubmit={handleSubmit}>
            <section className="profile-panel">
              <div className="profile-panel-heading">
                <span className="profile-step">01</span>
                <div>
                  <h2>Basic information</h2>
                  <p>Introduce yourself and your business.</p>
                </div>
              </div>

              <div className="profile-photo-section">
                <div className="profile-photo-preview">
                  {photoPreview && !photoLoadFailed ? (
                    <img
                      src={photoPreview}
                      alt="Your profile"
                      onError={() => setPhotoLoadFailed(true)}
                    />
                  ) : (
                    <span>
                      {form.name.trim().charAt(0).toUpperCase() || "S"}
                    </span>
                  )}
                </div>

                <div className="profile-photo-controls">
                  <h3>Profile picture</h3>
                  <p>
                    Add a clear photo or business logo so customers can
                    recognize you.
                  </p>

                  <label
                    htmlFor="provider-photo"
                    className="btn-provider-outline"
                  >
                    Upload picture
                  </label>

                  <input
                    id="provider-photo"
                    className="profile-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      handlePhotoChange(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />

                  {photoPreview && (
                    <button
                      type="button"
                      className="profile-photo-remove"
                      onClick={() => {
                        setPhotoPreview("");
                        setPhotoLoadFailed(false);
                        setPhotoError("");
                        setSaved(false);
                      }}
                    >
                      Remove picture
                    </button>
                  )}

                  <small>Images only · Maximum file size: 5 MB</small>

                  {photoError && (
                    <p className="profile-photo-error" role="alert">
                      {photoError}
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-fields">
                <div className="profile-field">
                  <label htmlFor="provider-name">Business name</label>
                  <input
                    id="provider-name"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="provider-person">Contact person</label>
                  <input
                    id="provider-person"
                    className="form-control"
                    value={form.person}
                    onChange={(e) => updateField("person", e.target.value)}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="provider-category">Main category</label>
                  <select
                    id="provider-category"
                    className="form-select"
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    required
                  >
                    {!categories.includes(form.category) && (
                      <option value={form.category}>{form.category}</option>
                    )}
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="profile-field">
                  <label htmlFor="provider-area">Service area</label>
                  <input
                    id="provider-area"
                    className="form-control"
                    value={form.area}
                    onChange={(e) => updateField("area", e.target.value)}
                    placeholder="e.g. Zomba, Malawi"
                    required
                  />
                  <small>
                    The map pin is a sample location and does not update from
                    this field.
                  </small>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="provider-services">
                    Services offered
                  </label>
                  <textarea
                    id="provider-services"
                    className="form-control"
                    rows={3}
                    value={form.services}
                    onChange={(e) => updateField("services", e.target.value)}
                    placeholder="Separate services with commas"
                    required
                  />
                  <small>
                    Separate each service with a comma.
                  </small>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="provider-quote">
                    About your business
                  </label>
                  <textarea
                    id="provider-quote"
                    className="form-control"
                    rows={4}
                    value={form.quote}
                    onChange={(e) => updateField("quote", e.target.value)}
                    placeholder="Describe your experience and the work you do."
                  />
                </div>
              </div>

              <div className="profile-form-footer">
                {saved && (
                  <p className="profile-saved-message" role="status">
                    ✓ Profile changes saved in this browser.
                  </p>
                )}

                <button type="submit" className="btn-brand" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </section>
          </form>

          <aside className="profile-preview">
            <p className="profile-eyebrow">CUSTOMER PREVIEW</p>
            <h2>Your public profile</h2>
            <p className="profile-preview-hint">
              This preview updates as you edit your details.
            </p>

            <div className="profile-preview-card">
              <div className="profile-preview-cover">
                {photoPreview && !photoLoadFailed ? (
                  <img
                    className="profile-avatar profile-avatar-image"
                    src={photoPreview}
                    alt={`${form.name || "Provider"} profile`}
                    onError={() => setPhotoLoadFailed(true)}
                  />
                ) : (
                  <span className="profile-avatar">
                    {form.name.trim().charAt(0).toUpperCase() || "S"}
                  </span>
                )}
              </div>

              <div className="profile-preview-body">
                <span className="profile-category">
                  {form.category || "Service provider"}
                </span>

                <h3>{form.name || "Your business name"}</h3>
                <p className="profile-preview-person">
                  {form.person || "Contact person"}
                </p>

                <p className="profile-preview-location">
                  <span aria-hidden="true">⌖</span>{" "}
                  {form.area || "Your service area"}
                </p>

                <div className="profile-preview-rating">
                  <span>★ {provider.rating.toFixed(1)}</span>
                  <span>{provider.reviews} reviews</span>
                </div>

                <hr />

                <h4>Services</h4>
                <div className="profile-service-tags">
                  {form.services
                    .split(",")
                    .map((service) => service.trim())
                    .filter(Boolean)
                    .map((service) => (
                      <span key={service}>{service}</span>
                    ))}
                </div>

                <h4 className="mt-4">About</h4>
                <p className="profile-preview-about">
                  {form.quote || "Your business description will appear here."}
                </p>
              </div>
            </div>

            <p className="profile-preview-note">
              Ratings and reviews are sample data for this demo and cannot be
              edited here.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
