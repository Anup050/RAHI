"use client"

import { PrescriptionForm } from "@/components/dashboard/PrescriptionForm"

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
      </div>
      <div className="h-[calc(100vh-200px)]">
         <PrescriptionForm />
      </div>
    </div>
  )
}
