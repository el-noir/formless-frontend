"use client";

import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
        <Toaster />
    </>
  );
}
