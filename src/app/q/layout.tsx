// app/q/layout.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto m-6">{children}</main>
      <Footer />
    </>
  );
}
