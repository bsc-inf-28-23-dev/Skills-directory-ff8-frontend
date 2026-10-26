import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError } from "../types";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
}

/** Runs an async loader on mount and whenever its dependencies change. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);
  const requestId = useRef(0);
  const [completedRequest, setCompletedRequest] = useState<{
    deps: unknown[];
    tick: number;
  } | null>(null);
  const loading =
    completedRequest === null ||
    completedRequest.tick !== tick ||
    completedRequest.deps.length !== deps.length ||
    completedRequest.deps.some(
      (dependency, index) => !Object.is(dependency, deps[index]),
    );

  useEffect(() => {
    const id = ++requestId.current;
    const requestDeps = [...deps];
    Promise.resolve()
      .then(loader)
      .then((result) => {
        if (id === requestId.current) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (id === requestId.current) {
          const apiError =
            err && typeof err === "object" && "message" in err && "status" in err
              ? (err as ApiError)
              : {
                  status: null,
                  message:
                    err instanceof Error ? err.message : "Something went wrong.",
                };
          setError(apiError);
        }
      })
      .finally(() => {
        if (id === requestId.current) {
          setCompletedRequest({ deps: requestDeps, tick });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}