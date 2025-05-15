"use client";

import { auth, signInWithGoogle, useUser } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import UserStats from "./UserStats";

export default function Header() {
  const user = useUser();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setIsProfileOpen(false);
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
              className="relative font-medium text-white/90 hover:text-white py-2 group transition-all duration-300"
            >
              {cat.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-in-out"></span>
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
          <div className="flex items-center gap-4" ref={profileRef}>
            <span className="hidden md:block text-sm font-medium text-white/90">
              {user.displayName}
            </span>
            <div className="relative">
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Click to open profile menu"
              >
                <Image
                  src={user.photoURL ?? "/avatar-placeholder.png"}
                  alt={user.displayName ?? "User avatar"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <UserStats />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
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
