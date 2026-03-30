import { ArrowRight, Bone, Brain, Stethoscope } from "lucide-react"
import Link from "next/link"

const services = [
  {
    icon: Brain,
    title: "AI Symptom Checker",
    description: "Instant, accurate preliminary diagnosis powered by advanced AI algorithms tailored for rural health data.",
    link: "#",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: Stethoscope,
    title: "Telemedicine",
    description: "Connect with top-tier city specialists via video call without leaving your village.",
    link: "#",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: Bone,
    title: "Chronic Care",
    description: "Continuous monitoring and support for long-term conditions like diabetes and hypertension.",
    link: "#",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  }
]

export function ServicesSection() {
  return (
    <section className="container py-12 md:py-24" id="services">
      <div className="text-center mb-16">
        <h2 className="text-sm font-bold text-primary tracking-wide uppercase mb-4">● Services</h2>
        <h3 className="text-3xl md:text-5xl font-bold text-foreground">
          Personalized solutions for <br className="hidden md:block" />
          better health
        </h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center text-center p-8 rounded-[2rem] bg-secondary hover:shadow-lg transition-shadow duration-300">
            <div className={`h-16 w-16 rounded-full ${service.bgColor} flex items-center justify-center mb-6`}>
              <service.icon className={`h-8 w-8 ${service.color}`} />
            </div>
            <h4 className="text-xl font-bold mb-4">{service.title}</h4>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {service.description}
            </p>
            <Link href={service.link} className="mt-auto flex items-center text-sm font-medium hover:underline group">
              View Services <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
