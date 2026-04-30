import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-[#00685C] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-[#0B1C30] mb-4">Page Not Found</h2>
        <p className="text-base text-[#485F83] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-[#00685C] text-white font-semibold text-sm px-8 py-4 rounded-lg hover:bg-[#008375] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
