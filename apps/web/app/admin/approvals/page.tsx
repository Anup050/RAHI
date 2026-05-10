"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Users, Loader2, ChevronLeft, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function ApprovalsPage() {
    const { user } = useAuth()
    const [pendingDoctors, setPendingDoctors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState<number | null>(null)
    const [rejectingDoctor, setRejectingDoctor] = useState<any | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")

    const fetchPending = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/admin/pending-doctors', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) setPendingDoctors(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchPending()
        }
    }, [user])

    const handleApprove = async (doctorId: number) => {
        setIsActionLoading(doctorId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/admin/approve-doctor/${doctorId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setPendingDoctors(prev => prev.filter(d => d.id !== doctorId))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsActionLoading(null)
        }
    }

    const handleReject = async () => {
        if (!rejectingDoctor || !rejectionReason) return
        
        setIsActionLoading(rejectingDoctor.id)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/admin/reject-doctor/${rejectingDoctor.id}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            })
            if (res.ok) {
                setPendingDoctors(prev => prev.filter(d => d.id !== rejectingDoctor.id))
                setRejectingDoctor(null)
                setRejectionReason("")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsActionLoading(null)
        }
    }

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center">Access Denied</div>
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Overview
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Approvals</h1>
                    <p className="text-muted-foreground">Manage and verify healthcare practitioners.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Registration Requests</CardTitle>
                    <CardDescription>Review credentials and approve accounts for platform access.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : pendingDoctors.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doctor Details</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Hospital</TableHead>
                                    <TableHead>Verification Docs</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingDoctors.map((doc: any) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="font-bold">{doc.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{doc.email}</div>
                                            <div className="text-xs text-muted-foreground">{doc.phone_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                {doc.specialization || "General"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{doc.experience_years || 0} years</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{doc.hospital_name || "N/A"}</div>
                                            <div className="text-[10px] text-muted-foreground max-w-[150px] truncate">{doc.hospital_address}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {doc.govt_id_url ? (
                                                    <a href={doc.govt_id_url.startsWith('http') ? doc.govt_id_url.replace(/http:\/\/localhost:8000/, '') : doc.govt_id_url} target="_blank" className="text-xs text-primary underline flex items-center">
                                                        <FileText className="h-3 w-3 mr-1" /> Govt ID
                                                    </a>
                                                ) : <span className="text-xs text-red-500 italic">No Govt ID</span>}
                                                {doc.clinic_id_url ? (
                                                    <a href={doc.clinic_id_url.startsWith('http') ? doc.clinic_id_url.replace(/http:\/\/localhost:8000/, '') : doc.clinic_id_url} target="_blank" className="text-xs text-primary underline flex items-center">
                                                        <FileText className="h-3 w-3 mr-1" /> Clinic ID
                                                    </a>
                                                ) : <span className="text-xs text-red-500 italic">No Clinic ID</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleApprove(doc.id)}
                                                    disabled={isActionLoading === doc.id}
                                                >
                                                    {isActionLoading === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                                    Approve
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => setRejectingDoctor(doc)}
                                                    disabled={isActionLoading === doc.id}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed rounded-xl">
                            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">Queue is Clear</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">No pending doctor registrations at this time. Check back later.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!rejectingDoctor} onOpenChange={(open) => !open && setRejectingDoctor(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting Dr. {rejectingDoctor?.full_name}'s application. This will be sent to them via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea 
                            placeholder="e.g. Documentation is unclear or missing specialization certificate..." 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectingDoctor(null)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleReject}
                            disabled={!rejectionReason || isActionLoading === rejectingDoctor?.id}
                        >
                            {isActionLoading === rejectingDoctor?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
