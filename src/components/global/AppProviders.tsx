"use client";

import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { ConfirmProvider } from "./ConfirmProvider";
import { CustomerTutorialProvider } from "../customer/tutorial/CustomerTutorialProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <CustomerTutorialProvider>{children}</CustomerTutorialProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}