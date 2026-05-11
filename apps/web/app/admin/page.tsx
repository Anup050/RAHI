"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Users, Calendar, AlertCircle, Loader2, RefreshCcw, ChevronLeft, ArrowRight, Activity, Building2, Search, User as UserIcon, History, FileText, Pill, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AdminStats {
    total_appointments: number;
    pending_approvals: number;
    total_doctors: number;
    recent_appointments: any[];
}

interface UserSummary {
    profile: any;
    medical_history?: {
        notes: any[];
        prescriptions: any[];
    };
    total_consultations?: number;
    consultation_history?: any[];
}

export default function AdminPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [summary, setSummary] = useState<UserSummary | null>(null)
    const [isSummaryLoading, setIsSummaryLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [analytics, setAnalytics] = useState<any | null>(null)
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            
            // Fetch stats
            const statsRes = await fetch('/api/admin/stats', { headers })
            if (statsRes.ok) setStats(await statsRes.json())
            
            // Fetch users
            const patientsRes = await fetch('/api/admin/patients', { headers })
            if (patientsRes.ok) setPatients(await patientsRes.json())
            
            const doctorsRes = await fetch('/api/admin/doctors', { headers })
            if (doctorsRes.ok) setDoctors(await doctorsRes.json())
            
            // Fetch analytics
            setIsAnalyticsLoading(true)
            const analyticsRes = await fetch('/api/analytics/admin/health-analytics', { headers })
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
            setIsAnalyticsLoading(false)
            
        } catch (e) {
            console.error("Failed to fetch admin data", e)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSummary = async (userToFetch: any) => {
        setSelectedUser(userToFetch)
        setIsSummaryLoading(true)
        setSummary(null)
        try {
            const token = localStorage.getItem('token')
            const endpoint = userToFetch.role === 'patient' ? `patient-summary/${userToFetch.id}` : `doctor-summary/${userToFetch.id}`
            const res = await fetch(`/api/admin/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setSummary(data)
            } else {
                console.error(`Failed to fetch summary: ${res.status} ${res.statusText}`)
                // Summary will stay null, triggering the error UI
            }
        } catch (e) {
            console.error("Failed to fetch user summary", e)
        } finally {
            setIsSummaryLoading(false)
        }
    }

    const toggleStatus = async (userToToggle: any) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/admin/toggle-user-status/${userToToggle.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Update local state
                if (userToToggle.role === 'patient') {
                    setPatients(prev => prev.map(p => p.id === userToToggle.id ? { ...p, is_active: data.is_active } : p))
                } else {
                    setDoctors(prev => prev.map(d => d.id === userToToggle.id ? { ...d, is_active: data.is_active } : d))
                }
            }
        } catch (e) {
            console.error("Failed to toggle status", e)
        }
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData()
        }
    }, [user])

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h1 className="text-2xl font-bold">Access Restricted</h1>
                <p className="text-muted-foreground">Only system administrators can access this page.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Home
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                        <p className="text-muted-foreground">Platform-wide activity and health metrics.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm" disabled={isLoading}>
                        <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="doctors">Doctors</TabsTrigger>
                    <TabsTrigger value="ai-analytics">AI Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats?.total_appointments || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Across all specializations</p>
                            </CardContent>
                        </Card>
                        
                        <Card className={(stats?.pending_approvals || 0) > 0 ? "bg-amber-50 border-amber-200" : ""}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                <Users className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-amber-600">{stats?.pending_approvals || 0}</div>
                                    <Link href="/admin/approvals">
                                        <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100">
                                            Manage <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Doctors awaiting verification</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{(stats?.total_doctors || 0) - (stats?.pending_approvals || 0)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Verified healthcare providers</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Appointments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" /> Recent Platform Activity
                                </CardTitle>
                                <CardDescription>Latest consultation status across RAHI.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : stats?.recent_appointments && stats.recent_appointments.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor ID</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {stats.recent_appointments.map((apt: any) => (
                                                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                            {isNaN(new Date(apt.time).getTime()) ? apt.time : new Date(apt.time).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{apt.patient_name || "Patient"}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">{apt.patient_rahi_id || 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{apt.doctor_name || "Unassigned"}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-mono">{apt.doctor_rahi_id || 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                apt.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                                apt.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {apt.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions / Shortcuts */}
                        <Card className="bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-white">Admin Quick Actions</CardTitle>
                                <CardDescription className="text-slate-400">Common administrative tasks.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Link href="/admin/approvals" className="block p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                                <Users className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold">Verify Doctors</div>
                                                <div className="text-xs text-slate-400">{stats?.pending_approvals || 0} applications pending</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-500" />
                                    </div>
                                </Link>
                                
                                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/20 opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Building2 className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Manage Clinics</div>
                                            <div className="text-xs text-slate-400">Coming soon</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="patients" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Patient Directory</CardTitle>
                                <CardDescription>Manage and view all registered patients.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    placeholder="Search patients..."
                                    className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {patients
                                        .filter(p => (p.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (p.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
                                        .map((patient: any) => (
                                            <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                            {patient.full_name?.charAt(0) || 'P'}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-slate-900">{patient.full_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">{patient.rahi_id || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{patient.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        patient.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        {patient.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => fetchSummary(patient)} className="text-primary hover:text-primary/80 transition-colors">View Details</button>
                                                        <button onClick={() => toggleStatus(patient)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                            {patient.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="doctors" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Medical Practitioners</CardTitle>
                                <CardDescription>Verified and pending doctors on the platform.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    placeholder="Search doctors..."
                                    className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {doctors
                                        .filter(d => (d.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (d.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
                                        .map((doctor: any) => (
                                            <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                                                            {doctor.full_name?.charAt(0) || 'D'}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-slate-900">{doctor.full_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-mono">{doctor.rahi_id || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{doctor.specialization || 'Not Specified'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        doctor.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {doctor.is_approved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => fetchSummary(doctor)} className="text-primary hover:text-primary/80 transition-colors">View Profile</button>
                                                        <button onClick={() => toggleStatus(doctor)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                            {doctor.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="ai-analytics" className="space-y-6">
                    {isAnalyticsLoading || !analytics ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{analytics.total_predictions}</div>
                                        <p className="text-xs text-muted-foreground">Platform wide</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-500">{analytics.high_risk_cases}</div>
                                        <p className="text-xs text-muted-foreground">Requires attention</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{analytics.avg_confidence}</div>
                                        <p className="text-xs text-muted-foreground">AI model accuracy</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{analytics.active_alerts}</div>
                                        <p className="text-xs text-muted-foreground">System generated</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>System Patient Inflow</CardTitle>
                                        <CardDescription>Daily patient visits across all doctors over the last week.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={analytics.inflow_data}>
                                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}`} />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Global Diagnosis Distribution</CardTitle>
                                        <CardDescription>Top conditions diagnosed recently platform-wide.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                        {analytics.diagnosis_data && analytics.diagnosis_data.length > 0 ? (
                                            <PieChart>
                                                <Pie
                                                    data={analytics.diagnosis_data}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                >
                                                    {analytics.diagnosis_data.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                No diagnosis data available
                                            </div>
                                        )}
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Age & Gender Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                     <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={analytics.age_data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="male" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="female" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="other" fill="#ffc658" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* User Profile Summary Modal */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            {selectedUser?.role === 'patient' ? <UserIcon className="text-blue-600" /> : <Activity className="text-green-600" />}
                            <div>
                                <span>{selectedUser?.full_name}'s Profile</span>
                                {selectedUser?.rahi_id && (
                                    <span className="ml-3 text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                        {selectedUser.rahi_id}
                                    </span>
                                )}
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            Comprehensive overview for {selectedUser?.role}.
                        </DialogDescription>
                    </DialogHeader>

                    {isSummaryLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Aggregating historical records...</p>
                        </div>
                    ) : summary ? (
                        <div className="flex-1 overflow-auto py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Contact Info</div>
                                    <div className="font-medium">{summary.profile?.email}</div>
                                    <div className="text-sm text-slate-500">{summary.profile?.phone_number || "No phone linked"}</div>
                                </div>
                                {selectedUser?.role === 'doctor' && (
                                    <>
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">Expertise</div>
                                            <div className="font-bold text-blue-900">{summary.profile?.specialization}</div>
                                            <div className="text-sm text-blue-700">{summary.profile?.experience_years} years exp.</div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                            <div className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">Performance</div>
                                            <div className="text-2xl font-bold text-green-900">{summary.total_consultations}</div>
                                            <div className="text-sm text-green-700 font-medium">Completed consultations</div>
                                        </div>
                                    </>
                                )}
                                {selectedUser?.role === 'patient' && (
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 md:col-span-2">
                                        <div className="text-xs text-purple-600 uppercase font-bold tracking-wider mb-1">Personal Details</div>
                                        <div className="flex gap-4">
                                            <div>
                                                <div className="text-sm text-purple-700">Age</div>
                                                <div className="font-bold">{summary.profile?.age || "N/A"}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-purple-700">Account Status</div>
                                                <div className="font-bold text-green-600">Active</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <History className="h-5 w-5 text-slate-400" />
                                    {selectedUser?.role === 'patient' ? "Medical History Timeline" : "Recent Consultations History"}
                                </h3>
                                
                                {selectedUser?.role === 'patient' ? (
                                    <div className="space-y-4">
                                        <div className="border rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 p-3 border-b font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-600" /> Clinical Notes
                                            </div>
                                            {(summary.medical_history?.notes?.length || 0) > 0 ? (
                                                summary.medical_history?.notes.map((note: any, idx: number) => (
                                                    <div key={idx} className="p-4 border-b last:border-0">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="text-xs font-bold text-slate-400">{new Date(note.created_at).toLocaleString()}</div>
                                                            <div className="flex gap-1">
                                                                {note.tags?.map((t: string) => <Badge key={t} variant="outline" className="text-[10px] py-0">{t}</Badge>)}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-700">{note.content}</p>
                                                    </div>
                                                ))
                                            ) : <div className="p-6 text-center text-sm text-slate-400 italic">No clinical notes recorded.</div>}
                                        </div>

                                        <div className="border rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 p-3 border-b font-medium flex items-center gap-2">
                                                <Pill className="h-4 w-4 text-purple-600" /> Prescribed Medications
                                            </div>
                                            {(summary.medical_history?.prescriptions?.length || 0) > 0 ? (
                                                <Table>
                                                    <TableBody>
                                                        {summary.medical_history?.prescriptions.map((pres: any) => (
                                                            <TableRow key={pres.id}>
                                                                <TableCell className="font-bold">{pres.medicine}</TableCell>
                                                                <TableCell className="text-sm">{pres.dosage}</TableCell>
                                                                <TableCell className="text-sm text-slate-500">{pres.frequency}</TableCell>
                                                                <TableCell className="text-right text-xs text-slate-400">{new Date(pres.created_at).toLocaleDateString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : <div className="p-6 text-center text-sm text-slate-400 italic">No prescriptions found.</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="border rounded-xl overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead>Patient</TableHead>
                                                    <TableHead>Symptom/Reason</TableHead>
                                                    <TableHead>Mode</TableHead>
                                                    <TableHead className="text-right">Date & Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(summary.consultation_history?.length || 0) > 0 ? (
                                                    summary.consultation_history?.map((apt: any) => (
                                                        <TableRow key={apt.id}>
                                                            <TableCell className="font-medium">{apt.patient_name}</TableCell>
                                                            <TableCell className="max-w-[200px] truncate">{apt.reason}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="text-[10px]">{apt.type}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="text-xs font-bold">{new Date(apt.time).toLocaleDateString()}</div>
                                                                <div className="text-[10px] text-slate-400">{new Date(apt.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">No consultations on record for this practitioner.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {(summary.profile?.govt_id_url || summary.profile?.clinic_id_url) && (
                                        <div className="mt-8">
                                            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                                                <FileText className="h-5 w-5 text-slate-400" />
                                                Verification Documents
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {summary.profile?.govt_id_url && (
                                                    <a 
                                                        href={summary.profile.govt_id_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-4 border rounded-xl hover:bg-slate-50 transition-colors group"
                                                    >
                                                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                                                            <FileText className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">Government ID Proof</div>
                                                            <div className="text-xs text-muted-foreground underline">View Document</div>
                                                        </div>
                                                    </a>
                                                )}
                                                {summary.profile?.clinic_id_url && (
                                                    <a 
                                                        href={summary.profile.clinic_id_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-4 border rounded-xl hover:bg-slate-50 transition-colors group"
                                                    >
                                                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                                                            <FileText className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">Clinic/Hospital ID Card</div>
                                                            <div className="text-xs text-muted-foreground underline">View Document</div>
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                            <h3 className="font-bold text-lg">Failed to load summary</h3>
                            <p className="text-muted-foreground max-w-xs">There was an error fetching records from the server.</p>
                            <Button onClick={() => fetchSummary(selectedUser)} variant="outline" className="mt-4">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Retry
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
