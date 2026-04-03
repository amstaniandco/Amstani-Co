"use client";

import { useEffect, useState } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export default function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await fetch(url);
        const json = await response.json();

        if (!cancelled) setState({ data: json, loading: false, error: null });
      } catch (error) {
        if (!cancelled) setState({ data: null, loading: false, error: (error as Error).message });
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
