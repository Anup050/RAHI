"use client"

import { useState } from "react"
import { PrescriptionForm } from "@/components/dashboard/PrescriptionForm"
import { usePatients } from "@/hooks/usePatients"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export default function PrescriptionsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const { data: patients, isLoading } = usePatients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
      </div>
      
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Select Patient</label>
        {isLoading ? (
            <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Loading patients...</div>
        ) : (
            <Select onValueChange={(val) => setSelectedPatientId(parseInt(val))}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Choose a patient to prescribe to..." />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name} {p.phone ? `(${p.phone})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        )}
      </div>

      {selectedPatientId ? (
        <div className="h-[calc(100vh-250px)] mt-4">
          <PrescriptionForm patientId={selectedPatientId} />
        </div>
      ) : (
        <div className="h-[calc(100vh-250px)] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground mt-4">
          Please select a patient to create a prescription.
        </div>
      )}
    </div>
  )
}
