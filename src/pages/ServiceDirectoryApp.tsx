import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "../service-directory.css";
import { categories, providers } from "../data/provider";
import { loadProviders, saveProviders } from "../data/providerStorage";
import DirectoryPage from "./DirectoryPage";
import ProviderProfilePage from "./ProviderProfilepage";
import type { ServiceProvider } from "../types/serviceProvider";

export default function ServiceDirectoryApp() {
  const [providerData, setProviderData] = useState<ServiceProvider[]>(providers);
  const [selectedProviderId, setSelectedProviderId] = useState(
    providers[0]?.id ?? "",
  );
  const [storageError, setStorageError] = useState("");
  const [currentPage, setCurrentPage] = useState<"directory" | "profile">(
    "directory",
  );
  const profileProvider = providerData.find(
    (provider) => provider.id === selectedProviderId,
  );

  useEffect(() => {
    let isCurrent = true;

    loadProviders()
      .then((storedProviders) => {
        if (!isCurrent || !storedProviders) return;

        setProviderData(storedProviders);
        setSelectedProviderId((currentId) =>
          storedProviders.some((provider) => provider.id === currentId)
            ? currentId
            : storedProviders[0]?.id ?? "",
        );
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

  return (
    <div id="service-directory">
      <div className="app-shell">
        {storageError && (
          <div className="alert alert-warning m-3" role="alert">
            {storageError}
          </div>
        )}
        {currentPage === "profile" && profileProvider ? (
          <ProviderProfilePage
            key={profileProvider.id}
            provider={profileProvider}
            providers={providerData}
            categories={categories}
            onBack={() => setCurrentPage("directory")}
            onSave={saveProvider}
            onSelectProvider={setSelectedProviderId}
          />
        ) : (
          <DirectoryPage
            providers={providerData}
            categories={categories.filter((category) =>
              providerData.some((provider) => provider.category === category),
            )}
            onOpenProfile={() => {
              setSelectedProviderId(providerData[0]?.id ?? "");
              setCurrentPage("profile");
            }}
          />
        )}
      </div>
    </div>
  );
}
