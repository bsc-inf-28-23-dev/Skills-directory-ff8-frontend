import { useEffect, useState } from "react";
import "../service-directory.css";
import { categories } from "../data/provider";
import { Navigate, useLocation, useMatch, useNavigate } from "react-router-dom";
import DirectoryPage from "./DirectoryPage";
import ProviderProfilePage from "./ProviderProfilepage";
import ProviderProfileManagementPage from "./provider/ProviderProfileManagementPage";
import SavedServicesPage from "./SavedServicesPage";
import ServiceDetailsPage from "./ServiceDetailsPage";
import type { ServiceProvider } from "../types/serviceProvider";
import { getProviders, providerService, updateProvider } from "../services/providerService";
import { useAuth } from "../hooks/useAuth";
import { createProviderProfile, getProviderProfileRouteId } from "../data/providerAccount";
import type { User } from "../types";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ServiceDirectoryApp() {
  const [providerData, setProviderData] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const profileMatch = useMatch("/services/providers/:providerId");
  const editorMatch = useMatch("/provider/profile/:providerId");
  const savedServicesMatch = useMatch("/resident/saved");
  const editorProviderId = editorMatch?.params.providerId;
  const profileProvider = providerData.find(
    (provider) =>
      provider.id ===
      (profileMatch?.params.providerId ?? editorProviderId),
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadProviders() {
      setLoading(true);
      setLoadError("");
      try {
        let providers = await getProviders();

        if (editorProviderId && user?.role === "provider") {
          const profile = await providerService.getMyProfile();
          const existing =
            providers.find((provider) => provider.id === profile.id) ??
            providers.find((provider) => provider.id === editorProviderId);
          const base =
            existing ??
            createProviderProfile(user, categories, profile.id || editorProviderId);
          const ownProvider: ServiceProvider = {
            ...base,
            id: profile.id || base.id,
            name: profile.businessName || base.name,
            person: profile.contactPerson || base.person,
            category: profile.category || base.category,
            area: profile.serviceArea || base.area,
            quote: profile.about || base.quote,
            rating: profile.rating ?? base.rating,
            reviews: profile.reviewCount ?? base.reviews,
            photo: profile.photoUrl ?? base.photo,
            profile: base.profile
              ? {
                  ...base.profile,
                  skills: profile.skills ?? base.profile.skills,
                }
              : undefined,
          };
          providers = existing
            ? providers.map((provider) =>
                provider.id === existing.id ? ownProvider : provider,
              )
            : [...providers, ownProvider];
        }

        if (isCurrent) setProviderData(providers);
      } catch (error: unknown) {
        if (isCurrent) {
          setLoadError("We could not load providers. Please try again.");
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    void loadProviders();

    return () => {
      isCurrent = false;
    };
  }, [editorProviderId, user]);

  async function savePublicProvider(
    updatedProvider: ServiceProvider,
  ): Promise<boolean> {
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
        "Could not save provider changes. Please try again.",
      );
      return false;
    }
  }

  async function saveBusinessProfile(
    updatedProvider: ServiceProvider,
    updatedUser: User,
  ): Promise<boolean> {
    try {
      const savedProvider = await updateProvider(
        updatedProvider.id,
        updatedProvider,
      );
      const savedUser = await providerService.updateMyAccount({
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
      });
      await providerService.updateMySkills(
        updatedProvider.profile?.skills ?? [],
      );

      const providerToStore: ServiceProvider = {
        ...updatedProvider,
        ...savedProvider,
        profile: savedProvider.profile ?? updatedProvider.profile,
      };
      setProviderData((current) =>
        current.some((provider) => provider.id === providerToStore.id)
          ? current.map((provider) =>
              provider.id === providerToStore.id ? providerToStore : provider,
            )
          : [...current, providerToStore],
      );

      setUser(
        {
          ...updatedUser,
          ...savedUser,
          providerProfileId: providerToStore.id,
        },
        localStorage.getItem("accessToken") ?? undefined,
      );
      setSaveError("");
      return true;
    } catch (error: unknown) {
      console.error("Could not save provider profile.", error);
      setSaveError(
        "Could not save provider changes. Please try again.",
      );
      return false;
    }
  }

  if (loading) return <LoadingSpinner label="Loading providers..." />;
  if (loadError) return <ErrorAlert message={loadError} />;
  if (profileMatch && !profileProvider) {
    return <Navigate to="/#services" replace />;
  }
  if (editorMatch && !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  if (editorMatch && user?.role !== "provider") {
    return <Navigate to="/resident/dashboard" replace />;
  }
  if (
    editorMatch &&
    user &&
    getProviderProfileRouteId(user) !== editorProviderId
  ) {
    return <Navigate to="/provider/dashboard" replace />;
  }

  return (
    <div id="service-directory">
      <div className="app-shell">
        {saveError && (
          <div className="m-3">
            <ErrorAlert message={saveError} />
          </div>
        )}
        {savedServicesMatch ? (
          <SavedServicesPage
            providers={providerData.map(toResidentVisibleProvider)}
          />
        ) : profileMatch && profileProvider ? (
          <ServiceDetailsPage
            provider={toResidentVisibleProvider(profileProvider)}
            onBack={() => navigate("/#services")}
          />
        ) : editorMatch && profileProvider && user ? (
          <ProviderProfileManagementPage
            key={profileProvider.id}
            provider={profileProvider}
            user={user}
            categories={categories}
            onBack={() => navigate("/provider/dashboard")}
            onSave={saveBusinessProfile}
          />
        ) : profileProvider ? (
          <ProviderProfilePage
            key={profileProvider.id}
            provider={profileProvider}
            providers={providerData}
            categories={categories}
            onBack={() => navigate("/#services")}
            onSave={savePublicProvider}
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

function toResidentVisibleProvider(provider: ServiceProvider): ServiceProvider {
  if (!provider.profile) return provider;

  const profile = provider.profile;
  return {
    ...provider,
    profile: {
      ...profile,
      registrationDetails: "",
      businessAddress: profile.physicalPremises ? profile.businessAddress : "",
      publicPhone: profile.showPublicPhone ? profile.publicPhone : undefined,
      publicEmail: profile.showPublicEmail ? profile.publicEmail : undefined,
      verificationDocuments: profile.verificationDocuments
        .filter((document) => document.status === "verified")
        .map((document) => ({
          ...document,
          dataUrl: "",
          feedback: undefined,
        })),
    },
  };
}
