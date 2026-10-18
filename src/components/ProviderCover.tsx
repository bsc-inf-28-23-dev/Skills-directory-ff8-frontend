import { getProviderCoverUrl } from "../utils/providerImages";
import { initials } from "../utils/format";
import type { ProviderSummary } from "../types";

interface Props {
  provider: Pick<ProviderSummary, "name" | "category" | "profileImageUrl">;
}

export default function ProviderCover({ provider }: Props) {
  const url = getProviderCoverUrl(provider);

  if (url) {
    return <img src={url} alt="" className="provider-cover" />;
  }

  return (
    <div className="provider-cover-initials" aria-hidden="true">
      {initials(provider.name)}
    </div>
  );
}