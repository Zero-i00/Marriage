"use client";

import type { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/app/providers/query";

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-center" />
    </QueryProvider>
  );
}
