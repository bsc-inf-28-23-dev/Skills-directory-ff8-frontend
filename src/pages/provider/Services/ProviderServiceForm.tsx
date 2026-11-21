import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../../../data/provider";
import type {
  ProviderService,
  ProviderServiceInput,
  ProviderServiceStatus,
} from "../../../types/providerService";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const defaultInput: ProviderServiceInput = {
  name: "",
  category: "",
  subcategory: "",
  shortDescription: "",
  description: "",
  images: [],
  coverImageIndex: 0,
  pricingModel: "quotation",
  priceMwk: null,
  operatingLocation: "",
  coverageAreas: [],
  travelsToCustomer: true,
  offeredAtPremises: false,
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  openingTime: "08:00",
  closingTime: "17:00",
  availableForBooking: true,
  status: "draft",
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
          subcategory: service.subcategory,
          shortDescription: service.shortDescription,
          description: service.description,
          images: [...service.images],
          coverImageIndex: service.coverImageIndex,
          pricingModel: service.pricingModel,
          priceMwk: service.priceMwk,
          operatingLocation: service.operatingLocation,
          coverageAreas: [...service.coverageAreas],
          travelsToCustomer: service.travelsToCustomer,
          offeredAtPremises: service.offeredAtPremises,
          workingDays: [...service.workingDays],
          openingTime: service.openingTime,
          closingTime: service.closingTime,
          availableForBooking: service.availableForBooking,
          status: service.status,
          rejectionReason: service.rejectionReason,
        }
      : defaultInput,
  );
  const [coverageText, setCoverageText] = useState(
    service?.coverageAreas.join(", ") ?? "",
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

  async function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setImageError("");

    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setImageError("Choose image files only.");
      return;
    }
    if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
      setImageError("Each image must be 3 MB or smaller.");
      return;
    }
    if (form.images.length + files.length > MAX_IMAGE_COUNT) {
      setImageError(`You can add up to ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    try {
      const images = await Promise.all(files.map(readImage));
      setForm((current) => ({
        ...current,
        images: [...current.images, ...images],
      }));
    } catch (error) {
      console.error("Could not read the selected service images.", error);
      setImageError(
        "We could not read the selected images. Please try again.",
      );
    }
  }

  function toggleDay(day: string) {
    const nextDays = form.workingDays.includes(day)
      ? form.workingDays.filter((item) => item !== day)
      : [...form.workingDays, day];
    update("workingDays", nextDays);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const status: ProviderServiceStatus =
      submitter?.value === "publish" ? "pending" : "draft";
    const amount =
      form.pricingModel === "quotation"
        ? null
        : Number(form.priceMwk);

    if (form.pricingModel !== "quotation" && (!amount || amount <= 0)) {
      setFormError("Enter a price greater than zero, or select Request a quote.");
      return;
    }
    if (!form.workingDays.length) {
      setFormError("Select at least one working day.");
      return;
    }

    const input: ProviderServiceInput = {
      ...form,
      priceMwk: amount,
      coverageAreas: coverageText
        .split(",")
        .map((area) => area.trim())
        .filter(Boolean),
      status,
      rejectionReason: undefined,
    };

    setSaving(true);
    try {
      await onSave(input, status);
    } catch (error) {
      console.error("Could not save the service listing.", error);
      setFormError(
        "Your service could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const imagePreview = form.images[form.coverImageIndex] ?? form.images[0];
  const pricePreview =
    form.pricingModel === "quotation"
      ? "Request a quote"
      : `MWK ${new Intl.NumberFormat("en-MW").format(form.priceMwk ?? 0)}`;

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
              Add clear details to help residents understand what you offer.
            </p>
          </div>
        </header>

        <form className="provider-service-form" onSubmit={handleSubmit}>
          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>01</span>
              <div>
                <h2>Basic information</h2>
                <p>Give your service a clear name and description.</p>
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
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="service-subcategory">
                  Subcategory
                </label>
                <input
                  id="service-subcategory"
                  className="form-control"
                  value={form.subcategory}
                  onChange={(event) =>
                    update("subcategory", event.target.value)
                  }
                  placeholder="e.g. Residential plumbing"
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="service-short-description">
                  Short description *
                </label>
                <input
                  id="service-short-description"
                  className="form-control"
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
              <div className="col-12">
                <label className="form-label" htmlFor="service-description">
                  Full service description *
                </label>
                <textarea
                  id="service-description"
                  className="form-control"
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  maxLength={3000}
                  placeholder="Describe what's included, your experience, and what customers can expect."
                  required
                />
              </div>
            </div>
          </section>

          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>02</span>
              <div>
                <h2>Service images</h2>
                <p>Add up to five images. Each image must be 3 MB or smaller.</p>
              </div>
            </div>
            <label className="provider-service-upload">
              <Upload size={20} aria-hidden="true" />
              <strong>Choose images</strong>
              <span>JPG, PNG, GIF or WebP</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                disabled={form.images.length >= MAX_IMAGE_COUNT}
              />
            </label>
            {imageError && (
              <p className="provider-service-form__error" role="alert">
                {imageError}
              </p>
            )}
            {form.images.length > 0 && (
              <div className="provider-service-images">
                {form.images.map((image, index) => (
                  <div
                    className={`provider-service-images__item${
                      index === form.coverImageIndex ? " is-cover" : ""
                    }`}
                    key={`${image.slice(0, 40)}-${index}`}
                  >
                    <img src={image} alt={`Service image ${index + 1}`} />
                    <button
                      type="button"
                      className="provider-service-images__cover"
                      onClick={() => update("coverImageIndex", index)}
                      aria-pressed={index === form.coverImageIndex}
                    >
                      {index === form.coverImageIndex ? (
                        <>
                          <Star size={13} fill="currentColor" /> Cover
                        </>
                      ) : (
                        "Set as cover"
                      )}
                    </button>
                    <button
                      type="button"
                      className="provider-service-images__remove"
                      aria-label={`Remove image ${index + 1}`}
                      onClick={() =>
                        setForm((current) => {
                          const images = current.images.filter(
                            (_, imageIndex) => imageIndex !== index,
                          );
                          return {
                            ...current,
                            images,
                            coverImageIndex:
                              images.length === 0
                                ? 0
                                : index < current.coverImageIndex
                                  ? current.coverImageIndex - 1
                                  : Math.min(
                                      current.coverImageIndex,
                                      images.length - 1,
                                    ),
                          };
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>03</span>
              <div>
                <h2>Pricing</h2>
                <p>Tell residents how your service is priced.</p>
              </div>
            </div>
            <div className="provider-service-pricing">
              {(
                [
                  ["fixed", "Fixed price", "One set price"],
                  ["starting", "Starting from", "Price depends on the work"],
                  ["quotation", "Request a quote", "Discuss price with customer"],
                ] as const
              ).map(([model, label, description]) => (
                <label
                  className={`provider-service-pricing__option${
                    form.pricingModel === model ? " is-selected" : ""
                  }`}
                  key={model}
                >
                  <input
                    type="radio"
                    name="pricing-model"
                    checked={form.pricingModel === model}
                    onChange={() => update("pricingModel", model)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
            {form.pricingModel !== "quotation" && (
              <div className="provider-service-price-input">
                <label className="form-label" htmlFor="service-price">
                  Price (MWK) *
                </label>
                <div className="input-group">
                  <span className="input-group-text">MWK</span>
                  <input
                    id="service-price"
                    className="form-control"
                    type="number"
                    min="1"
                    step="1"
                    value={form.priceMwk ?? ""}
                    onChange={(event) =>
                      update(
                        "priceMwk",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    required
                  />
                </div>
              </div>
            )}
          </section>

          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>04</span>
              <div>
                <h2>Location and coverage</h2>
                <p>Let customers know where the service is available.</p>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="service-location">
                  Operating location *
                </label>
                <input
                  id="service-location"
                  className="form-control"
                  value={form.operatingLocation}
                  onChange={(event) =>
                    update("operatingLocation", event.target.value)
                  }
                  placeholder="Town, district or neighborhood"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="service-coverage">
                  Coverage areas
                </label>
                <input
                  id="service-coverage"
                  className="form-control"
                  value={coverageText}
                  onChange={(event) => setCoverageText(event.target.value)}
                  placeholder="Separate areas with commas"
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-3">
                <label className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.travelsToCustomer}
                    onChange={(event) =>
                      update("travelsToCustomer", event.target.checked)
                    }
                  />
                  <span className="form-check-label">
                    I travel to the customer
                  </span>
                </label>
                <label className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.offeredAtPremises}
                    onChange={(event) =>
                      update("offeredAtPremises", event.target.checked)
                    }
                  />
                  <span className="form-check-label">
                    Customers can visit my premises
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="provider-service-form__section">
            <div className="provider-service-form__section-heading">
              <span>05</span>
              <div>
                <h2>Availability</h2>
                <p>Set your usual working days and hours.</p>
              </div>
            </div>
            <fieldset className="provider-service-days">
              <legend className="form-label">Working days *</legend>
              <div>
                {WEEKDAYS.map((day) => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={form.workingDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="row g-3 mt-1">
              <div className="col-6 col-md-3">
                <label className="form-label" htmlFor="service-opens">
                  Opens
                </label>
                <input
                  id="service-opens"
                  className="form-control"
                  type="time"
                  value={form.openingTime}
                  onChange={(event) => update("openingTime", event.target.value)}
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label" htmlFor="service-closes">
                  Closes
                </label>
                <input
                  id="service-closes"
                  className="form-control"
                  type="time"
                  value={form.closingTime}
                  onChange={(event) => update("closingTime", event.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-end">
                <label className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.availableForBooking}
                    onChange={(event) =>
                      update("availableForBooking", event.target.checked)
                    }
                  />
                  <span className="form-check-label">
                    Currently available for booking
                  </span>
                </label>
              </div>
            </div>
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
              {imagePreview ? (
                <img src={imagePreview} alt="" />
              ) : (
                <div className="provider-service-preview__image">
                  <ImagePlus size={28} />
                </div>
              )}
              <div>
                <span>{form.category || "Service category"}</span>
                <h2>{form.name || "Your service name"}</h2>
                <p>{form.shortDescription || "Your short description appears here."}</p>
                <strong>{pricePreview}</strong>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
