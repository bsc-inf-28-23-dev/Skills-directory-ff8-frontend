import { useEffect, useRef, useState } from "react";
import "../service-directory.css";
import { categories, providers } from "../data/provider";
import { loadProviders, saveProviders } from "../data/providerStorage";
import {
  Navigate,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";
import DirectoryPage from "./DirectoryPage";
import ProviderProfilePage from "./provider/ProviderProfileManagementPage";
import SavedServicesPage from "./SavedServicesPage";
import ServiceDetailsPage from "./ServiceDetailsPage";
import { useAuth } from "../hooks/useAuth";
import type { ServiceProvider } from "../types/serviceProvider";
import {
  providerService,
  type ProviderProfileData,
} from "../services/providerService";
import type { User } from "../types";
import {
  createProviderProfile,
  getProviderProfileRouteId,
} from "../data/providerAccount";

export default function ServiceDirectoryApp() {
  const [providerData, setProviderData] = useState<ServiceProvider[]>(providers);
  const [storageError, setStorageError] = useState("");
  const [providerDataLoading, setProviderDataLoading] = useState(true);
  const providerDataRef = useRef(providerData);
  const loadRequestRef = useRef<Promise<ServiceProvider[] | null> | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const serviceMatch = useMatch("/services/providers/:providerId");
  const editorMatch = useMatch("/provider/profile/:providerId");
  const savedServicesMatch = useMatch("/resident/saved");
  const providerId =
    serviceMatch?.params.providerId ?? editorMatch?.params.providerId;
  const storedProvider = providerData.find(
    (provider) => provider.id === providerId,
  );
  const canManageProviderProfile =
    editorMatch !== null &&
    user?.role === "provider" &&
    getProviderProfileRouteId(user) === editorMatch.params.providerId;
  const profileProvider =
    storedProvider ??
    (canManageProviderProfile && user
      ? createProviderProfile(user, categories, editorMatch.params.providerId)
      : undefined);

  useEffect(() => {
    let isCurrent = true;

    const loadRequest = loadProviders();
    loadRequestRef.current = loadRequest;

    loadRequest
      .then((storedProviders) => {
        if (!isCurrent || !storedProviders) return;

        providerDataRef.current = storedProviders;
        setProviderData(storedProviders);
      })
      .catch((error: unknown) => {
        console.error("Could not load saved provider data.", error);
        if (isCurrent) {
          setStorageError(
            "Saved profile data could not be loaded. The sample profiles are shown instead.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setProviderDataLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function saveProvider(
    updatedProvider: ServiceProvider,
    updatedUser: User,
  ): Promise<boolean> {
    let savedProfile: ProviderProfileData;
    let savedUser: User;
    try {
      [savedProfile, savedUser] = await Promise.all([
        providerService.updateMyProfile({
          businessName: updatedProvider.name,
          contactPerson: updatedUser.fullName,
          category: updatedProvider.category,
          serviceArea: updatedProvider.area,
          about: updatedProvider.quote,
        }),
        providerService.updateMyAccount({
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
        }),
      ]);
      await providerService.updateMySkills(updatedProvider.profile?.skills ?? []);
    } catch (error) {
      console.error("Could not save provider profile to the backend.", error);
      setStorageError(
        "Your profile could not be saved to your account. Check your connection and try again.",
      );
      return false;
    }

    const providerToSave: ServiceProvider = {
      ...updatedProvider,
      name: savedProfile.businessName,
      person: savedProfile.contactPerson,
      category: savedProfile.category,
      area: savedProfile.serviceArea,
      quote: savedProfile.about,
      rating: savedProfile.rating ?? updatedProvider.rating,
      reviews: savedProfile.reviewCount ?? updatedProvider.reviews,
      photo: savedProfile.photoUrl ?? updatedProvider.photo,
      profile: updatedProvider.profile
        ? { ...updatedProvider.profile, skills: savedProfile.skills }
        : undefined,
    };

    setUser({
      ...updatedUser,
      ...savedUser,
      providerProfileId: savedProfile.id || updatedProvider.id,
    });

    const saveRequest = saveQueueRef.current.then(async () => {
      await loadRequestRef.current;

      const hasProvider = providerDataRef.current.some(
        (provider) => provider.id === providerToSave.id,
      );
      const updatedProviders = hasProvider
        ? providerDataRef.current.map((provider) =>
            provider.id === providerToSave.id ? providerToSave : provider,
          )
        : [...providerDataRef.current, providerToSave];

      await saveProviders(updatedProviders);
      providerDataRef.current = updatedProviders;
      setProviderData(updatedProviders);
    });

    saveQueueRef.current = saveRequest.catch(() => undefined);

    try {
      await saveRequest;
      setStorageError("");
    } catch (error) {
      console.error("Backend profile was saved, but the public profile cache was not updated.", error);
      setStorageError(
        "Your account profile was saved, but the local public profile could not be refreshed.",
      );
    }
    return true;
  }

  if (serviceMatch && !profileProvider) {
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

  if (editorMatch && user && user.role !== "provider") {
    return <Navigate to="/resident/dashboard" replace />;
  }

  if (
    editorMatch &&
    user?.role === "provider" &&
    getProviderProfileRouteId(user) !== editorMatch.params.providerId
  ) {
    return <Navigate to="/provider/dashboard" replace />;
  }

  if (editorMatch && providerDataLoading) {
    return (
      <main className="provider-profile-loading" role="status">
        Loading your business profile…
      </main>
    );
  }

  return (
    <div id="service-directory">
      <div className="app-shell">
        {storageError && (
          <div className="alert alert-warning m-3" role="alert">
            {storageError}
          </div>
        )}
        {savedServicesMatch ? (
          <SavedServicesPage providers={providerData.map(toResidentVisibleProvider)} />
        ) : serviceMatch && profileProvider ? (
          <ServiceDetailsPage
            provider={toResidentVisibleProvider(profileProvider)}
            onBack={() => navigate("/#services")}
          />
        ) : editorMatch && profileProvider ? (
          <ProviderProfilePage
            key={profileProvider.id}
            provider={profileProvider}
            user={user!}
            categories={categories}
            onBack={() => navigate("/provider/dashboard")}
            onSave={saveProvider}
          />
        ) : (
          <DirectoryPage
            providers={providerData.map(toResidentVisibleProvider)}
            categories={categories}
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
