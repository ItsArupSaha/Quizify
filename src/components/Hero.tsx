"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="w-full pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 -z-10"></div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left column: text + buttons */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 leading-tight">
                Learn Python by Solving{" "}
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Real-World Challenges
                </span>
              </h2>
              <p className="text-lg md:text-xl text-neutral-700 max-w-xl">
                Write code, run tests in your browser, and track your progress
                all in one place. Perfect for beginners and intermediate
                learners.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/easy")}
                className="btn btn-primary text-base px-6 py-3"
              >
                Get Started
              </button>
              <Link
                href="/easy"
                className="btn btn-outline text-base px-6 py-3"
              >
                Browse Challenges
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-primary-600">100+</p>
                <p className="text-sm text-neutral-600">Coding Challenges</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">3</p>
                <p className="text-sm text-neutral-600">Difficulty Levels</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">24/7</p>
                <p className="text-sm text-neutral-600">Available</p>
              </div>
            </div>
          </div>

          {/* Right column: illustration */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Main illustration container */}
              <div className="absolute inset-0 bg-white rounded-2xl shadow-soft p-6 flex items-center justify-center border border-neutral-100">
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center">
                  <span className="text-8xl animate-bounce">🐍</span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-xl rotate-12"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary-100 rounded-xl -rotate-12"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
