"use client";

import { useTransition } from "react";

export default function LoadingIndicator() {
  const [isPending] = useTransition();

  if (!isPending) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-primary-600 animate-pulse z-50"></div>
  );
}
