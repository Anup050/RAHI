"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Video, CheckCircle, XCircle, MoreVertical, Plus } from "lucide-react"
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  
  // New Appointment Form State
  const [newPatientName, setNewPatientName] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newType, setNewType] = useState("Video Consult")
  const [newReason, setNewReason] = useState("")

  const fetchAppointments = async () => {
       const token = localStorage.getItem('token')
       if (!token) return
       try {
           const res = await fetch('http://localhost:8000/api/v1/appointments/', {
               headers: {
                   'Authorization': `Bearer ${token}`
               }
           })
            if (res.ok) {
                const data = await res.json()
                setAppointments(data)
            } else {
                if (res.status === 401 || res.status === 403) {
                    // Token expired or invalid
                    console.error("Session expired")
                    // Optionally redirect to login
                    // window.location.href = '/login'
                }
            }
        } catch (error) {
           console.error("Failed to fetch appointments", error)
       }
  }

  useEffect(() => {
      fetchAppointments()
  }, [])

  const handleCreateAppointment = async () => {
      const token = localStorage.getItem('token')
      try {
          const res = await fetch('http://localhost:8000/api/v1/appointments/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  patient_name: newPatientName,
                  time: `${newDate} ${newTime}`,
                  type: newType,
                  reason: newReason
              })
          })
          
          if (res.ok) {
              setModalOpen(false)
              fetchAppointments()
              // Reset form
              setNewPatientName("")
              setNewDate("")
              setNewTime("")
              setNewReason("")
          } else {
              alert("Failed to create appointment")
          }
      } catch (error) {
          console.error(error)
      }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:8000/api/v1/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        })
        
        if (res.ok) {
             fetchAppointments() // Reload to get fresh state
        } else {
             if (res.status === 401 || res.status === 403) {
                 alert("Session Expired. Please Logout and Login again.")
             } else {
                 alert("Failed to update status. Please try again.")
             }
             fetchAppointments() // Revert UI
        }
    } catch (error) {
        console.error("Failed to update status", error)
        alert("Network Error: Could not update status.")
    }
  }

  return (
    <div className="space-y-6 container mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
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
                        {appointments.map((apt) => (
                            <TableRow key={apt.id}>
                                <TableCell className="flex items-center gap-2 font-medium">
                                    <Clock className="w-4 h-4 text-muted-foreground"/> {apt.time}
                                </TableCell>
                                <TableCell>{apt.patient || apt.patient_name}</TableCell>
                                <TableCell>{apt.type}</TableCell>
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
                                                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleStatusChange(apt.id, "Declined")}>
                                                                Decline
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                        {apt.status === "Confirmed" && (
                                             <Button size="sm" variant="default" className="gap-2" onClick={() => {
                                                 handleStatusChange(apt.id, "In Progress");
                                                 window.open(`https://meet.jit.si/RAHI-${apt.id}`, '_blank');
                                             }}>
                                                <Video className="h-3 w-3" /> Join Call
                                             </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
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
                    {appointments.filter(a => a.status === 'Pending').map(apt => (
                        <Card key={apt.id}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{apt.patient || apt.patient_name}</CardTitle>
                                    <Badge variant="outline">{apt.time}</Badge>
                                </div>
                                <CardDescription>{apt.reason}</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-2 flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleStatusChange(apt.id, "Declined")}>Decline</Button>
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(apt.id, "Confirmed")}>Accept</Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {appointments.filter(a => a.status === 'Pending').length === 0 && (
                        <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                            No pending requests
                        </div>
                    )}
                </div>

                 {/* Confirmed Column */}
                 <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded inline-block">Confirmed</h3>
                     {appointments.filter(a => a.status === 'Confirmed').map(apt => (
                        <Card key={apt.id} className="border-l-4 border-l-blue-500">
                             <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{apt.patient || apt.patient_name}</CardTitle>
                                    <Badge variant="outline">{apt.time}</Badge>
                                </div>
                                <CardDescription>{apt.reason}</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-2 flex justify-end">
                                <Button size="sm" className="h-8 gap-2" onClick={() => {
                                    handleStatusChange(apt.id, "In Progress");
                                    window.open(`https://meet.jit.si/RAHI-${apt.id}`, '_blank');
                                }}>
                                    <Video className="w-3 h-3" /> Start Consultation
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* In Progress / Completed */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-green-600 bg-green-50 px-3 py-1 rounded inline-block">Completed / In Progress</h3>
                     {appointments.filter(apt => ['In Progress', 'Completed'].includes(apt.status)).map(apt => (
                        <Card key={apt.id} className={apt.status === 'In Progress' ? 'border-green-500 shadow-md ring-1 ring-green-500' : 'opacity-70'}>
                             <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{apt.patient || apt.patient_name}</CardTitle>
                                    <Badge variant={apt.status === 'In Progress' ? 'default' : 'secondary'}>{apt.status}</Badge>
                                </div>
                                <CardDescription>{apt.type}</CardDescription>
                            </CardHeader>
                            {apt.status === 'In Progress' && (
                                <CardFooter className="p-4 pt-2 flex justify-end">
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
    </div>
  )
}
