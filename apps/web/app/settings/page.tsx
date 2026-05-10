"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Lock, User, Save, Building2, MapPin, Briefcase, ShieldCheck } from "lucide-react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

export default function SettingsPage() {
  const { user } = useAuth()
  
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Profile State
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [hospitalName, setHospitalName] = useState("")
  const [hospitalAddress, setHospitalAddress] = useState("")
  const [profileSummary, setProfileSummary] = useState("")
  const [availableTime, setAvailableTime] = useState("")

  // Notification State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Password State
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Admin Settings State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true)

  useEffect(() => {
    if (user) {
        setFullName(user.full_name || "")
        setEmail(user.email || "")
        setPhoneNumber(user.phone_number || "")
        setSpecialization(user.specialization || "")
        setExperienceYears(user.experience_years?.toString() || "")
        setHospitalName(user.hospital_name || "")
        setHospitalAddress(user.hospital_address || "")
        setProfileSummary(user.profile_summary || "")
        setAvailableTime(user.available_time || "")
        setNotificationsEnabled(user.notifications_enabled ?? true)
    }
  }, [user])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:8000/api/v1/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                full_name: fullName,
                phone_number: phoneNumber,
                specialization: specialization,
                experience_years: experienceYears ? parseInt(experienceYears) : null,
                hospital_name: hospitalName,
                hospital_address: hospitalAddress,
                profile_summary: profileSummary,
                available_time: availableTime,
                notifications_enabled: notificationsEnabled
            })
        })
        
        if (res.ok) {
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 3000)
        }
    } catch (e) {
        console.error(e)
    } finally {
        setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
      if (newPassword !== confirmPassword) {
          alert("Passwords do not match")
          return
      }
      
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:8000/api/v1/users/me/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                password_in: newPassword
            })
        })
        
        if (res.ok) {
             alert("Password updated successfully")
             setNewPassword("")
             setConfirmPassword("")
        } else {
            alert("Failed to update password")
        }
    } catch (e) {
        console.error(e)
        alert("Error updating password")
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your {user?.role === 'admin' ? 'administrative' : 'professional'} profile and account preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background">
                <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            {user?.role === 'admin' && (
                <TabsTrigger value="system" className="data-[state=active]:bg-background">
                    <ShieldCheck className="mr-2 h-4 w-4" /> System
                </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
                <Bell className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-background">
                <Lock className="mr-2 h-4 w-4" /> Security
            </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{user?.role === 'admin' ? 'Administrator Profile' : 'Professional Profile'}</CardTitle>
                    <CardDescription>
                        {user?.role === 'admin' 
                            ? 'Update your administrative contact information.' 
                            : 'This information will be visible to patients seeking consultations.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={user?.role === 'admin' ? "Admin Name" : "Dr. John Doe"} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91 98765 43210" />
                        </div>
                    </div>

                    {user?.role !== 'admin' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="specialization" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> Specialization
                                    </Label>
                                    <Input id="specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Skin Specialist, Cardiologist" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exp">Years of Experience</Label>
                                    <Input id="exp" type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="e.g. 10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="h-name" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Hospital / Clinic Name
                                </Label>
                                <Input id="h-name" value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="City Hospital" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="h-addr" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Hospital Address
                                </Label>
                                <Input id="h-addr" value={hospitalAddress} onChange={e => setHospitalAddress(e.target.value)} placeholder="123 Health St, Medical District" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Profile Summary / Bio</Label>
                                <Textarea 
                                    id="bio" 
                                    value={profileSummary} 
                                    onChange={e => setProfileSummary(e.target.value)} 
                                    placeholder="Briefly describe your expertise and background..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="time">Available Consultation Time</Label>
                                <Input id="time" value={availableTime} onChange={e => setAvailableTime(e.target.value)} placeholder="e.g. 10:00 AM - 4:00 PM (Mon-Fri)" />
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end border-t p-6">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="min-w-[150px]">
                        {isSaving ? (
                            <>Saving...</> 
                        ) : isSaved ? (
                            <>Saved Successfully</>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save {user?.role === 'admin' ? 'Admin Profile' : 'Doctor Profile'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* System Tab (Admin Only) */}
        {user?.role === 'admin' && (
            <TabsContent value="system">
                <Card>
                    <CardHeader>
                        <CardTitle>Global System Settings</CardTitle>
                        <CardDescription>Configure platform-wide behavior and administrative rules.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/30">
                            <Label htmlFor="reg-toggle" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="font-semibold">New Doctor Registrations</span>
                                <span className="font-normal text-sm text-muted-foreground">Allow or block new medical practitioners from creating accounts.</span>
                            </Label>
                            <Switch 
                                id="reg-toggle" 
                                checked={isRegistrationOpen} 
                                onCheckedChange={setIsRegistrationOpen} 
                            />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                            <Label className="flex flex-col space-y-1">
                                <span className="font-semibold">Strict Approval Mode</span>
                                <span className="font-normal text-sm text-muted-foreground">Require manual ID verification for all new doctors (Enabled by Default).</span>
                            </Label>
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Active</div>
                        </div>

                        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                            <h4 className="font-bold text-yellow-800 mb-1">Administrative Note</h4>
                            <p className="text-sm text-yellow-700">Changing these settings will affect all users immediately across the RAHI platform.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t p-6">
                        <Button onClick={() => alert("System settings updated")}>Update Platform Config</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        )}

        {/* Notifications Tab */}
        <TabsContent value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Control how you want to be notified about appointments and updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                        <Label htmlFor="email-notifs" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-semibold">Email Notifications</span>
                            <span className="font-normal text-sm text-muted-foreground">Receive email alerts for new appointments and emergency calls.</span>
                        </Label>
                        <Switch 
                            id="email-notifs" 
                            checked={notificationsEnabled} 
                            onCheckedChange={setNotificationsEnabled} 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                        <Label htmlFor="sms-notifs" className="flex flex-col space-y-1">
                            <span>SMS Alerts (Coming Soon)</span>
                            <span className="font-normal text-sm text-muted-foreground">Get instant SMS for emergency appointments.</span>
                        </Label>
                        <Switch id="sms-notifs" disabled />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-6">
                    <Button onClick={handleSaveProfile}>Save Preferences</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
             <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Ensure your account stays secure by using a strong password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                     <div className="space-y-2">
                        <Label htmlFor="new-pass">New Password</Label>
                        <Input id="new-pass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-pass">Confirm Password</Label>
                        <Input id="confirm-pass" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-6">
                    <Button variant="destructive" onClick={handleUpdatePassword}>Update Password</Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
