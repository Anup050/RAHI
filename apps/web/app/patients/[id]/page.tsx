"use client"

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Clock, Activity, FileText, Loader2 } from "lucide-react"
import { PrescriptionForm } from "@/components/dashboard/PrescriptionForm"

export default function PatientPage({ params }: { params: { id: string } }) {
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${params.id}`);
      return data;
    },
    enabled: !!params.id && params.id !== "list",
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading patient profile...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Patient profile not found or access denied.
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-lg border shadow-sm">
         <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-muted">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.full_name}`} />
                <AvatarFallback>{getInitials(patient.full_name || "PN")}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{patient.full_name || patient.email}</h1>
                <div className="flex gap-2 mt-2 text-muted-foreground">
                    <Badge variant="outline">{patient.role}</Badge>
                    {patient.age && <Badge variant="outline">{patient.age} years</Badge>}
                    {patient.phone_number && <Badge variant="outline">{patient.phone_number}</Badge>}
                </div>
            </div>
         </div>
         <div className="flex gap-3">
             <Button variant="outline">View Full History</Button>
             <Button variant="destructive">Emergency Protocol</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Triage & Vitals */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* AI Triage Card */}
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                        <AlertTriangle className="h-5 w-5" />
                        AI Triage Insight
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Symptom Check</span>
                            <Badge variant="warning">Awaiting Input</Badge>
                         </div>
                         <p className="text-sm text-muted-foreground">
                            Patient clinical history will appear here once symptoms are logged via the mobile app.
                         </p>
                    </div>
                </CardContent>
            </Card>

            {/* Vitals Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Vitals
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Blood Pressure</p>
                            <p className="font-bold text-lg">--</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Heart Rate</p>
                            <p className="font-bold text-lg">--</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Temp</p>
                            <p className="font-bold text-lg">--</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">SpO2</p>
                            <p className="font-bold text-lg">--</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Clinical Interaction */}
        <div className="lg:col-span-2">
            <Tabs defaultValue="consultation" className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consultation">Consultation & Rx</TabsTrigger>
                    <TabsTrigger value="history">Medical History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="consultation" className="space-y-6 mt-4">
                    {/* Clinical Notes */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                Clinical Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea 
                                placeholder="Enter your clinical observations, symptoms, and examination notes here..." 
                                className="min-h-[150px] resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Prescription Writer */}
                    <PrescriptionForm />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Previous Visits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-48 text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                No history available for this patient.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  )
}
