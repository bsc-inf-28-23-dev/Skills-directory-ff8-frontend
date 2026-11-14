import { useEffect, useState } from "react";
import "../service-directory.css";
import { categories } from "../data/provider";
import { Navigate, useMatch, useNavigate } from "react-router-dom";
import DirectoryPage from "./DirectoryPage";
import ProviderProfilePage from "./ProviderProfilepage";
import type { ServiceProvider } from "../types/serviceProvider";
import { getProviders, updateProvider } from "../services/providerService";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ServiceDirectoryApp() {
  const [providerData, setProviderData] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const navigate = useNavigate();
  const profileMatch = useMatch("/services/providers/:providerId");
  const profileProvider = providerData.find(
    (provider) => provider.id === profileMatch?.params.providerId,
  );

  useEffect(() => {
    let isCurrent = true;

    getProviders()
      .then((providers) => {
        if (isCurrent) setProviderData(providers);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load providers.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function saveProvider(updatedProvider: ServiceProvider): Promise<boolean> {
    try {
      const savedProvider = await updateProvider(updatedProvider.id, updatedProvider);
      setProviderData((current) =>
        current.map((provider) =>
          provider.id === savedProvider.id ? savedProvider : provider,
        ),
      );
      setSaveError("");
      return true;
    } catch (error) {
      console.error("Could not save provider data.", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save provider changes. Please try again.",
      );
      return false;
    }
  }

  if (loading) return <LoadingSpinner label="Loading providers..." />;
  if (loadError) return <ErrorAlert message={loadError} />;
  if (profileMatch && !profileProvider) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div id="service-directory">
      <div className="app-shell">
        {saveError && (
          <div className="m-3">
            <ErrorAlert message={saveError} />
          </div>
        )}
        {profileProvider ? (
          <ProviderProfilePage
            key={profileProvider.id}
            provider={profileProvider}
            providers={providerData}
            categories={categories}
            onBack={() => navigate("/services")}
            onSave={saveProvider}
            onSelectProvider={(providerId) =>
              navigate(`/services/providers/${providerId}`)
            }
          />
        ) : (
          <DirectoryPage
            providers={providerData}
            categories={categories.filter((category) =>
              providerData.some((provider) => provider.category === category),
            )}
          />
        )}
      </div>
    </div>
  );
}
