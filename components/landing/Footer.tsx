import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-[1280px] mx-auto px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white">Dentline Clinic</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Clinical excellence guaranteed through precision restoration and
              patient-first protocols. Leading the standard in modern dental care.
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a
                href="https://web.facebook.com/p/Dentline-Dental-Clinic-61556357006199/?_rdc=1&_rdr#"
                className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center hover:bg-[#0D9488] transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              
              {/* Twitter/X */}
              <a
                href="https://x.com/dentlineng"
                className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center hover:bg-[#0D9488] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              
              {/* Instagram */}
              <a
                href="https://www.instagram.com/dentlineng/"
                className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center hover:bg-[#0D9488] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Sitemap */}
          <div className="flex flex-col gap-6">
            <h3 className="text-base font-semibold text-white">Sitemap</h3>
            <ul className="flex flex-col gap-3">
              {["Services", "Our Specialists", "Patient Portal", "Emergency Care"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-xs text-[#94A3B8] hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-6">
            <h3 className="text-base font-semibold text-white">Legal</h3>
            <ul className="flex flex-col gap-3">
              {["Privacy Policy", "Terms of Service", "ADA Compliance"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-xs text-[#94A3B8] hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="text-base font-semibold text-white">Clinical Updates</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-[#1E293B] text-[#6B7280] text-xs px-4 py-2.5 rounded-l-lg outline-none"
              />
              <button className="bg-[#0D9488] px-4 py-2.5 rounded-r-lg hover:bg-[#008375] transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1E293B]/50 px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1280px] mx-auto">
        <p className="text-xs text-[#64748B]">
          © 2024 Dentline Clinic. Clinical Excellence Guaranteed.
        </p>
        <a href="tel:5550123456" className="text-xs text-[#2DD4BF] underline">
          Emergency Line: 09155588070
        </a>
      </div>
    </footer>
  );
}