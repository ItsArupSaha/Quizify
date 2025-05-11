import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-gray-300 py-6">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Links */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link
            href="https://github.com/your-username/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-sm">
          © {new Date().getFullYear()} Quizify. Built by{" "}
          <span className="font-semibold font-stretch-50%">Arup Saha</span>
        </div>
      </div>
    </footer>
  );
}
