export const SELECTED_STATE_STORAGE_KEY = "amstani:selectedState";
export const SELECTED_STATE_EVENT = "amstani:selected-state-change";

export function getSelectedState(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SELECTED_STATE_STORAGE_KEY) ?? "";
}

export function setSelectedState(state: string) {
  if (typeof window === "undefined") return;

  const normalized = state.trim();
  if (normalized) {
    window.localStorage.setItem(SELECTED_STATE_STORAGE_KEY, normalized);
  } else {
    window.localStorage.removeItem(SELECTED_STATE_STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(SELECTED_STATE_EVENT, { detail: normalized }));
}

export function subscribeSelectedState(handler: (state: string) => void) {
  if (typeof window === "undefined") return () => {};

  const onCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<string>).detail;
    handler(typeof detail === "string" ? detail : getSelectedState());
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === SELECTED_STATE_STORAGE_KEY) {
      handler(event.newValue ?? "");
    }
  };

  window.addEventListener(SELECTED_STATE_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(SELECTED_STATE_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
  };
}
