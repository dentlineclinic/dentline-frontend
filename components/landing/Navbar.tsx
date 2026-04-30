"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ activePage = "Home" }: { activePage?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 border-b border-[#F1F5F9] shadow-sm"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-[1280px] mx-auto px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-[#0D9488] font-bold text-2xl tracking-tight">
          Dentline Clinic
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-semibold tracking-tight transition-colors ${
                activePage === link.label
                  ? "text-[#0D9488] border-b-2 border-[#0D9488] pb-1"
                  : "text-[#475569] hover:text-[#0D9488]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#475569] hover:text-[#0D9488] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-[#00685C] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
          >
            Book Appointment
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-[#475569]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#F1F5F9] px-10 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#475569] hover:text-[#0D9488]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="bg-[#00685C] text-white text-sm font-semibold px-6 py-2.5 rounded-lg text-center"
            onClick={() => setMenuOpen(false)}
          >
            Book Appointment
          </Link>
        </div>
      )}
    </header>
  );
}
