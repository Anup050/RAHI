"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Activity, Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="bg-primary text-primary-foreground p-1 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          RAHI
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
          <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
          <Link href="#doctors" className="hover:text-primary transition-colors">Doctors</Link>
          <Link href="/download" className="hover:text-primary transition-colors font-semibold text-primary">Get App</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 absolute top-full left-0 w-full shadow-lg flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <Link href="#about" onClick={toggleMenu} className="text-lg font-medium py-2 border-b">About</Link>
          <Link href="#services" onClick={toggleMenu} className="text-lg font-medium py-2 border-b">Services</Link>
          <Link href="#doctors" onClick={toggleMenu} className="text-lg font-medium py-2 border-b">Doctors</Link>
          <Link href="/download" onClick={toggleMenu} className="text-lg font-bold py-2 border-b text-primary">Get App</Link>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" onClick={toggleMenu}>
              <Button variant="outline" className="w-full justify-center h-12 text-lg">Login</Button>
            </Link>
            <Link href="#contact" onClick={toggleMenu}>
              <Button className="w-full justify-center h-12 text-lg">Book a call</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
