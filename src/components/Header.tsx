"use client";

import { auth, signInWithGoogle, useUser } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const user = useUser();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.refresh();
    } catch (e) {
      console.error("Sign in error", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.refresh();
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const categories = [
    { name: "Easy", path: "/easy" },
    { name: "Medium", path: "/medium" },
    { name: "Hard", path: "/hard" },
    { name: "Revise", path: "/revise" },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-emerald-700 to-emerald-900 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <h1
          className="text-2xl font-extrabold text-white cursor-pointer"
          onClick={() => router.push("/")}
        >
          Quizify
        </h1>

        {/* Category links */}
        <nav className="flex space-x-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className="text-white font-medium hover:underline"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        {user ? (
          <div
            onClick={handleSignOut}
            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer"
            title="Click to sign out"
          >
            <Image
              src={user.photoURL ?? "/avatar-placeholder.png"}
              alt={user.displayName ?? "User avatar"}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-white text-green-600 font-semibold rounded-full shadow hover:bg-gray-100 transition"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
