// src/app/page.tsx
"use client";

import { auth, signInWithGoogle, useUser } from "@/lib/firebase";

export default function Home() {
  const user = useUser();

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center">
        <button
          onClick={signInWithGoogle}
          className="rounded bg-blue-600 px-6 py-2 font-semibold text-white shadow"
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Hello, {user.displayName}</h1>
      <button
        onClick={() => auth.signOut()}
        className="text-sm underline underline-offset-2"
      >
        Sign out
      </button>
      <a href="/q/easy-100" className="underline">
        Try easy‑100
      </a>
    </main>
  );
}
