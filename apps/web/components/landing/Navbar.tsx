import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"

export function Navbar() {
  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="bg-primary text-primary-foreground p-1 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          RAHI
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
          <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
          <Link href="#doctors" className="hover:text-primary transition-colors">Doctors</Link>
          <Link href="#blog" className="hover:text-primary transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hover:bg-primary/5">
              Login
            </Button>
          </Link>
          <Link href="#contact">
            <Button className="rounded-full bg-primary hover:bg-primary/90">
              Book a call
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
