"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Server, AlertCircle, Trash2, Edit2 } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
                <p className="text-muted-foreground">Manage clinics, staff, and system health.</p>
            </div>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Registered Personnel
                    </CardTitle>
                    <CardDescription>Manage doctors, nurses, and clinic administrators.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Clinic</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Dr. Rajesh Verma</TableCell>
                                <TableCell>Doctor</TableCell>
                                <TableCell>City Clinic, Jalandhar</TableCell>
                                <TableCell><Badge variant="success">Active</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Nurse Priya</TableCell>
                                <TableCell>Nurse</TableCell>
                                <TableCell>Rural Health Outpost 1</TableCell>
                                <TableCell><Badge variant="success">Active</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Admin User</TableCell>
                                <TableCell>Administrator</TableCell>
                                <TableCell>HQ</TableCell>
                                <TableCell><Badge variant="outline">Offline</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
             <Card className="bg-slate-950 text-slate-50 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Server Logs
                    </CardTitle>
                    <CardDescription className="text-slate-400">Real-time system events and errors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="font-mono text-sm space-y-2 h-[300px] overflow-y-auto">
                        <div className="flex gap-2">
                            <span className="text-slate-500">[20:42:01]</span>
                            <span className="text-blue-400">INFO</span>
                            <span>System startup complete. v1.0.2</span>
                        </div>
                         <div className="flex gap-2">
                            <span className="text-slate-500">[20:42:05]</span>
                            <span className="text-green-400">CONNECT</span>
                            <span>DB connection established pool=5</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500">[20:44:12]</span>
                            <span className="text-blue-400">API</span>
                            <span>POST /api/auth/login 200 OK 45ms</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500">[20:45:00]</span>
                            <span className="text-yellow-400">WARN</span>
                            <span>High memory usage on Worker-2 (85%)</span>
                        </div>
                         <div className="flex gap-2">
                            <span className="text-slate-500">[20:48:33]</span>
                            <span className="text-red-400">ERROR</span>
                            <span>Failed to sync with Twilio SMS Gateway: Connection timeout</span>
                        </div>
                         <div className="flex gap-2">
                            <span className="text-slate-500">[21:00:00]</span>
                            <span className="text-blue-400">JOB</span>
                            <span>Scheduled task "ReminderCron" executed successfully.</span>
                        </div>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
