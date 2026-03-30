"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Blobs */}
      <div className="aurora-blob bg-blue-300 w-96 h-96 top-0 left-[-100px] rounded-full mix-blend-multiply opacity-70 animate-blob"></div>
      <div className="aurora-blob bg-teal-300 w-96 h-96 top-0 right-[-100px] rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live across 500+ Villages
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                    Healthcare Reaches <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                        Where Roads End.
                    </span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    RAHI bridges the gap between rural patients and urban specialists using AI-powered triage and offline-first mobile technology.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200">
                            I am a Doctor <ArrowRight className="ml-2 w-5 h-5"/>
                        </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                            I am a Patient
                        </Button>
                    </motion.div>
                </div>

                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> No Internet Needed</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> 10+ Languages</div>
                </div>
            </motion.div>
        </div>

        {/* 3D App Visual */}
        <div className="flex-1 w-full perspective-1000 relative z-10">
            <motion.div
                initial={{ opacity: 0, rotateX: 20, rotateY: -20, y: 50 }}
                animate={{ opacity: 1, rotateX: 10, rotateY: -15, y: [0, -20, 0] }}
                transition={{ 
                    y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    default: { duration: 1 }
                }}
                className="relative w-[300px] h-[600px] mx-auto bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden"
            >
                {/* Screen Content Mockup */}
                <div className="absolute inset-0 bg-white overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 p-6 pt-12 text-white">
                        <div className="w-12 h-12 bg-blue-500 rounded-full mb-4 opacity-50"></div>
                        <div className="h-4 w-32 bg-blue-400 rounded mb-2"></div>
                        <div className="h-8 w-48 bg-white/20 rounded"></div>
                    </div>
                    
                    {/* Body */}
                    <div className="p-4 space-y-4">
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-orange-200 rounded"></div>
                                    <div className="h-3 w-full bg-orange-100 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-center p-3 bg-slate-50 rounded-xl">
                                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                    <div className="h-3 w-16 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating Action Button */}
                    <div className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-sm"></div>
                    </div>
                </div>
            </motion.div>
            
            {/* Decoration Elements around phone */}
            <motion.div 
                animate={{ y: [0, -30, 0] }} 
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute top-20 right-10 bg-white p-4 rounded-2xl shadow-xl flex gap-3 items-center z-20"
            >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-bold text-slate-800 text-sm">Diagnosis Ready</span>
            </motion.div>

             <motion.div 
                animate={{ y: [0, 20, 0] }} 
                transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-40 left-0 bg-white p-4 rounded-2xl shadow-xl flex gap-3 items-center z-20"
            >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">AI</div>
                <div className="text-xs">
                    <div className="text-slate-500">Confidence</div>
                    <div className="font-bold text-slate-900">98.5%</div>
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  )
}
