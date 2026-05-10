"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Video, CheckCircle, XCircle, MoreVertical, Plus, MapPin, Stethoscope, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { VideoCallDialog } from "@/components/appointments/VideoCallDialog"
import api from "@/lib/api"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  
  // Video Call State
  const [videoCallOpen, setVideoCallOpen] = useState(false)
  const [activeAppointmentId, setActiveAppointmentId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Consultation Mode Picker State
  const [modePickerOpen, setModePickerOpen] = useState(false)
  const [modePickerAppointment, setModePickerAppointment] = useState<any>(null)
  
  // New Appointment Form State
  const [newPatientName, setNewPatientName] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newType, setNewType] = useState("Video Consult")
  const [newReason, setNewReason] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")

  const fetchDoctors = async () => {
      try {
          const res = await api.get('/users/doctors')
          const data = res.data
          setDoctors(data)
          // Set default selected doctor if not set
          if (data.length > 0 && !selectedDoctorId) {
              setSelectedDoctorId(data[0].id.toString());
          }
      } catch (error) {
          console.error("Failed to fetch doctors", error)
      }
  }

  const fetchAppointments = async () => {
       setIsLoading(true)
       try {
           const res = await api.get('/appointments')
           setAppointments(res.data)
        } catch (error: any) {
           console.error("Failed to fetch appointments", error)
           if (error.response?.status !== 401 && error.response?.status !== 403) {
               alert(`Failed to fetch appointments: ${error.message || "Unknown error"}`)
           }
       } finally {
           setIsLoading(false)
       }
  }

  useEffect(() => {
      fetchAppointments()
      fetchDoctors()
  }, [])

  const handleCreateAppointment = async () => {
      try {
           const res = await api.post('/appointments', {
               patient_name: newPatientName,
               doctor_id: selectedDoctorId ? parseInt(selectedDoctorId) : null,
               time: `${newDate} ${newTime}`,
               type: newType,
               reason: newReason
           })
          
           setModalOpen(false)
           fetchAppointments()
           // Reset form
           setNewPatientName("")
           setNewDate("")
           setNewTime("")
           setNewReason("")
      } catch (error: any) {
          console.error(error)
          alert(error.response?.data?.detail?.message || "Failed to create appointment")
      }
  }

  const handleStatusChange = async (id: number, newStatus: string, reason?: string) => {
    try {
        await api.patch(`/appointments/${id}`, { 
            status: newStatus,
            reason: reason || "" 
        })
        fetchAppointments() // Reload to get fresh state
    } catch (error: any) {
        console.error("Failed to update status", error)
        if (error.response?.status !== 401 && error.response?.status !== 403) {
            alert("Failed to update status. Please try again.")
        }
        fetchAppointments() // Revert UI
    }
  }

  // Start consultation: if In-Person, show mode picker; if Video, go straight to call
  const handleStartConsultation = (apt: any) => {
    if (apt.type === "In-Person Visit" || apt.type === "In-Person") {
      setModePickerAppointment(apt)
      setModePickerOpen(true)
    } else {
      // Video Consult: launch video call directly
      handleStatusChange(apt.id, "In Progress")
      setActiveAppointmentId(apt.id)
      setVideoCallOpen(true)
    }
  }

  // Mode picker: doctor chose Video for an in-person patient
  const handleModeChosen = (mode: string) => {
    if (!modePickerAppointment) return
    const apt = modePickerAppointment
    setModePickerOpen(false)
    setModePickerAppointment(null)

    handleStatusChange(apt.id, "In Progress")

    if (mode === "video") {
      setActiveAppointmentId(apt.id)
      setVideoCallOpen(true)
    }
    // If "in-person", just mark In Progress — no video dialog opens.
    // The doctor will use "Mark Done" when finished.
  }

  // Called by VideoCallDialog when doctor explicitly ends the consultation
  const handleEndConsultation = () => {
    if (activeAppointmentId) {
      handleStatusChange(activeAppointmentId, "Completed")
    }
  }

  return (
    <div className="space-y-6 container mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
                <a href="/dashboard">&larr; Back to Dashboard</a>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4"/> New Appointment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Appointment</DialogTitle>
                    <DialogDescription>
                        Create a new appointment for a patient.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Patient
                        </Label>
                        <Input id="name" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} className="col-span-3" placeholder="Patient Name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input id="date" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                            Time
                        </Label>
                        <Input id="time" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                         <Select value={newType} onValueChange={setNewType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Video Consult">Video Consult</SelectItem>
                                <SelectItem value="In-Person">In-Person</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doctor" className="text-right">
                            Doctor
                        </Label>
                        <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map(doc => (
                                    <SelectItem key={doc.id} value={doc.id.toString()}>
                                        Dr. {doc.full_name} ({doc.specialization})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            Reason
                        </Label>
                        <Input id="reason" value={newReason} onChange={e => setNewReason(e.target.value)} className="col-span-3" placeholder="Reason for visit" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreateAppointment}>Create Appointment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Kanban</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Manage your daily schedule.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    <span className="text-xs text-muted-foreground mt-2 block">Loading appointments...</span>
                                </TableCell>
                            </TableRow>
                        ) : appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No appointments found for your account.
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((apt) => (
                                <TableRow key={apt.id}>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        <Clock className="w-4 h-4 text-muted-foreground"/> {apt.time}
                                    </TableCell>
                                    <TableCell>{apt.patient || apt.patient_name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {apt.type === "Video Consult" ? (
                                                <Video className="w-3.5 h-3.5 text-blue-500" />
                                            ) : (
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                            )}
                                            <span>{apt.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                         <Badge 
                                            variant={
                                                apt.status === 'Completed' ? 'success' : 
                                                apt.status === 'Pending' ? 'warning' : 
                                                apt.status === 'In Progress' ? 'default' : 'secondary'
                                            }
                                        >
                                            {apt.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {apt.status === "Pending" && (
                                                <>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange(apt.id, "Confirmed")}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Decline Appointment?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will notify the patient that their appointment request has been declined.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    className="bg-red-600 hover:bg-red-700" 
                                                                    onClick={() => {
                                                                        const r = prompt("Please provide a reason for declining:")
                                                                        if (r !== null) handleStatusChange(apt.id, "Declined", r)
                                                                    }}
                                                                >
                                                                    Decline
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}
                                            {apt.status === "Confirmed" && (
                                                 <Button size="sm" variant="default" className="gap-2" onClick={() => handleStartConsultation(apt)}>
                                                    <Stethoscope className="h-3 w-3" /> Start Consultation
                                                 </Button>
                                            )}
                                            {apt.status === "In Progress" && (
                                                <div className="flex items-center gap-2">
                                                    {(apt.type === "Video Consult") && (
                                                        <Button size="sm" variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => {
                                                            setActiveAppointmentId(apt.id)
                                                            setVideoCallOpen(true)
                                                        }}>
                                                            <Video className="h-3 w-3" /> Rejoin Call
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, "Completed")}>
                                                        Mark Done
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kanban Board View */}
        <TabsContent value="board" className="mt-4">
             <div className="grid md:grid-cols-3 gap-4">
                {/* Pending Column */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded inline-block">Pending</h3>
                    {appointments.filter(a => ['Pending', 'pending', 'scheduled'].includes(a.status)).map(apt => (
                        <Card key={apt.id}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{apt.patient || apt.patient_name}</CardTitle>
                                    <Badge variant="outline">{apt.time}</Badge>
                                </div>
                                <CardDescription>{apt.reason}</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-2 flex justify-end gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                                    onClick={() => {
                                        const r = prompt("Please provide a reason for declining:")
                                        if (r !== null) handleStatusChange(apt.id, "Declined", r)
                                    }}
                                >
                                    Decline
                                </Button>
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(apt.id, "Confirmed")}>Accept</Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {appointments.filter(a => ['Pending', 'pending', 'scheduled'].includes(a.status)).length === 0 && (
                        <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                            No pending requests
                        </div>
                    )}
                </div>

                 {/* Confirmed Column */}
                 <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded inline-block">Confirmed</h3>
                     {appointments.filter(a => ['Confirmed', 'confirmed'].includes(a.status)).map(apt => (
                        <Card key={apt.id} className="border-l-4 border-l-blue-500">
                             <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{apt.patient || apt.patient_name}</CardTitle>
                                    <Badge variant="outline">{apt.time}</Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                    {apt.type === "Video Consult" ? (
                                        <Video className="w-3 h-3 text-blue-500" />
                                    ) : (
                                        <MapPin className="w-3 h-3 text-emerald-500" />
                                    )}
                                    {apt.reason} • {apt.type}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-2 flex justify-end">
                                <Button size="sm" className="h-8 gap-2" onClick={() => handleStartConsultation(apt)}>
                                    <Stethoscope className="w-3 h-3" /> Start Consultation
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* In Progress / Completed */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-green-600 bg-green-50 px-3 py-1 rounded inline-block">Completed / In Progress</h3>
                     {appointments.filter(apt => ['In Progress', 'in progress', 'Completed', 'completed'].some(s => apt.status?.toLowerCase() === s.toLowerCase())).map(apt => (
                        <Card key={apt.id} className={apt.status === 'In Progress' ? 'border-green-500 shadow-md ring-1 ring-green-500' : 'opacity-70'}>
                             <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{apt.patient || apt.patient_name}</CardTitle>
                                    <Badge variant={apt.status === 'In Progress' ? 'default' : 'secondary'}>{apt.status}</Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                    {apt.type === "Video Consult" ? (
                                        <Video className="w-3 h-3 text-blue-500" />
                                    ) : (
                                        <MapPin className="w-3 h-3 text-emerald-500" />
                                    )}
                                    {apt.type}
                                </CardDescription>
                            </CardHeader>
                            {apt.status === 'In Progress' && (
                                <CardFooter className="p-4 pt-2 flex justify-end gap-2">
                                    {(apt.type === "Video Consult") && (
                                        <Button size="sm" variant="default" className="h-8 gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => {
                                            setActiveAppointmentId(apt.id)
                                            setVideoCallOpen(true)
                                        }}>
                                            <Video className="w-3 h-3" /> Rejoin Call
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, "Completed")}>
                                        Mark Done
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
             </div>
        </TabsContent>
      </Tabs>

      {/* Consultation Mode Picker Dialog — shown for In-Person appointments */}
      <Dialog open={modePickerOpen} onOpenChange={(open) => {
        if (!open) {
          setModePickerOpen(false)
          setModePickerAppointment(null)
        }
      }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Choose Consultation Mode</DialogTitle>
            <DialogDescription>
              This patient booked an <strong>In-Person</strong> appointment. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <button 
              onClick={() => handleModeChosen("in-person")}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <MapPin className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="font-semibold text-sm text-slate-700">In-Person</span>
              <span className="text-xs text-slate-400 text-center">Patient is physically present</span>
            </button>
            <button 
              onClick={() => handleModeChosen("video")}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Video className="w-7 h-7 text-blue-600" />
              </div>
              <span className="font-semibold text-sm text-slate-700">Video Call</span>
              <span className="text-xs text-slate-400 text-center">Switch to video consultation</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      <VideoCallDialog 
        isOpen={videoCallOpen} 
        appointmentId={activeAppointmentId} 
        onClose={() => setVideoCallOpen(false)}
        onEndConsultation={handleEndConsultation}
      />
    </div>
  )
}
