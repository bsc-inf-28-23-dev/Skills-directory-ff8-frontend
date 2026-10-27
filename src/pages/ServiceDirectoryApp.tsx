import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "../service-directory.css";
import { categories, providers } from "../data/provider";
import { loadProviders, saveProviders } from "../data/providerStorage";
import { Navigate, useMatch, useNavigate } from "react-router-dom";
import DirectoryPage from "./DirectoryPage";
import ProviderProfilePage from "./ProviderProfilepage";
import type { ServiceProvider } from "../types/serviceProvider";

export default function ServiceDirectoryApp() {
  const [providerData, setProviderData] = useState<ServiceProvider[]>(providers);
  const [storageError, setStorageError] = useState("");
  const navigate = useNavigate();
  const profileMatch = useMatch("/services/providers/:providerId");
  const profileProvider = providerData.find(
    (provider) => provider.id === profileMatch?.params.providerId,
  );

  useEffect(() => {
    let isCurrent = true;

    loadProviders()
      .then((storedProviders) => {
        if (!isCurrent || !storedProviders) return;

        setProviderData(storedProviders);
      })
      .catch((error: unknown) => {
        console.error("Could not load saved provider data.", error);
        if (isCurrent) {
          setStorageError(
            "Saved profile data could not be loaded. The sample profiles are shown instead.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function saveProvider(updatedProvider: ServiceProvider): Promise<boolean> {
    const updatedProviders = providerData.map((provider) =>
      provider.id === updatedProvider.id ? updatedProvider : provider,
    );

    try {
      await saveProviders(updatedProviders);
      setProviderData(updatedProviders);
      setStorageError("");
      return true;
    } catch (error) {
      console.error("Could not save provider data.", error);
      setStorageError(
        "Profile changes could not be saved in this browser. Please try again.",
      );
      return false;
    }
  }

  if (profileMatch && !profileProvider) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div id="service-directory">
      <div className="app-shell">
        {storageError && (
          <div className="alert alert-warning m-3" role="alert">
            {storageError}
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
