import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export const metadata: Metadata = { title: "Services" };

const services = [
  {
    title: "Full Arch Restoration",
    desc: "Using state-of-the-art 3D imaging to rebuild confidence through permanent, natural-looking tooth replacement.",
    icon: "🦷",
    features: ["3D Imaging", "Permanent Solution", "Natural Look"],
  },
  {
    title: "Cosmetic Whitening",
    desc: "Advanced laser technology for safe, lasting brightness that transforms your smile.",
    icon: "✨",
    features: ["Laser Technology", "Safe & Effective", "Long-lasting"],
  },
  {
    title: "Periodontal Care",
    desc: "Specialized treatments for gum health and stability, preventing long-term complications.",
    icon: "🩺",
    features: ["Gum Health", "Preventive Care", "Long-term Stability"],
  },
  {
    title: "Pediatric Dentistry",
    desc: "Creating a calm, fearless environment for our youngest patients through empathetic clinical practices.",
    icon: "👶",
    features: ["Child-friendly", "Fear-Free Environment", "Preventive Care"],
  },
  {
    title: "Orthodontics",
    desc: "Comprehensive orthodontic solutions including Invisalign and traditional braces for all ages.",
    icon: "😁",
    features: ["Invisalign", "Traditional Braces", "All Ages"],
  },
  {
    title: "Emergency Care",
    desc: "24/7 emergency dental services for urgent situations requiring immediate clinical attention.",
    icon: "🚨",
    features: ["24/7 Available", "Immediate Response", "Urgent Care"],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Navbar activePage="Services" />

      <main className="pt-20">
        {/* Hero Section with Image Background */}
        <section 
          className="py-20 px-6 md:px-10 relative"
          style={{
            backgroundImage: `url("https://res.cloudinary.com/da00pceww/image/upload/v1776973741/WhatsApp_Image_2026-04-23_at_3.52.30_PM_ts3rim.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-[#00685C]/40" />
          
          <div className="relative max-w-[1200px] mx-auto text-center z-10">
            <p className="text-sm font-semibold text-[#8EF5E2] tracking-widest mb-3 uppercase">
              OUR SPECIALIZATIONS
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Comprehensive Clinical Care
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              From routine check-ups to complex restorative procedures, we offer a full spectrum
              of dental services delivered with precision and care.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-block bg-[#00685C] text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-[#008375] transition-colors shadow-lg"
              >
                Book Your Consultation
              </Link>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-6 md:px-10">
          <div className="max-w-[1200px] mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-[#00685C] tracking-widest mb-3 uppercase">
                WHAT WE OFFER
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1C30] mb-4">
                Expert Dental Services
              </h2>
              <p className="text-base text-[#485F83] max-w-2xl mx-auto">
                Discover our comprehensive range of dental treatments designed to meet all your oral health needs
              </p>
            </div>

            {/* Services Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="group bg-white border border-[#F1F5F9] rounded-xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1C30] group-hover:text-[#00685C] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-base text-[#485F83] leading-relaxed">{service.desc}</p>
                  
                  {/* Features List */}
                  <div className="pt-4 mt-2 border-t border-[#F1F5F9]">
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 bg-[#F0FDFA] text-[#00685C] rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  
                </div>
              ))}
            </div>
          </div>
        </section>

       

        {/* CTA Section */}
        <section className="py-20 px-6 md:px-10 bg-gradient-to-r from-[#435B7E] to-[#2C4A6E]">
          <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Smile?
            </h2>
            <p className="text-base text-white/80 mb-8 max-w-xl mx-auto">
              Book your consultation today and experience the Dentline difference. Our expert team is ready to help you achieve the smile you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-block bg-[#00685C] text-white font-semibold text-sm px-8 py-4 rounded-lg hover:bg-[#008375] transition-colors shadow-lg"
              >
                Book Appointment
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-white/10 backdrop-blur-sm text-white font-semibold text-sm px-8 py-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}