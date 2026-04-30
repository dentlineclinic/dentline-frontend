import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dentline Clinic",
    template: "%s | Dentline Clinic",
  },
  description:
    "Excellence in Restorative Dentistry. Precision care for your everlasting smile.",
  keywords: ["dental clinic", "dentist", "restorative dentistry", "Dentline"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <Providers>{children}</Providers></body>
    </html>
  );
}
