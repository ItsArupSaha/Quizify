"use client";

export default function Features() {
  const items = [
    {
      icon: "🖥️",
      title: "Interactive Editor",
      desc: "Write and edit code right in your browser.",
    },
    {
      icon: "⚡",
      title: "Live Feedback",
      desc: "Run tests instantly and see results.",
    },
    {
      icon: "📈",
      title: "Track Progress",
      desc: "Save your solves and watch your skills grow.",
    },
  ];

  return (
    <section className="w-full bg-green-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">
                {item.title}
              </h4>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
