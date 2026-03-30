import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Star } from "lucide-react"
import Image from "next/image"

export function HealthcareHero() {
  return (
    <section className="container py-12 md:py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-yellow-500 font-medium">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-foreground">5.0 (980 Reviews)</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Bridging the Gap: <br />
            Urban Care for <br />
            Rural India
          </h1>

          <p className="text-xl text-muted-foreground max-w-[500px]">
             RAHI (Rural AI Healthcare Interface) combines advanced AI with telemedicine to bring world-class diagnostics to every village.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <Link href="#contact">
              <Button size="lg" className="rounded-full h-12 px-8 text-base">
                Book a call
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="rounded-full h-12 px-6 text-base gap-2 hover:bg-secondary">
              <div className="bg-background rounded-full p-1 border shadow-sm">
                <Play className="h-3 w-3 fill-foreground ml-0.5" />
              </div>
              Watch Video
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-8 border-t mt-8">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 number flex items-center justify-center bg-gray-100 rounded-full border-2 border-background overflow-hidden">
                    <img src={`https://randomuser.me/api/portraits/men/${i+20}.jpg`} alt="User" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-foreground">5000+ Appointments</p>
              <p className="text-sm text-muted-foreground">Patients booked already</p>
            </div>
          </div>
        </div>

        <div className="relative">
             {/* Using a placeholder from Unsplash that looks like a friendly doctor */}
            <div className="relative aspect-square md:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-secondary">
                <Image 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop"
                  alt="Doctor"
                  fill
                  className="object-cover"
                  priority
                />
            </div>
        </div>
      </div>
    </section>
  )
}
