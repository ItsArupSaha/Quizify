"use client";

export default function Features() {
  const items = [
    {
      icon: "💻",
      title: "Interactive Editor",
      desc: "Write and edit code right in your browser with syntax highlighting and real-time feedback.",
    },
    {
      icon: "⚡",
      title: "Live Feedback",
      desc: "Run tests instantly and see results immediately. No waiting, no setup required.",
    },
    {
      icon: "📈",
      title: "Track Progress",
      desc: "Save your solves and watch your skills grow with detailed progress tracking.",
    },
  ];

  return (
    <section
      id="features"
      className="w-full py-20 bg-white relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-50/50 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="container-custom relative">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Master Python
            </span>
          </h2>
          <p className="text-lg text-neutral-600">
            Our platform provides all the tools and features you need to learn
            Python effectively.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={item.title} className="group relative">
              <div className="card hover:border-primary-200 border-2 border-transparent transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary-500 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary-500 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
