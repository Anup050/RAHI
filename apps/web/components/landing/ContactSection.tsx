"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2, CheckCircle } from "lucide-react"

export function ContactSection() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Simple form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: "", email: "", phone: "", date: "", message: "" })
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 5000)
      } else {
        alert("Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-primary text-primary-foreground py-12 md:py-24" id="contact">
      <div className="container grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-yellow-400">
             <span className="bg-white/10 px-2 py-1 rounded text-xs font-medium">● Contact</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Contact us for <br />
            more information <br />
            & get started
          </h2>

          <div className="flex gap-1 text-yellow-400">
             {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
          </div>
        </div>

        <div className="bg-primary-foreground/5 p-8 rounded-[2rem] border border-primary-foreground/10">
            {success ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Message Sent!</h3>
                    <p className="text-primary-foreground/80">Thank you for reaching out. We will get back to you shortly.</p>
                    <Button 
                        onClick={() => setSuccess(false)}
                        className="bg-white text-primary hover:bg-white/90 rounded-full px-8 mt-4"
                    >
                        Send another message
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                            <Input 
                                id="name" 
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe" 
                                required
                                className="bg-transparent border-primary-foreground/20 placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/50" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                            <Input 
                                id="email" 
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com" 
                                required
                                className="bg-transparent border-primary-foreground/20 placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/50" 
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                            <Input 
                                id="phone" 
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000" 
                                className="bg-transparent border-primary-foreground/20 placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/50" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="date" className="text-sm font-medium">Date</label>
                            <Input 
                                id="date" 
                                type="date"
                                value={formData.date}
                                onChange={handleChange} 
                                className="bg-transparent border-primary-foreground/20 placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/50 text-white fill-white" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">Message or additional details</label>
                        <Textarea 
                            id="message" 
                            value={formData.message}
                            onChange={handleChange}
                            className="min-h-[100px] bg-transparent border-primary-foreground/20 placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/50" 
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto rounded-full px-8 h-12 text-base font-bold mt-2">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </form>
            )}
        </div>
      </div>
    </section>
  )
}
