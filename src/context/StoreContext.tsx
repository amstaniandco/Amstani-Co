"use client";

import React, { createContext, useContext } from "react";

export type StoreInfo = {
  _id?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isLive?: boolean;
  liveLink?: string | null;
  live?: boolean;
  rating?: number | string;
  followers?: number;
  productsCount?: number;
  settings?: {
    languages?: string[];
    musicUrl?: string;
  };
};

const StoreContext = createContext<StoreInfo | null>(null);

export const StoreProvider = ({ store, children }: { store: StoreInfo | null; children: React.ReactNode }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  return useContext(StoreContext);
};

export default StoreContext;
