import { Navbar } from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle2, Smartphone, LogIn, CalendarCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DownloadPage() {
  const steps = [
    {
      title: "Download & Install",
      description: "Click the download button to get the RAHI APK. Open it on your Android device to install.",
      icon: Smartphone,
      color: "bg-blue-500"
    },
    {
      title: "Log In or Sign Up",
      description: "Open the app and log in with your credentials or create a new patient account.",
      icon: LogIn,
      color: "bg-green-500"
    },
    {
      title: "Book Appointment",
      description: "Select a doctor, choose a slot, and book your consultation instantly.",
      icon: CalendarCheck,
      color: "bg-purple-500"
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Get the RAHI Mobile App
            </h1>
            <p className="text-xl text-muted-foreground">
              Your healthcare companion is just a download away. Experience urban healthcare in your hands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center bg-secondary/30 rounded-[2.5rem] p-8 md:p-12 mb-16 border border-primary/10">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Download for Android</h2>
              <p className="text-muted-foreground leading-relaxed">
                Download the RAHI Patient app (APK) directly. Access video consultations, prescriptions, and your medical history anytime, anywhere.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Real-time push notifications
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Seamless video calls
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Offline access to records
                </li>
              </ul>

              <a href="/downloads/rahi.apk" download>
                <Button size="lg" className="rounded-full h-14 px-8 text-lg gap-2 w-full md:w-auto">
                  <Download className="h-5 w-5" />
                  Download RAHI.apk
                </Button>
              </a>
              <p className="text-xs text-muted-foreground text-center md:text-left italic">
                *Compatible with Android 8.0 and above
              </p>
            </div>

            <div className="relative aspect-[9/16] bg-slate-900 rounded-[2rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
                <Image 
                  src="/rahi-app.png"
                  alt="RAHI Patient App Dashboard"
                  fill
                  className="object-cover"
                  priority
                  unoptimized={true}
                />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">How to get started</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-background border hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center mb-6 shadow-lg`}>
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 -right-4 w-8 h-[2px] bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 p-8 rounded-3xl bg-primary text-primary-foreground text-center">
            <h2 className="text-2xl font-bold mb-4">Need help with installation?</h2>
            <p className="mb-8 text-primary-foreground/80">
              Our support team is available 24/7 to help you set up the RAHI app in your village.
            </p>
            <Link href="/#contact">
              <Button variant="secondary" className="rounded-full h-12 px-8">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
