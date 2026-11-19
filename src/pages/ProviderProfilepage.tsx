import { useState, useEffect, type FormEvent } from "react";
import { providerService } from "../services/providerService";
import Eyebrow from "../components/Eyebrow";

export default function ProviderProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // The form state matching your teammate's layout
  const [form, setForm] = useState({
    name: "",
    person: "",
    category: "",
    area: "",
    quote: "",
    services: "",
  });

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  // 1. Fetch real data from the backend on load
  useEffect(() => {
    async function loadData() {
      try {
        const data = await providerService.getMyProfile();
        setForm({
          name: data.businessName || "",
          person: data.contactPerson || "",
          category: data.category || "",
          area: data.serviceArea || "",
          quote: data.about || "",
          services: (data.skills || []).join(", "),
        });
        setPhotoPreview(data.photoUrl || "");
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load your profile. Ensure you are logged in as a Provider.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      // Split the comma-separated services into an array for the backend
      const skillsArray = form.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Send the PATCH request to update the profile
      await providerService.updateMyProfile({
        businessName: form.name.trim(),
        contactPerson: form.person.trim(),
        category: form.category,
        serviceArea: form.area.trim(),
        about: form.quote.trim(),
      });

      // Send the PUT request to update skills (as per your Swagger UI)
      await providerService.updateMySkills(skillsArray);

      setSaved(true);
    } catch (error) {
      console.error("Could not save provider profile.", error);
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-5 text-center">Loading profile...</div>;

  return (
    <main className="profile-page">
      <div className="page-container">
        
        <header className="mb-5">
          <Eyebrow>Provider Workspace</Eyebrow>
          <h1 className="display-heading display-heading-lg mb-3">
            Manage your <span className="text-primary">profile.</span>
          </h1>
          <p className="text-muted-ink" style={{ maxWidth: 600 }}>
            Keep your details accurate so customers know who you are, what you do, and where you work.
          </p>
        </header>

        {errorMsg && <div className="alert alert-danger mb-4">{errorMsg}</div>}

        <div className="row g-5">
          {/* LEFT COLUMN: The Form */}
          <div className="col-12 col-lg-7">
            <form className="surface-box p-4 p-md-5" onSubmit={handleSubmit}>
              <h2 className="section-label mb-4">Basic Information</h2>

              {/* Profile Picture */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                <div 
                  className="d-flex align-items-center justify-content-center bg-dark text-white" 
                  style={{ width: 80, height: 80, fontSize: 32, borderRadius: 4, overflow: "hidden" }}
                >
                  {photoPreview && !photoLoadFailed ? (
                    <img
                      src={photoPreview}
                      alt=""
                      onError={() => setPhotoLoadFailed(true)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>{form.name.trim().charAt(0).toUpperCase() || "P"}</span>
                  )}
                </div>
                <div>
                  <h3 className="h6 mb-1">Profile picture</h3>
                  <p className="small text-muted-ink mb-0">Image upload will be connected in the next sprint.</p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="form-field">
                    <label>Business name</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="form-field">
                    <label>Contact person</label>
                    <input
                      className="form-control"
                      value={form.person}
                      onChange={(e) => updateField("person", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="form-field">
                    <label>Main category</label>
                    <input
                      className="form-control"
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="form-field">
                    <label>Service area</label>
                    <input
                      className="form-control"
                      value={form.area}
                      onChange={(e) => updateField("area", e.target.value)}
                      placeholder="e.g. Zomba, Malawi"
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-field">
                    <label>Services offered</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.services}
                      onChange={(e) => updateField("services", e.target.value)}
                      placeholder="Plumbing, Pipe Repair, Installation"
                      required
                    />
                    <div className="form-text">Separate each service with a comma.</div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-field">
                    <label>About your business</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.quote}
                      onChange={(e) => updateField("quote", e.target.value)}
                      placeholder="Describe your experience and the work you do."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-top d-flex align-items-center gap-3">
                <button type="submit" className="btn btn-athletic" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                {saved && <span className="text-success fw-bold small">✓ Profile saved to database!</span>}
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Preview */}
          <div className="col-12 col-lg-5">
            <aside className="surface-box p-4 sticky-top" style={{ top: 100 }}>
              <h2 className="section-label">Customer Preview</h2>
              <p className="text-muted-ink small mb-4">This is how residents will see your business.</p>

              <div className="p-4 bg-light border rounded">
                <span className="badge text-bg-primary mb-2 text-uppercase">
                  {form.category || "Service Provider"}
                </span>

                <h3 className="display-heading display-heading-md mb-1">
                  {form.name || "Your business name"}
                </h3>
                <p className="text-muted-ink mb-2">
                  {form.person || "Contact person"} · {form.area || "Your service area"}
                </p>

                <hr />

                <h4 className="section-label mt-4">Services</h4>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {form.services.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="badge text-bg-light border text-dark">{s}</span>
                  ))}
                </div>

                <h4 className="section-label">About</h4>
                <p className="small text-muted-ink mb-0">
                  {form.quote || "Your business description will appear here."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}