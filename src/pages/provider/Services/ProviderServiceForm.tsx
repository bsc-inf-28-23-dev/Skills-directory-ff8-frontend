import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../../../data/provider";
import type {
  ProviderService,
  ProviderServiceInput,
  ProviderServiceStatus,
} from "../../../types/providerService";

const MAX_IMAGE_SIZE = 6 * 1024 * 1024;
const defaultInput: ProviderServiceInput = {
  name: "",
  category: "",
  shortDescription: "",
  imageUrl: "",
};

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error(`Could not read ${file.name}.`));
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export default function ProviderServiceForm({
  service,
  onSave,
}: {
  service?: ProviderService;
  onSave: (
    input: ProviderServiceInput,
    status: ProviderServiceStatus,
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<ProviderServiceInput>(() =>
    service
      ? {
          name: service.name,
          category: service.category,
          shortDescription: service.shortDescription,
          imageUrl: service.imageUrl,
        }
      : defaultInput,
  );
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function update<K extends keyof ProviderServiceInput>(
    key: K,
    value: ProviderServiceInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImageError("");

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Choose an image file.");
      return;
    }
    if (file.size >= MAX_IMAGE_SIZE) {
      setImageError("The image must be smaller than 6 MB.");
      return;
    }

    try {
      update("imageUrl", await readImage(file));
    } catch (error) {
      console.error("Could not read the selected service image.", error);
      setImageError("We could not read the selected image. Please try again.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const status: ProviderServiceStatus =
      submitter?.value === "publish" ? "pending" : "draft";

    if (!form.imageUrl) {
      setFormError("Add a service image before saving.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form, status);
    } catch (error) {
      console.error("Could not save the service listing.", error);
      setFormError("Your service could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="provider-services-page">
      <div className="provider-services-page__container">
        <Link to="/provider/services" className="provider-services__back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to My Services
        </Link>

        <header className="provider-services__page-heading">
          <div>
            <p className="eyebrow">{service ? "Update your listing" : "Grow your business"}</p>
            <h1>{service ? "Edit service" : "Add a new service"}</h1>
            <p>
              Add the essentials. Your provider profile will be linked
              automatically.
            </p>
          </div>
        </header>

        <form className="provider-service-form" onSubmit={handleSubmit}>
          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>01</span>
              <div>
                <h2>Service information</h2>
                <p>Tell residents what you offer.</p>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-7">
                <label className="form-label" htmlFor="service-name">
                  Service name *
                </label>
                <input
                  id="service-name"
                  className="form-control"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="col-12 col-md-5">
                <label className="form-label" htmlFor="service-category">
                  Category *
                </label>
                <select
                  id="service-category"
                  className="form-select"
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="service-short-description">
                  Short description *
                </label>
                <textarea
                  id="service-short-description"
                  className="form-control"
                  rows={3}
                  value={form.shortDescription}
                  onChange={(event) =>
                    update("shortDescription", event.target.value)
                  }
                  maxLength={180}
                  placeholder="A short summary residents will see in listings"
                  required
                />
                <div className="form-text text-end">
                  {form.shortDescription.length}/180
                </div>
              </div>
            </div>
          </section>

          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>02</span>
              <div>
                <h2>Service image</h2>
                <p>Choose one image smaller than 6 MB.</p>
              </div>
            </div>
            <label className="provider-service-upload" htmlFor="service-image">
              <Upload size={20} aria-hidden="true" />
              <strong>{form.imageUrl ? "Replace image" : "Choose image"}</strong>
              <span>JPG, PNG, GIF or WebP · Under 6 MB</span>
              <input
                id="service-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!form.imageUrl}
                aria-describedby={imageError ? "service-image-error" : undefined}
              />
            </label>
            {imageError && (
              <p
                id="service-image-error"
                className="provider-service-form__error"
                role="alert"
              >
                {imageError}
              </p>
            )}
            {form.imageUrl && (
              <div className="provider-service-images">
                <div className="provider-service-images__item is-cover">
                  <img src={form.imageUrl} alt="Service preview" />
                  <button
                    type="button"
                    className="provider-service-images__remove"
                    aria-label="Remove service image"
                    onClick={() => update("imageUrl", "")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {formError && (
            <p className="provider-service-form__error" role="alert">
              {formError}
            </p>
          )}

          <footer className="provider-service-form__actions">
            <Link to="/provider/services" className="btn btn-trade">
              Cancel
            </Link>
            <button
              type="button"
              className="btn btn-trade"
              onClick={() => setPreviewOpen((open) => !open)}
            >
              {previewOpen ? "Hide preview" : "Preview service"}
            </button>
            <button
              type="submit"
              name="intent"
              value="draft"
              className="btn btn-trade"
              disabled={saving}
            >
              Save as draft
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              className="btn btn-athletic"
              disabled={saving}
            >
              {saving ? "Saving..." : "Submit for approval"}
            </button>
          </footer>
        </form>

        {previewOpen && (
          <aside className="provider-service-preview" aria-label="Service preview">
            <p className="eyebrow">Marketplace preview</p>
            <div className="provider-service-preview__card">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" />
              ) : (
                <div className="provider-service-preview__image">
                  <ImagePlus size={28} />
                </div>
              )}
              <div>
                <span>{form.category || "Service category"}</span>
                <h2>{form.name || "Your service name"}</h2>
                <p>
                  {form.shortDescription ||
                    "Your short description appears here."}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
