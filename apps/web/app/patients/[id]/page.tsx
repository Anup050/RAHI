"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Clock, Activity, FileText } from "lucide-react"
import { PrescriptionForm } from "@/components/dashboard/PrescriptionForm"

// Mock Data Dictionary
const PATIENTS_DB: Record<string, any> = {
  "1": {
    id: "1",
    name: "Rohan Das",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    lastVisit: "2023-10-15",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    condition: "Viral Fever",
    vitals: { bp: "120/80", hr: "72 bpm", temp: "102° F", spo2: "98%" }
  },
  "2": {
    id: "2",
    name: "Anjali Sharma",
    age: 32,
    gender: "Female",
    bloodType: "A+",
    lastVisit: "2023-10-12",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    condition: "Pregnancy Checkup",
    vitals: { bp: "110/70", hr: "80 bpm", temp: "98.6° F", spo2: "99%" }
  },
  "3": {
    id: "3",
    name: "Vikram Singh",
    age: 58,
    gender: "Male",
    bloodType: "B+",
    lastVisit: "2023-09-28",
    img: "https://randomuser.me/api/portraits/men/85.jpg",
    condition: "Cardiac Arrhythmia",
    vitals: { bp: "140/90", hr: "65 bpm", temp: "98° F", spo2: "96%" }
  },
   "4": {
    id: "4",
    name: "Priya Patel",
    age: 24,
    gender: "Female",
    bloodType: "O-",
    lastVisit: "2023-10-14",
    img: "https://randomuser.me/api/portraits/women/62.jpg",
    condition: "Vaccination",
    vitals: { bp: "118/75", hr: "75 bpm", temp: "98.4° F", spo2: "99%" }
  }
};

export default function PatientPage({ params }: { params: { id: string } }) {
  // Fallback to Rohan (id 1) if not found or if id is "list" (handling edge case)
  const patient = PATIENTS_DB[params.id] || PATIENTS_DB["1"];
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-lg border shadow-sm">
         <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-muted">
                <AvatarImage src={patient.img} />
                <AvatarFallback>RD</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
                <div className="flex gap-2 mt-2 text-muted-foreground">
                    <Badge variant="outline">{patient.gender}</Badge>
                    <Badge variant="outline">{patient.age} years</Badge>
                    <Badge variant="outline">Blood: {patient.bloodType}</Badge>
                </div>
            </div>
         </div>
         <div className="flex gap-3">
             <Button variant="outline">View Full History</Button>
             <Button variant="destructive">Emergency Protocol</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Triage & Clinical Notes */}
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
                            <span className="font-semibold text-foreground">Viral Fever</span>
                            <Badge variant="warning">89% Confidence</Badge>
                         </div>
                         <p className="text-sm text-muted-foreground">
                            Patient reported high temperature (102°F), body ache, and chills for 2 days. Symptoms align with seasonal viral trends.
                         </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-yellow-200 hover:bg-yellow-100 text-yellow-800">
                        Override Diagnosis
                    </Button>
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
                            <p className="font-bold text-lg">{patient.vitals.bp}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Heart Rate</p>
                            <p className="font-bold text-lg">{patient.vitals.hr}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Temp</p>
                            <p className={`font-bold text-lg ${patient.vitals.temp.includes('102') || patient.vitals.temp.includes('103') ? 'text-red-500' : ''}`}>{patient.vitals.temp}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">SpO2</p>
                            <p className="font-bold text-lg">{patient.vitals.spo2}</p>
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
                                No history available (Demo)
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
