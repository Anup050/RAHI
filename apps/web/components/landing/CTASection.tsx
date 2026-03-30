"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden p-12 lg:p-24 text-center text-white"
        >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-grid-slate-100/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Ready to transform rural healthcare?</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">Join the movement to bring quality diagnosis to every corner of the country.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-500 text-white">
                        Get Started <ArrowRight className="ml-2 w-5 h-5"/>
                    </Button>
                    <Button variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-slate-900 hover:bg-slate-100">
                         View Demo
                    </Button>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  )
}
