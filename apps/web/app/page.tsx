import { Navbar } from "@/components/landing/Navbar"
import { HealthcareHero } from "@/components/landing/HealthcareHero"
import { ServicesSection } from "@/components/landing/ServicesGrid"
import { DoctorsSection } from "@/components/landing/DoctorsSection"
import { BlogSection } from "@/components/landing/BlogSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { ContactSection } from "@/components/landing/ContactSection"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/10 selection:text-primary">
      <Navbar />
      <HealthcareHero />
      <ServicesSection />
      <DoctorsSection />
      <BlogSection />
      <FAQSection />
      <ContactSection />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}
