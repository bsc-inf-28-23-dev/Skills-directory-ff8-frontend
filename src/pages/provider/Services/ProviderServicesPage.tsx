import { useEffect, useMemo, useState } from "react";
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
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { loadProviderServices, saveProviderServices } from "../../../data/providerServiceStorage";
import { getProviderProfileRouteId } from "../../../data/providerAccount";
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
type ServiceSort = "newest" | "oldest" | "rating";
const PAGE_SIZE = 6;

function createServiceId() {
  return globalThis.crypto?.randomUUID?.() ??
    `service-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const createMatch = useMatch("/provider/services/new");
  const editMatch = useMatch("/provider/services/:serviceId/edit");
  const detailMatch = useMatch("/provider/services/:serviceId");
  const providerProfileId =
    user?.role === "provider"
      ? getProviderProfileRouteId(user) ?? user.id
      : "";
  const [services, setServices] = useState<ProviderService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [storageError, setStorageError] = useState("");
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

  useEffect(() => {
    let isCurrent = true;
    if (!user || user.role !== "provider") {
      setServicesLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setServicesLoading(true);
    setStorageError("");
    loadProviderServices(user.id, providerProfileId)
      .then((loadedServices) => {
        if (isCurrent) setServices(loadedServices);
      })
      .catch((error: unknown) => {
        console.error("Could not load provider services.", error);
        if (isCurrent) {
          setServices([]);
          setStorageError(
            "Saved services could not be loaded from this browser.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setServicesLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [providerProfileId, user]);

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
          `${service.name} ${service.shortDescription}`
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

  async function persist(
    nextServices: ProviderService[],
    notice: string,
  ): Promise<boolean> {
    if (!user || user.role !== "provider") return false;
    try {
      await saveProviderServices(user.id, providerProfileId, nextServices);
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
      providerId: providerProfileId,
      status,
      averageRating: existing?.averageRating ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const nextServices = existing
      ? services.map((item) => (item.id === existing.id ? service : item))
      : [service, ...services];

    if (
      await persist(
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
    void persist(
      services.map((item) => (item.id === service.id ? updated : item)),
      nextStatus === "inactive"
        ? "Service deactivated and hidden from residents."
        : nextStatus === "draft"
          ? "Approval submission withdrawn. Service saved as a draft."
          : "Service submitted for approval.",
    );
  }

  async function deleteService() {
    if (!serviceToDelete) return;
    const deletedName = serviceToDelete.name;
    if (
      await persist(
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

  if (servicesLoading) {
    return <LoadingSpinner label="Loading your services..." />;
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
                Add a service name, category, short description and image.
                Your provider profile is linked automatically.
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
            {service.imageUrl ? (
              <img src={service.imageUrl} alt={`${service.name} service`} />
            ) : (
              <div className="provider-service-detail__no-image">
                No service images added
              </div>
            )}
          </section>

          <section className="provider-service-detail__panel">
            <h2>Short description</h2>
            <p>{service.shortDescription}</p>
          </section>
        </div>

        <aside className="provider-service-detail__sidebar">
          <section className="provider-service-detail__panel">
            <span className={`provider-service-status is-${service.status}`}>
              {statusLabels[service.status]}
            </span>
            <p>Provider profile is linked to this service.</p>
            <Link to={`/provider/profile/${service.providerId}`}>
              View business profile
            </Link>
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
