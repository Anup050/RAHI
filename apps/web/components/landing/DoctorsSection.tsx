import { Button } from "@/components/ui/button"
import Image from "next/image"

export function DoctorsSection() {
  return (
    <section className="container py-12 md:py-24" id="doctors">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="mb-8">
             <h2 className="text-sm font-bold text-primary tracking-wide uppercase mb-4">● Why us</h2>
             <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Why choose RAHI for <br />
                your healthcare?
             </h3>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border flex items-center justify-center font-bold text-lg">
                01
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Accessible Everywhere</h4>
                <p className="text-muted-foreground">
                  Breaking geographical barriers to bring quality healthcare to remote and underserved areas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border flex items-center justify-center font-bold text-lg">
                02
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">AI-Powered Precision</h4>
                <p className="text-muted-foreground">
                  Leveraging cutting-edge AI to assist local health workers with accurate, rapid diagnoses.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button size="lg" className="rounded-full px-8">
                Get Started
            </Button>
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0">
             <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-secondary">
                <Image 
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop"
                  alt="Doctors"
                  fill
                  className="object-cover"
                />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-4 md:-bottom-12 md:-left-12 bg-card p-4 md:p-6 rounded-2xl shadow-xl max-w-[250px] md:max-w-xs w-full border">
                <h4 className="font-bold mb-1 text-sm md:text-base">Available Doctors</h4>
                <p className="text-xs text-muted-foreground mb-4">Choose Doctors</p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden bg-gray-200">
                             <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Doc" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Jonathan Reed</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Gastroenterologist</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden bg-gray-200">
                             <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Doc" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Olivia Bennett</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Dermatologist</p>
                        </div>
                    </div>
                </div>

                <Button variant="secondary" className="w-full mt-4 rounded-xl text-xs h-8">
                    Meet Our Experts
                </Button>
            </div>
        </div>
      </div>
    </section>
  )
}
