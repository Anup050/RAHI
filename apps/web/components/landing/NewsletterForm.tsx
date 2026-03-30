"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle } from "lucide-react"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSuccess(true)
        setEmail("")
        setTimeout(() => setSuccess(false), 5000)
      } else {
        alert("Failed to subscribe. Please try again.")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-secondary rounded-[2rem] p-8 md:p-12">
      <h3 className="text-2xl font-bold mb-8">Stay up to date</h3>
      {success ? (
        <div className="flex items-center gap-3 text-green-600 bg-green-100 p-4 rounded-xl">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Thanks for subscribing!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <Input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com" 
            className="h-12 bg-background border-transparent shadow-sm rounded-xl"
            required
          />
          <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 rounded-xl shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
          </Button>
        </form>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        by subscribing you will agree to privacy and policy
      </p>
    </div>
  )
}
