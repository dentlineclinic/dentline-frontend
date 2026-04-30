import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Navbar activePage="About" />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20 px-6 md:px-10 bg-gradient-to-br from-[#F8F9FF] to-white">
          <div className="max-w-[1200px] mx-auto text-center">
            <p className="text-sm font-semibold text-[#00685C] tracking-widest mb-3">ABOUT US</p>
            <h1 className="text-5xl font-bold text-[#0B1C30] mb-6">
              Redefining Dental Excellence
            </h1>
            <p className="text-lg text-[#485F83] max-w-2xl mx-auto">
              Founded on the principles of clinical precision and patient empathy, Dentline Clinic
              has been transforming smiles and lives for over a decade.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-6 md:px-10">
          <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
            {/* Image container - replaced gradient with your image */}
            <div className="rounded-2xl h-80 overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/da00pceww/image/upload/v1776973741/WhatsApp_Image_2026-04-23_at_3.52.30_PM_3_qtraks.jpg"
                alt="Dentline Clinic mission - dental care and compassion"
                className="w-full h-full object-full"
              />
            </div>

            {/* Right content - unchanged */}
            <div className="flex flex-col gap-6">
              <h2 className="text-4xl font-bold text-[#0B1C30]">Our Mission</h2>
              <p className="text-base text-[#485F83] leading-relaxed">
                We believe that exceptional dental care goes beyond clinical procedures. It's
                about creating an environment where patients feel safe, informed, and cared for at
                every step of their journey.
              </p>
              <p className="text-base text-[#485F83] leading-relaxed">
                Our team of 50+ specialists combines cutting-edge technology with compassionate
                care to deliver outcomes that exceed expectations.
              </p>
            </div>
          </div>
        </section>

        {/* Stats
        <section className="py-16 px-6 md:px-10 bg-[#EFF4FF]">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50+", label: "Expert Specialists" },
              { value: "10k+", label: "Patients Served" },
              { value: "15+", label: "Years of Excellence" },
              { value: "98%", label: "Patient Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-[#00685C] mb-2">{stat.value}</div>
                <div className="text-sm text-[#485F83]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section> */}

        {/* Team */}
        <section className="py-16 px-6 md:px-10">
  <div className="max-w-[1200px] mx-auto">
    <div className="text-center mb-12">
      <p className="text-sm font-semibold text-[#00685C] tracking-widest mb-2">OUR TEAM</p>
      <h2 className="text-4xl font-bold text-[#0B1C30]">Meet Our Specialists</h2>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { 
          name: "Dr. kenny", 
          role: "Orthodontist", 
          image: "https://res.cloudinary.com/da00pceww/image/upload/v1776973741/WhatsApp_Image_2026-04-23_at_3.52.30_PM_2_v3kivw.jpg"
        },
        { 
          name: "Dr. yinka", 
          role: "Oral Surgeon", 
          image: "https://res.cloudinary.com/da00pceww/image/upload/v1776973740/WhatsApp_Image_2026-04-23_at_3.42.29_PM_uiclax.jpg"
        },
        { 
          name: "Dr. tawio", 
          role: "Periodontist", 
          image: "https://res.cloudinary.com/da00pceww/image/upload/v1776973740/WhatsApp_Image_2026-04-23_at_3.42.30_PM_bqnnea.jpg"
        },
      ].map((doctor) => (
        <div
          key={doctor.name}
          className="bg-white border border-[#F1F5F9] rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
            <img
              src={doctor.image}
              alt={`Dr. ${doctor.name} - ${doctor.role}`}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-[#0B1C30]">{doctor.name}</h3>
          <p className="text-sm text-[#485F83] mt-1">{doctor.role}</p>
        </div>
      ))}
    </div>
  </div>
</section>
      </main>

      <Footer />
    </div>
  );
}
