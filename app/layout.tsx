import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import Providers from "./providers";
import OfflineBanner from "@/components/ui/OfflineBanner";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dentlineclinic.com"),

  title: {
    default: "Dentline Clinic | Dental Clinic in Ikeja & Gbagada, Lagos",
    template: "%s | Dentline Clinic",
  },

  description:
    "Dentline Clinic is a modern dental clinic in Ikeja & Gbagada, Lagos, providing preventive, cosmetic, restorative, and emergency dental care for patients of all ages.",

  keywords: [
    "dental clinic",
    "dentist",
    "restorative dentistry",
    "Dentline",
    "dental clinic Lagos",
    "dentist Ikeja",
    "dentist Lagos",
    "teeth cleaning",
    "cosmetic dentistry",
    "restorative dentistry",
    "emergency dental care",
    "Dentline Clinic",
    "dentist Gbagada",
  ],

  openGraph: {
    title: "Dentline Clinic | Dental Clinic in Ikeja & Gbagada, Lagos",
    description:
      "Dentline Clinic provides professional dental care in Ikeja and Gbagada, Lagos, including routine checkups, teeth cleaning, cosmetic dentistry, restorative treatments, and emergency dental services.",
    url: "https://www.dentlineclinic.com",
    siteName: "Dentline Clinic",
    locale: "en_US",
    type: "website",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dentline Clinic",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Dentline Clinic | Dental Clinic in Ikeja & Gbagada, Lagos",
    description:
      "Dentline Clinic provides professional dental care in Ikeja and Gbagada, Lagos, including routine checkups, teeth cleaning, cosmetic dentistry, restorative treatments, and emergency dental services.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <OfflineBanner />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}