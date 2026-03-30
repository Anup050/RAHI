"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  Building2,
  Activity,
  Stethoscope
} from "lucide-react"

const doctorRoutes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  // For 'My Patients', we could link to a list view. For now, putting a placeholder.
  { href: "/patients/list", label: "My Patients", icon: Users },
  { href: "/prescriptions", label: "Prescriptions", icon: FileText },
]

const adminRoutes = [
  { href: "/admin", label: "Overview", icon: Activity },
  { href: "/admin/clinics", label: "Clinics", icon: Building2 },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/logs", label: "System Logs", icon: FileText },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  
  // In a real app, we check user role. Defaulting to doctor for now.
  const routes = doctorRoutes

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center px-4 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-2">
               <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">RAHI Control</h2>
          </div>
          
          <div className="space-y-1">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Doctor Console
            </h3>
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === route.href || pathname?.startsWith(route.href + "/") 
                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                    : "text-muted-foreground"
                )}
              >
                <route.icon className="mr-3 h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
           <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              System
            </h3>
            <div className="space-y-1">
                 <Link
                    href="/settings"
                    className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                </Link>
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center rounded-md px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
