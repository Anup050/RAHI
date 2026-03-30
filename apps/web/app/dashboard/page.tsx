"use client"

import { Activity, Users, CalendarDays, Clock, Plus, Loader2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboard"
import { RegisterPatientModal } from "@/components/dashboard/RegisterPatientModal"
import { Skeleton } from "../../components/ui/skeleton"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: activity, isLoading: activityLoading, error: activityError } = useRecentActivity();

  if (statsError || activityError) {
      // toast.error("Failed to load dashboard data"); 
      // Handling gracefully inline
  }

  const statCards = [
    { 
        title: "Today's Appointments", 
        value: stats?.appointments_count ?? 0, 
        icon: CalendarDays, 
        description: "Scheduled today", 
        trend: "neutral" as const 
    },
    { 
        title: "Pending Requests", 
        value: stats?.pending_requests ?? 0, 
        icon: Clock, 
        description: "Requires action", 
        trend: "up" as const, 
        trendValue: "New" 
    },
    { 
        title: "Total Patients", 
        value: stats?.total_patients ?? 0, 
        icon: Users, 
        description: "Active records", 
        trend: "up" as const, 
        trendValue: "Growing" 
    },
    { 
        title: "Avg Wait Time", 
        value: stats?.avg_wait_time ?? "--", 
        icon: Activity, 
        description: "Target: <15m", 
        trend: "down" as const, 
        trendValue: "Good" 
    },
  ];

  const handleDownloadReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("RAHI Clinic Performance Report", 14, 22);
    
    // Date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Stats Section
    doc.setFontSize(14);
    doc.text("Summary Stats", 14, 45);
    
    const statsData = [
        ["Metric", "Value", "Description"],
        ...statCards.map(s => [s.title, s.value.toString(), s.description])
    ];

    autoTable(doc, {
        startY: 50,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });

    // Recent Activity Section
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.text("Recent Activity", 14, finalY + 15);

    const activityData = activity?.map(item => [
        item.id,
        item.patient_name,
        item.type,
        item.time,
        item.status
    ]) || [];

    autoTable(doc, {
        startY: finalY + 20,
        head: [['ID', 'Patient', 'Type', 'Time', 'Status']],
        body: activityData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94] }
    });

    doc.save(`RAHI-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your clinic's performance today.</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button onClick={handleDownloadReport}>Download Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-[100px]" /></CardTitle>
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold"><Skeleton className="h-8 w-[50px]" /></div>
                        <div className="text-xs text-muted-foreground mt-1"><Skeleton className="h-3 w-[80px]" /></div>
                    </CardContent>
                </Card>
            ))
        ) : (
            statCards.map((stat) => (
                <StatCard key={stat.title} {...stat} />
            ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    {stats?.pending_requests ? `You have ${stats.pending_requests} pending appointments to review.` : "Recent appointments and updates."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activityLoading ? (
                     <div className="space-y-2">
                        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                     </div>
                ) : activity && activity.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activity.map((item) => (
                                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.id}</TableCell>
                                    <TableCell>{item.patient_name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.time}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={
                                                item.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                                item.status === 'confirmed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                item.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                                'bg-gray-100 text-gray-800'
                                            }
                                            variant="outline"
                                        >
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">No recent activity.</div>
                )}
            </CardContent>
        </Card>

        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for your day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RegisterPatientModal />
                
                <Link href="/appointments">
                    <Button variant="outline" className="w-full justify-start mb-2">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Schedule Appointment
                    </Button>
                </Link>
                <Link href="/dashboard/analytics">
                    <Button variant="outline" className="w-full justify-start">
                        <Activity className="mr-2 h-4 w-4" />
                        View AI Analytics
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

