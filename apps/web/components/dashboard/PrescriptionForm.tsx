"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, Plus, FileSignature } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const medicineSchema = z.object({
  name: z.string().min(2, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
})

type MedicineFormValues = z.infer<typeof medicineSchema>

// Mock medicines list for autocomplete (simplified as Select for now)
const COMMON_MEDICINES = [
  "Paracetamol",
  "Amoxicillin",
  "Ibuprofen",
  "Cetirizine",
  "Metformin",
  "Aspirin",
  "Azithromycin",
  "Pantoprazole"
]

export function PrescriptionForm() {
  const [medicines, setMedicines] = useState<MedicineFormValues[]>([])
  
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      dosage: "500mg",
      frequency: "1-0-1",
      duration: "5 days",
    },
  })

  const onAddMedicine = (data: MedicineFormValues) => {
    setMedicines([...medicines, data])
    form.reset({
      name: "",
      dosage: "500mg", 
      frequency: "1-0-1",
      duration: "5 days",
    })
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const onSignAndSend = () => {
    console.log("Prescription sent:", medicines)
    alert("Prescription Signed & Sent Successfully!")
    setMedicines([])
  }

  return (
    <Card className="h-full border-l-4 border-l-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Prescription Writer
        </CardTitle>
        <CardDescription>Add medicines and sign the digital prescription.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medicine Entry Form */}
        <form onSubmit={form.handleSubmit(onAddMedicine)} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/30 p-4 rounded-lg">
          <div className="md:col-span-4 space-y-2">
            <Label htmlFor="name">Medicine Name</Label>
             <Select onValueChange={(value) => form.setValue("name", value)} defaultValue={form.getValues("name")}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Medicine" />
                </SelectTrigger>
                <SelectContent>
                    {COMMON_MEDICINES.map((med) => (
                        <SelectItem key={med} value={med}>{med}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input id="dosage" {...form.register("dosage")} placeholder="e.g. 500mg" />
          </div>

           <div className="md:col-span-3 space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select onValueChange={(value) => form.setValue("frequency", value)} defaultValue={form.getValues("frequency")}>
                <SelectTrigger>
                    <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1-0-1">1-0-1 (Morning-Night)</SelectItem>
                    <SelectItem value="1-0-0">1-0-0 (Morning)</SelectItem>
                    <SelectItem value="0-0-1">0-0-1 (Night)</SelectItem>
                    <SelectItem value="1-1-1">1-1-1 (Three times)</SelectItem>
                </SelectContent>
             </Select>
          </div>
          
           <div className="md:col-span-2 space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input id="duration" {...form.register("duration")} placeholder="e.g. 5 days" />
          </div>

          <div className="md:col-span-1">
            <Button type="submit" size="icon" className="w-full" variant="secondary">
                <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Medicines List Table */}
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {medicines.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                No medicines added yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        medicines.map((med, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{med.name}</TableCell>
                                <TableCell>{med.dosage}</TableCell>
                                <TableCell>{med.frequency}</TableCell>
                                <TableCell>{med.duration}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeMedicine(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

        <div className="flex justify-end pt-4">
             <Button 
                size="lg" 
                onClick={onSignAndSend} 
                disabled={medicines.length === 0}
                className="gap-2"
            >
                <FileSignature className="h-4 w-4" />
                Sign & Send Prescription
             </Button>
        </div>
      </CardContent>
    </Card>
  )
}
