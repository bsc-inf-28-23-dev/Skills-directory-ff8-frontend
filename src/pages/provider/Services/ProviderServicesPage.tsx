import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  FilterX,
  Search,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";
import ConfirmModal from "../../../components/ConfirmModal";
import EmptyState from "../../../components/EmptyState";
import ErrorAlert from "../../../components/ErrorAlert";
import { useAuth } from "../../../hooks/useAuth";
import { loadProviderServices, saveProviderServices } from "../../../data/providerServiceStorage";
import type {
  ProviderService,
  ProviderServiceInput,
  ProviderServiceStatus,
} from "../../../types/providerService";
import ProviderServiceCard from "./ProviderServiceCard";
import ProviderServiceForm from "./ProviderServiceForm";
import ServiceStats from "./ServiceStats";
import "./ProviderServicesPage.css";

type ServiceFilterStatus = "all" | ProviderServiceStatus;
type ServiceSort = "newest" | "oldest" | "bookings" | "rating";
const PAGE_SIZE = 6;

function createServiceId() {
  return globalThis.crypto?.randomUUID?.() ??
    `service-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatPrice(service: ProviderService) {
  if (service.pricingModel === "quotation") return "Request a quotation";
  const amount = new Intl.NumberFormat("en-MW", {
    maximumFractionDigits: 0,
  }).format(service.priceMwk ?? 0);
  return `${service.pricingModel === "starting" ? "Starting from " : ""}MWK ${amount}`;
}

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const createMatch = useMatch("/provider/services/new");
  const editMatch = useMatch("/provider/services/:serviceId/edit");
  const detailMatch = useMatch("/provider/services/:serviceId");
  const [initialStorage] = useState(() => {
    if (!user || user.role !== "provider") {
      return { services: [] as ProviderService[], error: "" };
    }
    try {
      return { services: loadProviderServices(user.id), error: "" };
    } catch (error) {
      console.error("Could not load provider services.", error);
      return {
        services: [] as ProviderService[],
        error: "Saved services could not be loaded from this browser.",
      };
    }
  });
  const [services, setServices] = useState<ProviderService[]>(
    () => initialStorage.services,
  );
  const [storageError, setStorageError] = useState(
    () => initialStorage.error,
  );
  const [storageNotice, setStorageNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceFilterStatus>("all");
  const [sortBy, setSortBy] = useState<ServiceSort>("newest");
  const [page, setPage] = useState(1);
  const [serviceToDelete, setServiceToDelete] = useState<ProviderService | null>(
    null,
  );
  const [showHelp, setShowHelp] = useState(false);

  const categories = useMemo(
    () => [...new Set(services.map((service) => service.category))].sort(),
    [services],
  );

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services
      .filter((service) => {
        const matchesSearch =
          !query ||
          `${service.name} ${service.shortDescription} ${service.description}`
            .toLowerCase()
            .includes(query);
        const matchesCategory =
          !categoryFilter || service.category === categoryFilter;
        const matchesStatus =
          statusFilter === "all" || service.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return a.createdAt.localeCompare(b.createdAt);
        }
        if (sortBy === "bookings") {
          return (b.bookingCount ?? -1) - (a.bookingCount ?? -1);
        }
        if (sortBy === "rating") {
          return (b.averageRating ?? -1) - (a.averageRating ?? -1);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [categoryFilter, search, services, sortBy, statusFilter]);

  const visibleServices = filteredServices.slice(0, page * PAGE_SIZE);
  const activeService = detailMatch
    ? services.find((service) => service.id === detailMatch.params.serviceId)
    : undefined;
  const formService = editMatch
    ? services.find((service) => service.id === editMatch.params.serviceId)
    : undefined;

  function persist(nextServices: ProviderService[], notice: string) {
    if (!user || user.role !== "provider") return false;
    try {
      saveProviderServices(user.id, nextServices);
      setServices(nextServices);
      setStorageError("");
      setStorageNotice(notice);
      return true;
    } catch (error) {
      console.error("Could not save provider services.", error);
      setStorageError(
        "Your changes could not be saved in this browser. Check available storage and try again.",
      );
      setStorageNotice("");
      return false;
    }
  }

  async function saveService(
    input: ProviderServiceInput,
    status: ProviderServiceStatus,
  ) {
    if (!user || user.role !== "provider") {
      throw new Error("Sign in with a provider account to manage services.");
    }

    const now = new Date().toISOString();
    const existing = formService;
    const service: ProviderService = {
      ...input,
      id: existing?.id ?? createServiceId(),
      providerId: user.id,
      status,
      bookingCount: existing?.bookingCount ?? null,
      averageRating: existing?.averageRating ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const nextServices = existing
      ? services.map((item) => (item.id === existing.id ? service : item))
      : [service, ...services];

    if (
      persist(
        nextServices,
        status === "pending"
          ? "Service submitted for approval."
          : "Draft saved.",
      )
    ) {
      navigate(`/provider/services/${service.id}`);
    } else {
      throw new Error(
        "Your service was not saved. Please check the message above and try again.",
      );
    }
  }

  function changeStatus(service: ProviderService) {
    const nextStatus: ProviderServiceStatus =
      service.status === "active"
        ? "inactive"
        : service.status === "pending"
          ? "draft"
          : "pending";
    const updated = {
      ...service,
      status: nextStatus,
      rejectionReason: undefined,
      updatedAt: new Date().toISOString(),
    };
    persist(
      services.map((item) => (item.id === service.id ? updated : item)),
      nextStatus === "inactive"
        ? "Service deactivated and hidden from residents."
        : nextStatus === "draft"
          ? "Approval submission withdrawn. Service saved as a draft."
          : "Service submitted for approval.",
    );
  }

  function deleteService() {
    if (!serviceToDelete) return;
    const deletedName = serviceToDelete.name;
    if (
      persist(
        services.filter((service) => service.id !== serviceToDelete.id),
        `"${deletedName}" was deleted.`,
      )
    ) {
      setServiceToDelete(null);
      if (detailMatch) navigate("/provider/services");
    }
  }

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("all");
    setSortBy("newest");
    setPage(1);
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user.role !== "provider") {
    return <Navigate to="/resident/dashboard" replace />;
  }

  if (!createMatch && !editMatch && detailMatch && !activeService) {
    return <Navigate to="/provider/services" replace />;
  }
  if (editMatch && !formService) {
    return <Navigate to="/provider/services" replace />;
  }

  return (
    <main className="provider-services-page">
      <div className="provider-services-page__container">
        <div className="provider-services__prototype-note" role="note">
          <strong>Prototype storage:</strong> service changes are saved in this
          browser under your signed-in account. Publishing and approval require
          backend integration.
          <button
            type="button"
            aria-label="More about prototype storage"
            onClick={() => setShowHelp((visible) => !visible)}
          >
            {showHelp ? "Hide details" : "Why?"}
          </button>
          {showHelp && (
            <p>
              Listings created here are not yet sent to Skillz Directory or
              visible to residents. Browser storage is not a secure boundary;
              the backend must enforce provider ownership before production.
            </p>
          )}
        </div>

        {storageError && <ErrorAlert message={storageError} />}
        {storageNotice && (
          <div className="provider-services__notice" role="status">
            {storageNotice}
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setStorageNotice("")}
            >
              ×
            </button>
          </div>
        )}

        {createMatch || editMatch ? (
          <ProviderServiceForm
            key={formService?.id ?? "new-service"}
            service={formService}
            onSave={saveService}
          />
        ) : detailMatch && activeService ? (
          <ServiceDetails
            service={activeService}
            onDelete={() => setServiceToDelete(activeService)}
            onChangeStatus={() => changeStatus(activeService)}
          />
        ) : (
          <>
            <header className="provider-services__header">
              <div>
                <p className="eyebrow">Provider workspace</p>
                <h1>My Services</h1>
                <p>
                  Manage and advertise the services you offer on Skillz
                  Directory.
                </p>
              </div>
              <div className="provider-services__header-actions">
                <button
                  type="button"
                  className="provider-services__help-link"
                  onClick={() => setShowHelp((visible) => !visible)}
                >
                  {showHelp ? "Hide help" : "Listing help"}
                </button>
                <Link
                  to="/provider/services/new"
                  className="btn btn-athletic provider-services__add-button"
                >
                  <CirclePlus size={18} aria-hidden="true" />
                  Add New Service
                </Link>
              </div>
            </header>

            {showHelp && (
              <div className="provider-services__help">
                Complete each listing with clear pricing, location and
                availability. New submissions are saved as pending approval.
              </div>
            )}

            <ServiceStats services={services} />

            <section className="provider-services__listing-section">
              <div className="provider-services__listing-heading">
                <div>
                  <h2>Your listings</h2>
                  <p>
                    {filteredServices.length}{" "}
                    {filteredServices.length === 1 ? "service" : "services"}
                  </p>
                </div>
              </div>

              <div className="provider-services__filters">
                <label className="provider-services__search">
                  <Search size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search services"
                    aria-label="Search services by name or description"
                  />
                </label>
                <label>
                  <span className="visually-hidden">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(event) => {
                      setCategoryFilter(event.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter by category"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="visually-hidden">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as ServiceFilterStatus);
                      setPage(1);
                    }}
                    aria-label="Filter by listing status"
                  >
                    <option value="all">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <label className="provider-services__sort">
                  <ArrowDownWideNarrow size={16} aria-hidden="true" />
                  <span className="visually-hidden">Sort services</span>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as ServiceSort)
                    }
                    aria-label="Sort services"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="bookings">Most booked</option>
                    <option value="rating">Highest rated</option>
                  </select>
                </label>
                {(search || categoryFilter || statusFilter !== "all") && (
                  <button
                    type="button"
                    className="provider-services__clear"
                    onClick={resetFilters}
                  >
                    <FilterX size={15} aria-hidden="true" /> Clear
                  </button>
                )}
              </div>

              {services.length === 0 ? (
                <div className="provider-services__empty">
                  <EmptyState
                    icon="bi-briefcase"
                    title="You haven't added any services yet"
                  >
                    Create your first listing to organize the services you
                    offer.
                  </EmptyState>
                  <Link to="/provider/services/new" className="btn btn-athletic">
                    <CirclePlus size={17} aria-hidden="true" />
                    Add your first service
                  </Link>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="provider-services__empty provider-services__empty--filtered">
                  <Search size={27} aria-hidden="true" />
                  <h3>No matching services</h3>
                  <p>Try changing your search or filters.</p>
                  <button
                    type="button"
                    className="btn btn-trade"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="provider-services__grid">
                    {visibleServices.map((service) => (
                      <ProviderServiceCard
                        key={service.id}
                        service={service}
                        onChangeStatus={changeStatus}
                        onDelete={setServiceToDelete}
                      />
                    ))}
                  </div>
                  {visibleServices.length < filteredServices.length && (
                    <button
                      type="button"
                      className="provider-services__load-more"
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Load more services <ArrowRight size={16} />
                    </button>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>

      <ConfirmModal
        show={Boolean(serviceToDelete)}
        title="Delete service?"
        message={`"${serviceToDelete?.name ?? ""}" will be removed from this browser. This cannot be undone.`}
        confirmLabel="Delete service"
        onCancel={() => setServiceToDelete(null)}
        onConfirm={deleteService}
      />
    </main>
  );
}

function ServiceDetails({
  service,
  onDelete,
  onChangeStatus,
}: {
  service: ProviderService;
  onDelete: () => void;
  onChangeStatus: () => void;
}) {
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(service.coverImageIndex);
  const coverImage = service.images[imageIndex] ?? service.images[0];
  const statusLabels: Record<ProviderServiceStatus, string> = {
    draft: "Draft",
    pending: "Pending approval",
    active: "Active",
    inactive: "Inactive",
    rejected: "Rejected",
  };

  return (
    <div className="provider-service-detail">
      <button
        type="button"
        className="provider-services__back-link"
        onClick={() => navigate("/provider/services")}
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Back to My Services
      </button>

      <header className="provider-service-detail__header">
        <div>
          <p className="eyebrow">{service.category}</p>
          <h1>{service.name}</h1>
          <p>{service.shortDescription}</p>
        </div>
        <div className="provider-service-detail__actions">
          <Link
            to={`/provider/services/${service.id}/edit`}
            className="btn btn-trade"
          >
            Edit service
          </Link>
          <button
            type="button"
            className="btn btn-athletic"
            onClick={onChangeStatus}
          >
            {service.status === "active"
              ? "Deactivate"
              : service.status === "pending"
                ? "Withdraw submission"
                : "Submit for approval"}
          </button>
        </div>
      </header>

      <div className="provider-service-detail__layout">
        <div className="provider-service-detail__main">
          <section className="provider-service-detail__gallery">
            {coverImage ? (
              <img src={coverImage} alt={`${service.name} service`} />
            ) : (
              <div className="provider-service-detail__no-image">
                No service images added
              </div>
            )}
            {service.images.length > 1 && (
              <div className="provider-service-detail__thumbnails">
                {service.images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image.slice(0, 40)}-${index}`}
                    className={index === imageIndex ? "is-selected" : ""}
                    onClick={() => setImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={index === imageIndex}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="provider-service-detail__panel">
            <h2>About this service</h2>
            <p>{service.description}</p>
            {service.subcategory && (
              <p>
                <strong>Subcategory:</strong> {service.subcategory}
              </p>
            )}
          </section>

          <section className="provider-service-detail__panel">
            <h2>Availability and coverage</h2>
            <dl>
              <div>
                <dt>Location</dt>
                <dd>{service.operatingLocation || "Not specified"}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>
                  {service.coverageAreas.length
                    ? service.coverageAreas.join(", ")
                    : "Not specified"}
                </dd>
              </div>
              <div>
                <dt>Working days</dt>
                <dd>{service.workingDays.join(", ")}</dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>
                  {service.openingTime}–{service.closingTime}
                </dd>
              </div>
              <div>
                <dt>Booking availability</dt>
                <dd>{service.availableForBooking ? "Available" : "Unavailable"}</dd>
              </div>
            </dl>
          </section>

          <section className="provider-service-detail__panel">
            <h2>Customer reviews</h2>
            <p className="provider-service-detail__unavailable">
              Service-specific reviews will appear here when connected to the
              reviews API.
            </p>
          </section>
        </div>

        <aside className="provider-service-detail__sidebar">
          <section className="provider-service-detail__panel">
            <span className={`provider-service-status is-${service.status}`}>
              {statusLabels[service.status]}
            </span>
            <p className="provider-service-detail__price">
              {formatPrice(service)}
            </p>
            <p className="provider-service-detail__small">
              {service.pricingModel === "quotation"
                ? "Customers contact you for pricing."
                : "Pricing shown in Malawian Kwacha."}
            </p>
          </section>

          <section className="provider-service-detail__metrics">
            <h2>Performance</h2>
            <div>
              <span>Booking requests</span>
              <strong>{service.bookingCount ?? "—"}</strong>
            </div>
            <div>
              <span>Completed bookings</span>
              <strong>—</strong>
            </div>
            <div>
              <span>Average rating</span>
              <strong>
                {service.averageRating == null
                  ? "—"
                  : service.averageRating.toFixed(1)}
              </strong>
            </div>
            <p>Performance data will appear when connected to the backend.</p>
          </section>

          <button
            type="button"
            className="provider-service-detail__delete"
            onClick={onDelete}
          >
            Delete service
          </button>
        </aside>
      </div>
    </div>
  );
}
