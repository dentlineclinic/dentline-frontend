import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Navbar activePage="Contact" />

      <main className="pt-20">
        {/* Hero */}
        <section 
  className="py-20 px-6 md:px-10 relative"
  style={{
    backgroundImage: `url("https://res.cloudinary.com/da00pceww/image/upload/v1776973741/WhatsApp_Image_2026-04-23_at_3.52.30_PM_ts3rim.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
>
  {/* Dark overlay for better text readability */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-[#00685C]/40" />
  
  <div className="relative max-w-[1200px] mx-auto text-center z-10">
    <p className="text-sm font-semibold text-[#8EF5E2] tracking-widest mb-3 uppercase">
      CONTACT US
    </p>
    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
      Get in Touch
    </h1>
    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
      Have questions or need to schedule an appointment? Our team is here to help.
    </p>
   
  </div>
</section>

        {/* Contact Section */}
        <section className="py-16 px-6 md:px-10">
          <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16">
            {/* Info */}
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-bold text-[#0B1C30] mb-4">Contact Information</h2>
                <p className="text-base text-[#485F83]">
                  Reach out to us through any of the channels below. For emergencies, please call
                  our 24/7 emergency line.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: "📍",
                    label: "Address",
                    value: "No 15, Ajayi Aina street, Ifako-Gbagada, Lagos-state. (Beside Deeper Life H.Q)",
                  },
                  {
                    icon: "📞",
                    label: "Phone",
                    value: "09155588050",
                  },
                  {
                    icon: "✉️",
                    label: "Email",
                    value: "info@dentlineclinic.com",
                  },
                  {
                    icon: "🕐",
                    label: "Hours",
                    value: "Mon–Fri: 9am–5pm | Sat: 10am–3pm",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#3D4946]">{item.label}</h4>
                      <p className="text-base text-[#485F83]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 rounded-xl p-6">
                <h4 className="text-base font-bold text-[#BA1A1A] mb-2">🚨 Emergency Care</h4>
                <p className="text-sm text-[#485F83]">
                  For dental emergencies, call our 24/7 emergency line:{" "}
                  <a href="tel:5550123456" className="font-semibold text-[#BA1A1A]">
                    09155588050
                  </a>
                </p>
              </div>
            </div>

            
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
