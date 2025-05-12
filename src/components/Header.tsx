"use client";

import { auth, signInWithGoogle, useUser } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const user = useUser();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-secondary-900 shadow-lg"
          : "py-5 bg-secondary-700/95 backdrop-blur-sm"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <span className="text-3xl">🐍</span>
          <h1 className="text-2xl font-display font-bold text-white">
            Quizify
          </h1>
        </div>

        {/* Category links */}
        <nav className="hidden md:flex space-x-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className="relative font-medium text-white/90 hover:text-white py-2 group transition-colors"
            >
              {cat.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        {/* Mobile menu button (hidden for now) */}
        <button className="md:hidden text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-medium text-white/90">
              {user.displayName}
            </span>
            <div
              onClick={handleSignOut}
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-white text-secondary-800 font-semibold rounded-lg shadow-sm hover:bg-white/90 transition"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
