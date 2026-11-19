import { useCallback, useState } from "react";
import {
  loadSavedServices,
  saveSavedServices,
  type SavedService,
} from "../services/savedServiceStorage";

export function useSavedServices(userId?: string) {
  const [state, setState] = useState(() => loadState(userId));

  if (state.userId !== userId) {
    setState(loadState(userId));
  }

  const toggleSavedService = useCallback(
    (service: SavedService) => {
      if (!userId) return false;

      const alreadySaved = state.savedServices.some(
        (saved) =>
          saved.providerId === service.providerId &&
          saved.service === service.service,
      );
      const nextSavedServices = alreadySaved
        ? state.savedServices.filter(
            (saved) =>
              saved.providerId !== service.providerId ||
              saved.service !== service.service,
          )
        : [...state.savedServices, service];

      try {
        saveSavedServices(userId, nextSavedServices);
        setState({ userId, savedServices: nextSavedServices, error: "" });
        return true;
      } catch (saveError) {
        console.error("Could not save service changes.", saveError);
        setState({
          ...state,
          error: "Your saved services could not be updated. Please try again.",
        });
        return false;
      }
    },
    [state, userId],
  );

  return {
    savedServices: state.savedServices,
    toggleSavedService,
    error: state.error,
  };
}

function loadState(userId?: string) {
  if (!userId) {
    return { userId, savedServices: [] as SavedService[], error: "" };
  }

  try {
    return {
      userId,
      savedServices: loadSavedServices(userId),
      error: "",
    };
  } catch (loadError) {
    console.error("Could not load saved services.", loadError);
    return {
      userId,
      savedServices: [],
      error: "Saved services could not be loaded. Please try again.",
    };
  }
}
