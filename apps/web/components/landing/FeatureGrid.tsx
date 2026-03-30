"use client"

import { motion } from "framer-motion"
import { WifiOff, BrainCircuit, Languages, ShieldCheck } from "lucide-react"

const features = [
  {
    title: "Offline First",
    description: "Works seamlessly in remote areas with zero connectivity. Data syncs automatically when online.",
    icon: WifiOff,
    color: "bg-red-100 text-red-600",
    cols: "md:col-span-2",
  },
  {
    title: "AI Powered Triage",
    description: "Instant analysis of symptoms using advanced ML models trained on local epidemiological data.",
    icon: BrainCircuit,
    color: "bg-purple-100 text-purple-600",
    cols: "md:col-span-1",
  },
  {
    title: "10+ Languages",
    description: "Native support for Hindi, Marathi, Bengali, and more.",
    icon: Languages,
    color: "bg-orange-100 text-orange-600",
    cols: "md:col-span-1",
  },
  {
    title: "Secure & Private",
    description: "End-to-end encryption compliant with digital healthcare standards.",
    icon: ShieldCheck,
    color: "bg-green-100 text-green-600",
    cols: "md:col-span-2",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Why RAHI?</h2>
            <p className="text-slate-500 text-lg">Built for the unique challenges of rural healthcare, focusing on accessibility and speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
                <motion.div
                    key={idx}
                    className={`${feature.cols} bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                        <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  )
}
