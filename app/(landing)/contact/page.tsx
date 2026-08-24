import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  // Branch data
  const branches = [
    {
      id: "gbagada",
      name: "Gbagada Branch",
      icon: "🏥",
      address: "No 15, Ajayi Aina street, Ifako-Gbagada, Lagos-state. (Beside Deeper Life H.Q)",
      phone: "09155588050",
      phoneFormatted: "+234 915 558 8050",
      whatsapp: "2349155588050",
      email: "info@dentlineclinic.com",
      hours: "Mon–Fri: 9am–5pm | Sat: 10am–3pm",
      mapLink: "https://maps.google.com/maps?q=15+Ajayi+Aina+street+Ifako-Gbagada+Lagos",
    },
    {
      id: "ikeja",
      name: "Ikeja Branch",
      icon: "🏥",
      address: "43 Olorunfunmi street off Kudirat abiola way, Ikeja, Lagos",
      phone: "09155588070",
      phoneFormatted: "+234 915 558 8070",
      whatsapp: "2349155588070",
      email: "info@dentlineclinic.com",
      hours: "Mon–Fri: 9am–5pm | Sat: 10am–3pm",
      mapLink: "https://maps.google.com/maps?q=43+Olorunfunmi+street+off+Kudirat+abiola+way+Ikeja+Lagos",
    },
  ];

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
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0B1C30] mb-4">Our Branches</h2>
              <p className="text-base text-[#485F83] max-w-2xl mx-auto">
                Visit us at any of our locations. We're conveniently located to serve you better.
              </p>
            </div>

            {/* Branches Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {branches.map((branch) => (
                <div 
                  key={branch.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0] hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Branch Header */}
                  <div className="bg-gradient-to-r from-[#003D20] to-[#2E5B3D] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{branch.icon}</span>
                      <h3 className="text-xl font-bold text-white">{branch.name}</h3>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="p-6 space-y-4">
                    {/* Address */}
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">📍</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#3D4946]">Address</h4>
                        <p className="text-sm text-[#485F83]">{branch.address}</p>
                        <a 
                          href={branch.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00685C] font-semibold hover:underline inline-block mt-1"
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">📞</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#3D4946]">Phone</h4>
                        <a 
                          href={`tel:${branch.phone}`}
                          className="text-sm text-[#00685C] font-semibold hover:underline"
                        >
                          {branch.phoneFormatted}
                        </a>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">💬</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#3D4946]">WhatsApp</h4>
                        <a 
                          href={`https://wa.me/${branch.whatsapp}?text=Hello%20Dentline%20Clinic%20(${branch.name.split(' ')[0]})%2C%20I%20would%20like%20to%20make%20an%20enquiry`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[#25D366] font-semibold hover:underline bg-[#25D366]/10 px-3 py-1.5 rounded-full transition-colors hover:bg-[#25D366]/20"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">✉️</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#3D4946]">Email</h4>
                        <a 
                          href={`mailto:${branch.email}`}
                          className="text-sm text-[#00685C] font-semibold hover:underline"
                        >
                          {branch.email}
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">🕐</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#3D4946]">Hours</h4>
                        <p className="text-sm text-[#485F83]">{branch.hours}</p>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap gap-3">
                      <a 
                        href={`tel:${branch.phone}`}
                        className="flex-1 min-w-[120px] text-center bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
                      >
                        📞 Call Now
                      </a>
                      <a 
                        href={`https://wa.me/${branch.whatsapp}?text=Hello%20Dentline%20Clinic%20(${branch.name.split(' ')[0]})%2C%20I%20would%20like%20to%20make%20an%20enquiry`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[120px] text-center bg-[#25D366] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#1da851] transition-colors"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Section */}
            <div className="bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">🚨</span>
                <h4 className="text-xl font-bold text-[#BA1A1A]">24/7 Emergency Care</h4>
              </div>
              <p className="text-sm text-[#485F83] mb-4">
                For dental emergencies, call our 24/7 emergency line. We're here to help when you need us most.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="tel:09155588050"
                  className="inline-flex items-center gap-2 bg-[#BA1A1A] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#8B0000] transition-colors"
                >
                  📞 Call Emergency Line
                </a>
                <a 
                  href="https://wa.me/2349155588050?text=Hello%20Dentline%20Clinic%2C%20I%20have%20a%20dental%20emergency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#1da851] transition-colors"
                >
                  💬 Emergency WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}