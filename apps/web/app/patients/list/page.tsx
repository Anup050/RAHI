"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MoreHorizontal, FileText, Activity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RegisterPatientModal } from "@/components/dashboard/RegisterPatientModal"
import { usePatients } from "@/hooks/usePatients"

export default function PatientsListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: patients, isLoading } = usePatients();

  // Safe filter even if undefined
  const safePatients = patients || [];

  const filteredPatients = safePatients.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  )

  const getInitials = (name: string) => name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
            <p className="text-muted-foreground">Manage patient records and clinical history.</p>
        </div>
        <div className="flex gap-2">
            <RegisterPatientModal />
        </div>
      </div>

      <div className="flex items-center gap-2 bg-background p-1 rounded-md border w-full md:w-[400px]">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
            placeholder="Search by name or phone..." 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md bg-white">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> Loading patients...
                            </div>
                        </TableCell>
                    </TableRow>
                ) : filteredPatients.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No patients found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredPatients.map((patient: any) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                            <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.name}`} />
                                    <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium hover:text-primary transition-colors">{patient.name}</div>
                                    <div className="text-xs text-muted-foreground">{patient.gender}, {patient.age}y • {patient.condition}</div>
                                </div>
                            </Link>
                        </TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{patient.lastVisit}</TableCell>
                        <TableCell>
                            <Badge 
                                variant="outline" 
                                className={
                                    patient.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                    patient.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                    patient.status === 'Recovered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                }
                            >
                                {patient.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href={`/patients/${patient.id}`} className="flex w-full">
                                            <FileText className="mr-2 h-4 w-4" /> View Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Activity className="mr-2 h-4 w-4" /> View Vitals
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )))}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}
