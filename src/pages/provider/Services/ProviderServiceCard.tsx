import {
  ArrowUpRight,
  Ellipsis,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ProviderService } from "../../../types/providerService";

const statusLabels: Record<ProviderService["status"], string> = {
  draft: "Draft",
  pending: "Pending approval",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
}

export default function ProviderServiceCard({
  service,
  onChangeStatus,
  onDelete,
}: {
  service: ProviderService;
  onChangeStatus: (service: ProviderService) => void;
  onDelete: (service: ProviderService) => void;
}) {
  const statusAction =
    service.status === "active"
      ? "Deactivate"
      : service.status === "pending"
        ? "Withdraw submission"
        : service.status === "rejected"
          ? "Resubmit for approval"
          : "Submit for approval";

  return (
    <article className="provider-service-card">
      <Link
        to={`/provider/services/${service.id}`}
        className="provider-service-card__image"
        aria-label={`View ${service.name}`}
      >
        {service.imageUrl ? (
          <img src={service.imageUrl} alt="" loading="lazy" />
        ) : (
          <span>{service.category}</span>
        )}
        <span className={`provider-service-status is-${service.status}`}>
          {statusLabels[service.status]}
        </span>
      </Link>

      <div className="provider-service-card__body">
        <div className="provider-service-card__heading">
          <div>
            <span className="provider-service-card__category">
              {service.category}
            </span>
            <h2>
              <Link to={`/provider/services/${service.id}`}>{service.name}</Link>
            </h2>
          </div>
          <details className="provider-service-menu">
            <summary aria-label={`Actions for ${service.name}`}>
              <Ellipsis size={19} aria-hidden="true" />
            </summary>
            <div className="provider-service-menu__items">
              <Link to={`/provider/services/${service.id}/edit`}>
                <Pencil size={15} aria-hidden="true" /> Edit service
              </Link>
              <button type="button" onClick={() => onChangeStatus(service)}>
                <span aria-hidden="true">
                  {service.status === "active" ? "◌" : "✓"}
                </span>
                {statusAction}
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => onDelete(service)}
              >
                <Trash2 size={15} aria-hidden="true" /> Delete service
              </button>
            </div>
          </details>
        </div>

        <p className="provider-service-card__description">
          {service.shortDescription || "No short description has been added."}
        </p>

        {service.status === "rejected" && service.rejectionReason && (
          <p className="provider-service-card__rejection" role="note">
            <strong>Review note:</strong> {service.rejectionReason}
          </p>
        )}

        <div className="provider-service-card__metrics">
          <span>
            Updated
            <small>{new Date(service.updatedAt).toLocaleDateString()}</small>
          </span>
          <Link to={`/provider/services/${service.id}`}>
            View details <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
