"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column: text + buttons */}
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Learn Python by Solving Real-World Challenges
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Write code, run tests in your browser, and track your progress all
            in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/easy")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
            >
              Get Started
            </button>
            <Link
              href="/easy"
              className="px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-md hover:bg-green-50 transition"
            >
              Browse Challenges
            </Link>
          </div>
        </div>

        {/* Right column: illustration */}
        <div className="flex justify-center md:justify-end">
          {/* Animated placeholder illustration */}
          <div className="w-64 h-64 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-6xl animate-bounce">🐍</span>
          </div>
        </div>
      </div>
    </section>
  );
}
