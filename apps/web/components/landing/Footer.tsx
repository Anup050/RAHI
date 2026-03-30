import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Activity, Instagram, Linkedin, Twitter, Youtube, Facebook } from "lucide-react"
import { NewsletterForm } from "./NewsletterForm"

export default function Footer() {
  return (
    <footer className="pt-24 pb-12 bg-background text-foreground">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-24">
            <div>
                 <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-6">
                    <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                        <Activity className="h-5 w-5" />
                    </div>
                    RAHI
                </Link>
                <p className="text-xl md:text-2xl max-w-sm font-medium leading-relaxed mb-8">
                    Bridging the gap between urban expertise and rural needs with AI-powered healthcare.
                </p>
                <Link href="#contact">
                    <Button size="lg" className="rounded-full px-8">
                        Book a call
                    </Button>
                </Link>
            </div>

            <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12">
            <div className="space-y-4">
                <h4 className="font-bold text-lg">Static pages</h4>
                <ul className="space-y-3 text-muted-foreground">
                    <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                    <li><Link href="#about" className="hover:text-primary transition-colors">About</Link></li>
                    <li><Link href="#contact" className="hover:text-primary transition-colors">Contact</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">404</Link></li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="font-bold text-lg">CMS Pages</h4>
                <ul className="space-y-3 text-muted-foreground">
                    <li><Link href="#services" className="hover:text-primary transition-colors">Services</Link></li>
                    <li><Link href="#doctors" className="hover:text-primary transition-colors">Doctors</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                    <li><Link href="#blog" className="hover:text-primary transition-colors">Blogs</Link></li>
                </ul>
            </div>
             <div className="space-y-4">
                <h4 className="font-bold text-lg">Detail pages</h4>
                <ul className="space-y-3 text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary transition-colors">Service (CMS)</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">Doctor (CMS)</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">Career (CMS)</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">Blogs (CMS)</Link></li>
                </ul>
            </div>
             <div className="space-y-4">
                <h4 className="font-bold text-lg">Follow us</h4>
                <ul className="space-y-3 text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">LinkedIn</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Facebook</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Twitter</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Youtube</Link></li>
                </ul>
            </div>
        </div>
        
         <div className="flex justify-between items-center mt-12 pt-8 border-t text-sm text-muted-foreground">
            <p>© 2025 RAHI. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </div>
    </footer>
  )
}
