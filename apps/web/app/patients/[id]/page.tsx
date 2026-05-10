"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { AlertTriangle, Clock, Activity, FileText, Loader2 } from "lucide-react"
import { PrescriptionForm } from "@/components/dashboard/PrescriptionForm"

export default function PatientPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient()
  const [noteContent, setNoteContent] = useState('')
  const [activeTab, setActiveTab] = useState("consultation")
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${params.id}`);
      return data;
    },
    enabled: !!params.id && params.id !== "list",
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['patientHistory', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/prescriptions/history/${params.id}`);
      return data;
    },
    enabled: !!params.id && params.id !== "list",
  });

  const { data: notes, isLoading: isNotesLoading } = useQuery({
    queryKey: ['patientNotes', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/notes/${params.id}`);
      return data;
    },
    enabled: !!params.id && params.id !== "list",
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/notes/${params.id}`, { content, tags: [] });
    },
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['patientNotes', params.id] });
    }
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
                    {patient.gender && <Badge variant="outline">{patient.gender}</Badge>}
                    {patient.phone_number && <Badge variant="outline">{patient.phone_number}</Badge>}
                </div>
            </div>
         </div>
         <div className="flex gap-3">
             <Button variant="outline" onClick={() => setActiveTab("history")}>View Full History</Button>
             <Dialog>
                 <DialogTrigger asChild>
                     <Button variant="destructive">Emergency Protocol</Button>
                 </DialogTrigger>
                 <DialogContent>
                     <DialogHeader>
                         <DialogTitle>Initiate Emergency Protocol</DialogTitle>
                         <DialogDescription>
                             Are you sure you want to initiate the emergency protocol for {patient.full_name || patient.email}? This will alert the response team.
                         </DialogDescription>
                     </DialogHeader>
                     <div className="flex justify-end gap-2 mt-4">
                         <DialogClose asChild>
                             <Button variant="outline">Cancel</Button>
                         </DialogClose>
                         <DialogClose asChild>
                             <Button variant="destructive" onClick={() => alert("Emergency Protocol Initiated!")}>Confirm Emergency</Button>
                         </DialogClose>
                     </div>
                 </DialogContent>
             </Dialog>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Triage & Vitals */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* AI Triage Card */}
            <Card className={`border-l-4 ${notes?.[0]?.tags?.includes("EMERGENCY") ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'}`}>
                <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${notes?.[0]?.tags?.includes("EMERGENCY") ? 'text-red-700 dark:text-red-500' : 'text-blue-700 dark:text-blue-500'}`}>
                        <AlertTriangle className="h-5 w-5" />
                        AI Triage Insight
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notes && notes.length > 0 ? (
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground">Latest Observation</span>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {notes[0].tags?.map((t: string) => <Badge key={t} variant={t === 'EMERGENCY' ? 'destructive' : 'secondary'} className="text-[10px]">{t}</Badge>)}
                                </div>
                             </div>
                             <p className="text-sm text-muted-foreground line-clamp-3">
                                {notes[0].content}
                             </p>
                             <p className="text-xs text-muted-foreground mt-2">
                                Logged on {new Date(notes[0].created_at + 'Z').toLocaleString()}
                             </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground">Symptom Check</span>
                                <Badge variant="warning">Awaiting Input</Badge>
                             </div>
                             <p className="text-sm text-muted-foreground">
                                Patient clinical history will appear here once symptoms are logged via the mobile app.
                             </p>
                        </div>
                    )}
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

        <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consultation">Consultation & Rx</TabsTrigger>
                    <TabsTrigger value="history">Medical History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="consultation" className="space-y-6 mt-4">
                    {/* Clinical Notes */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center justify-between text-sm uppercase tracking-wider text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Clinical Notes
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Past Notes */}
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {isNotesLoading ? (
                                    <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                                ) : notes?.length > 0 ? (
                                    notes.map((note: any) => (
                                        <div key={note.id} className="p-3 bg-muted/30 rounded-md border text-sm">
                                            <div className="text-muted-foreground mb-1 text-xs">
                                                {new Date(note.created_at + 'Z').toLocaleString()}
                                            </div>
                                            <div className="whitespace-pre-wrap">{note.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-md">No previous notes.</div>
                                )}
                            </div>
                            
                            {/* Add New Note */}
                            <div className="pt-2 border-t space-y-2">
                                <Textarea 
                                    placeholder="Enter new clinical observations, symptoms, and examination notes here..." 
                                    className="min-h-[100px] resize-none"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button 
                                        size="sm" 
                                        disabled={!noteContent.trim() || saveNoteMutation.isPending}
                                        onClick={() => saveNoteMutation.mutate(noteContent)}
                                    >
                                        {saveNoteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Note
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescription Writer */}
                    <PrescriptionForm patientId={parseInt(params.id)} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Previous Visits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isHistoryLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : history && history.length > 0 ? (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {history.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-1 p-3 border rounded-md bg-muted/20">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-primary">{item.medicine}</span>
                                                <Badge variant="outline">{new Date(item.taken_at + 'Z').toLocaleDateString()}</Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">Taken on {new Date(item.taken_at + 'Z').toLocaleTimeString()} ({item.time_of_day})</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-muted-foreground">
                                    <Clock className="mr-2 h-4 w-4" />
                                    No medical adherence history available for this patient.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  )
}
