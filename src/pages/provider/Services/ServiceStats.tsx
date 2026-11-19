import {
  Archive,
  BriefcaseBusiness,
  CircleCheck,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import type { ProviderService } from "../../../types/providerService";

interface StatCard {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: string;
}

export default function ServiceStats({
  services,
}: {
  services: ProviderService[];
}) {
  const stats: StatCard[] = [
    {
      label: "Total services",
      value: services.length,
      description: "All your listings",
      icon: BriefcaseBusiness,
      tone: "total",
    },
    {
      label: "Active",
      value: services.filter((service) => service.status === "active").length,
      description: "Visible to residents",
      icon: CircleCheck,
      tone: "active",
    },
    {
      label: "Pending approval",
      value: services.filter((service) => service.status === "pending").length,
      description: "Awaiting review",
      icon: Clock3,
      tone: "pending",
    },
    {
      label: "Inactive",
      value: services.filter((service) => service.status === "inactive").length,
      description: "Temporarily hidden",
      icon: Archive,
      tone: "inactive",
    },
  ];

  return (
    <section className="provider-services__stats" aria-label="Service statistics">
      {stats.map(({ label, value, description, icon: Icon, tone }) => (
        <article className="provider-services__stat" key={label}>
          <span
            className={`provider-services__stat-icon is-${tone}`}
            aria-hidden="true"
          >
            <Icon size={19} />
          </span>
          <div className="provider-services__stat-copy">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{description}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
