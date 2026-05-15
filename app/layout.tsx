import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./providers";
import { ToastContainer } from "react-toastify";
import OfflineBanner from "@/components/ui/OfflineBanner";

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

  icons: {
    icon: "icon.png",
    
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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </body>
    </html>
  );
}