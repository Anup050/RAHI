"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, User, Save } from "lucide-react"

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
  const [specialization, setSpecialization] = useState("General Physician") // Not in User model yet, mocking
  const [bio, setBio] = useState("") // Not in User model yet, mocking

  // Password State
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (user) {
        setFullName(user.full_name || "")
        setEmail(user.email || "")
        setPhoneNumber(user.phone_number || "")
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
                email: email,
                phone_number: phoneNumber
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
            <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
                <Lock className="mr-2 h-4 w-4" /> Security
            </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and clinic information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91..." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input id="specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" value={bio} onChange={e => setBio(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? (
                            <>Saving...</> 
                        ) : isSaved ? (
                            <>Saved Successfully</>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </>
                        )}
                    </Button>
                    {isSaved && <span className="text-sm text-green-600 font-medium animate-in fade-in">Changes saved!</span>}
                </CardFooter>
            </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                            <span>Email Notifications</span>
                            <span className="font-normal text-xs text-muted-foreground">Receive daily summaries and critical alerts via email.</span>
                        </Label>
                        <Switch id="email-notifs" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="sms-notifs" className="flex flex-col space-y-1">
                            <span>SMS Alerts</span>
                            <span className="font-normal text-xs text-muted-foreground">Get instant SMS for emergency appointments.</span>
                        </Label>
                        <Switch id="sms-notifs" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="marketing-notifs" className="flex flex-col space-y-1">
                            <span>Platform Updates</span>
                            <span className="font-normal text-xs text-muted-foreground">News about new features and updates.</span>
                        </Label>
                        <Switch id="marketing-notifs" />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline">Save Preferences</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
             <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your password and session security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="new-pass">New Password</Label>
                        <Input id="new-pass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-pass">Confirm Password</Label>
                        <Input id="confirm-pass" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="destructive" onClick={handleUpdatePassword}>Update Password</Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
