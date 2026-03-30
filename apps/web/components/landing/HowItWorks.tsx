"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useRef } from "react"

const steps = [
    {
        id: "01",
        title: "Symptom Check",
        description: "Patient enters symptoms via voice or text in their local language.",
    },
    {
        id: "02",
        title: "AI Triage",
        description: "Our engine analyzes risk levels and suggests immediate actions.",
    },
    {
        id: "03",
        title: "Doctor Consult",
        description: "High-risk cases are instantly connected to specialists for video consult.",
    }
]

export function HowItWorks() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "end center"]
    })
    
    return (
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4" ref={ref}>
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">How it Works</h2>
                </div>

                <div className="relative max-w-2xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-[20px] top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
                    
                    {/* Animated Fill Line */}
                    <motion.div 
                        style={{ scaleY: scrollYProgress }}
                        className="absolute left-[20px] top-0 w-1 bg-blue-600 rounded-full origin-top h-full"
                    />

                    <div className="space-y-24">
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative flex gap-8 items-start group"
                            >
                                <div className="relative z-10 w-11 h-11 bg-white border-4 border-blue-50 outline outline-4 outline-white rounded-full flex items-center justify-center font-bold text-blue-600 text-sm shadow-sm">
                                    {step.id}
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                                    <p className="text-slate-500 text-lg leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
