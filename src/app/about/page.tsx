"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
                About{" "}
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  PyCrafters
                </span>
              </h1>
              <p className="text-lg text-neutral-600">
                Empowering developers to master Python through interactive
                challenges
              </p>
            </div>

            {/* Mission Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                Our Mission
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-6">
                At PyCrafters, we believe that the best way to learn programming
                is through hands-on practice. Our platform provides a structured
                learning path with real-world coding challenges that help
                developers build practical skills and confidence in Python
                programming.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                We're committed to making programming education accessible,
                engaging, and effective for everyone, from beginners to
                experienced developers looking to sharpen their skills.
              </p>
            </section>

            {/* Features Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                What Makes Us Different
              </h2>
              <div className="grid gap-6">
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Interactive Learning
                  </h3>
                  <p className="text-neutral-600">
                    Write and run code directly in your browser with instant
                    feedback and real-time validation.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Progressive Difficulty
                  </h3>
                  <p className="text-neutral-600">
                    Start with basic concepts and gradually advance to more
                    complex challenges as you grow.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Community Driven
                  </h3>
                  <p className="text-neutral-600">
                    Join a community of learners, share solutions, and learn
                    from others' approaches.
                  </p>
                </div>
              </div>
            </section>

            {/* Team Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                Our Team
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                We're a team of passionate developers and educators dedicated to
                creating the best learning experience for Python developers. Our
                goal is to help you become a better programmer through
                practical, hands-on learning.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
