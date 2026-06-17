import { useCallback, useEffect, useState } from "react";
import { extractError } from "../utils/apiError.js";
import { useToast } from "../context/ToastContext.jsx";

/**
 * Run an async loader, tracking data/loading state and surfacing errors as
 * toasts. Returns { data, loading, reload }.
 */
export function useAsync(loader, deps = []) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return loader()
      .then(setData)
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
}
