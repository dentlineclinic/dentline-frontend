import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-white">
      <Navbar activePage="Home" />

      {/* Hero Section */}
      <section className="pt-32 pb-10 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#00685C]/20 rounded-full px-3 py-1 w-fit">
              <span className="text-sm">✨</span>
              <span className="text-sm font-semibold text-[#00685C] tracking-wide">
                Excellence in Restorative Dentistry
              </span>
            </div>

            <h1 className="text-5xl font-bold text-[#0B1C30] leading-tight">
              Precision Care for Your <span className="text-[#00685C]">Everlasting</span> Smile
            </h1>

            <p className="text-lg text-[#485F83] leading-relaxed max-w-lg">
              Bridging rigorous clinical professionalism with human-centric empathy. Experience
              dental care redesigned for your comfort and long-term health.
            </p>

            <div className="flex gap-4 pt-2">
              <Link
                href="/register"
                className="bg-[#00685C] text-white font-semibold text-sm px-8 py-4 rounded-lg shadow-lg hover:bg-[#008375] transition-all"
              >
                Start Your Journey
              </Link>
              <Link
                href="/services"
                className="border-2 border-[#435B7E] text-[#435B7E] font-semibold text-sm px-8 py-4 rounded-lg hover:bg-[#435B7E] hover:text-white transition-all"
              >
                View All Services
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-10 border-t border-[#F1F5F9]">
              <div className="flex -space-x-3">
                {/* Image 1 */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src="https://res.cloudinary.com/da00pceww/image/upload/v1776973740/WhatsApp_Image_2026-04-23_at_3.42.29_PM_uiclax.jpg"
                    alt="Expert clinician"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 2 */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src="https://res.cloudinary.com/da00pceww/image/upload/v1776973740/WhatsApp_Image_2026-04-23_at_3.52.29_PM_1_xonrnl.jpg"
                    alt="Expert clinician"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 3 */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src="https://res.cloudinary.com/da00pceww/image/upload/v1776973740/WhatsApp_Image_2026-04-23_at_3.42.30_PM_bqnnea.jpg"
                    alt="Expert clinician"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#0B1C30]">15+ Expert Clinicians</span>
                <span className="text-xs text-[#485F83]">Ready to assist you today</span>
              </div>
            </div>
          </div>

          {/* Right: Image placeholder */}
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#00685C]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#BBD3FD]/20 rounded-full blur-3xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* YOUR IMAGE IS NOW THE BACKGROUND HERE */}
              <div
                className="aspect-[4/5] flex items-end p-8"
                style={{
                  backgroundImage: `url("https://res.cloudinary.com/da00pceww/image/upload/v1776973742/WhatsApp_Image_2026-04-23_at_3.52.31_PM_ojqm8k.jpg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className=" p-6 w-full">
                  <h4 className="text-white font-semibold text-2xl mb-2">Accredited Excellence</h4>
                  <p className="text-white/80 text-sm">
                    Recognized for surgical precision and hygiene.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-6 md:px-10 bg-[#EFF4FF]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-base text-[#00685C] tracking-widest mb-2">OUR SPECIALIZATIONS</p>
            <h2 className="text-4xl font-bold text-[#0B1C30]">Comprehensive Clinical Care</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Major Card */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                {/* Full Arch Restoration Icon - Teeth emoji */}
                <div className="w-7 h-7 flex items-center justify-center">
                  <span className="text-5xl text-[#00685C]">🦷</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#0B1C30] pt-3">Full Arch Restoration</h3>
                <p className="text-base text-[#485F83]">
                  Using state-of-the-art 3D imaging to rebuild confidence through permanent,
                  natural-looking tooth replacement.
                </p>
              </div>
              <div className="pt-5">
                <div className="w-full max-w-md h-64 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="https://images.squarespace-cdn.com/content/v1/66a8f47a3910612f6c7fcc88/966ea665-0f79-4351-a540-9891332af953/panoramic-dental-x-ray-2023-11-27-05-05-48-utc.jpg"
                    alt="Panoramic dental X-ray for full arch restoration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Small Cards */}
            <div className="grid grid-rows-2 gap-6">
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 flex flex-col gap-3">
                {/* Cosmetic Whitening Icon - Laughing emoji */}
                <div className="w-7 h-7 flex items-center justify-center">
                  <span className="text-5xl text-[#00685C]">😁</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#0B1C30]">Cosmetic Whitening</h3>
                <p className="text-base text-[#485F83]">
                  Advanced laser technology for safe, lasting brightness.
                </p>
              </div>

              <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 flex flex-col gap-3">
                {/* Periodontal Care Icon - First aid emoji */}
                <div className="w-7 h-7 flex items-center justify-center">
                  <span className="text-5xl text-[#00685C]">🩺</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#0B1C30]">Periodontal Care</h3>
                <p className="text-base text-[#485F83]">
                  Specialized treatments for gum health and stability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Images */}
          <div className="grid grid-cols-2 gap-3">
  {/* First image - replacing the gradient div */}
  <div className="rounded-xl h-48 overflow-hidden">
    <img
      src="https://res.cloudinary.com/da00pceww/image/upload/v1776973740/WhatsApp_Image_2026-04-23_at_3.52.29_PM_2_dqrhmi.jpg"
      alt="Dental clinic treatment"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Bio-Digital Tech Card with bio-tech emoji */}
  <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 flex flex-col gap-2 shadow-sm">
    <div className="text-2xl">🧬</div>
    <h4 className="text-base font-semibold text-[#0B1C30]">Bio-Digital Tech</h4>
  </div>

  {/* On-Demand Care Card with nurse emoji */}
  <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 flex flex-col gap-2 shadow-sm">
    <div className="text-2xl">👩‍⚕️</div>
    <h4 className="text-base font-semibold text-[#0B1C30]">On-Demand Care</h4>
  </div>

  {/* Second image - replacing the second gradient div */}
  <div className="rounded-xl h-48 overflow-hidden">
    <img
      src="https://res.cloudinary.com/da00pceww/image/upload/v1776973741/WhatsApp_Image_2026-04-23_at_3.52.30_PM_1_jnteqt.jpg"
      alt="Dental clinic equipment"
      className="w-full h-full object-cover"
    />
  </div>
</div>



          {/* Right: Content */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-bold text-[#0B1C30] leading-tight">
              Experience the Serenity of Professionalism
            </h2>
            <p className="text-base text-[#485F83]">
              We've engineered every touchpoint of our clinic to reduce anxiety and increase
              clinical outcomes. From our silent surgical drills to our calming Navy-toned
              interiors.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                {
                  title: "Advanced Sterilization",
                  desc: "Exceeding hospital-grade hygiene standards daily.",
                },
                {
                  title: "Transparent Pricing",
                  desc: "Clear, upfront digital quotes with no hidden clinical fees.",
                },
                {
                  title: "Same-Day Results",
                  desc: "On-site dental lab for immediate restorations.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="w-5 h-5 bg-[#00685C] rounded-full flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-[#0B1C30]">{item.title}</h5>
                    <p className="text-sm text-[#485F83]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section >

      {/* Testimonials */}
      <section className="py-16 px-6 md:px-10 bg-[#435B7E]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-base text-[#8EF5E2] tracking-widest mb-2">PATIENT EXPERIENCES</p>
            <h2 className="text-4xl font-bold text-white">Trusted by Our Community</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The level of precision in their restorative work is unmatched. I felt completely informed and comfortable throughout my implant procedure.",
                name: "Marcus Thorne",
                role: "Restorative Patient",
              },
              {
                quote:
                  "As someone with high dental anxiety, Dentline completely changed my outlook. The clinical calm environment actually works.",
                name: "Sarah Jenkins",
                role: "Routine Care",
              },
              {
                quote:
                  "Highly recommend for families. They were so patient with my children, making the whole visit feel like a positive learning experience.",
                name: "David Chen",
                role: "Family Care",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-10 flex flex-col gap-6"
              >
                {/* Star Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#8EF5E2] fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base text-white/90">{testimonial.quote}</p>

                {/* Name and Role - Removed profile picture */}
                <div className="pt-4">
                  <h5 className="text-base font-semibold text-white">{testimonial.name}</h5>
                  <p className="text-xs text-white/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div >
  );
}
