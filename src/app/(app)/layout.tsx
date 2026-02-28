"use client";

import { Navbar } from "@/components/Navbar";
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
    </>
  );
}
