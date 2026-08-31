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
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              {/* Left Column - Contact Information */}
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
                      icon: "📞",
                      label: "Emergency Phone",
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
                    <a href="tel:09155588050" className="font-semibold text-[#BA1A1A]">
                      09155588050
                    </a>
                  </p>
                </div>
              </div>

              {/* Right Column - Branches */}
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#0B1C30] mb-4">Our Branches</h2>
                  <p className="text-base text-[#485F83]">
                    Visit us at any of our convenient locations across Lagos.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Gbagada Branch */}
                  <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-base font-bold text-[#003D20] mb-2">
                      🏥 Gbagada Branch
                    </h4>
                    <div className="text-sm text-[#485F83] leading-relaxed mb-3">
                      No 15, Ajayi Aina street,<br />
                      Ifako-Gbagada, Lagos-state.<br />
                      (Beside Deeper Life H.Q)
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        📞 <a href="tel:09155588050" className="text-[#0D9488] hover:text-[#00685C] font-medium transition-colors">
                          09155588050
                        </a>
                      </div>
                      <div>
                        💬 <a 
                          href="https://wa.me/2349155588050?text=Hello%20Dentline%20Clinic%20(Gbagada)%2C%20I%20have%20a%20question%20about%20my%20appointment" 
                          className="text-[#25D366] hover:text-[#1DA851] font-semibold transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ikeja Branch */}
                  <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-base font-bold text-[#003D20] mb-2">
                      🏥 Ikeja Branch
                    </h4>
                    <div className="text-sm text-[#485F83] leading-relaxed mb-3">
                      43 Olorunfunmi street<br />
                      off Kudirat abiola way,<br />
                      Ikeja, Lagos
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        📞 <a href="tel:09155588070" className="text-[#0D9488] hover:text-[#00685C] font-medium transition-colors">
                          09155588070
                        </a>
                      </div>
                      <div>
                        💬 <a 
                          href="https://wa.me/2349155588070?text=Hello%20Dentline%20Clinic%20(Ikeja)%2C%20I%20have%20a%20question%20about%20my%20appointment" 
                          className="text-[#25D366] hover:text-[#1DA851] font-semibold transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map or Additional Info */}
                <div className="bg-[#00685C]/5 border border-[#00685C]/20 rounded-xl p-6">
                  <h4 className="text-base font-bold text-[#00685C] mb-2">📅 Book an Appointment</h4>
                  <p className="text-sm text-[#485F83]">
                    Call either branch to schedule your visit or use the WhatsApp links above to chat with our team directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}