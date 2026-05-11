"use client"

import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'doctor' && !user.is_approved) {
        router.push('/verify');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && user.role === 'doctor' && !user.is_approved)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
        <Sidebar />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 flex flex-col border-r bg-background shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
          </aside>
        </div>
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full"
            >
                {children}
            </motion.div>
        </main>
      </div>
    </div>
  )
}
