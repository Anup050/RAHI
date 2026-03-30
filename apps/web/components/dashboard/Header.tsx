"use client"

import { useState } from "react"
import { Bell, Search, User, Calendar, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { useGlobalSearch } from "@/hooks/useDashboard"
import Link from "next/link"

import { useRouter } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Debounce could be handled here or in hook (hook has min length check)
  const { data: searchResults, isLoading: isSearching } = useGlobalSearch(searchQuery);

  const getInitials = (name: string) => {
    if (!name) return "DR";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="w-full flex-1 relative">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search patients, appointments..."
               className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => setIsSearchFocused(true)}
               onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click
             />
          </div>
        </form>
        
        {/* Search Results Dropdown */}
        {isSearchFocused && searchQuery.length > 2 && (
            <div className="absolute top-full left-0 mt-1 w-full md:w-[300px] lg:w-[400px] bg-background border rounded-md shadow-lg p-2 max-h-[300px] overflow-y-auto">
                {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                    </div>
                ) : searchResults && searchResults.length > 0 ? (
                    <div className="space-y-1">
                        {searchResults.map((result: any) => (
                            <Link 
                                key={result.id} 
                                href={`/appointments/${result.id}`}
                                className="flex items-center p-2 hover:bg-muted rounded-md text-sm group"
                            >
                                {result.type === 'patient' ? <User className="mr-2 h-4 w-4 text-primary" /> : <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />}
                                <div>
                                    <p className="font-medium group-hover:text-primary">{result.title || result.name}</p>
                                    <p className="text-xs text-muted-foreground">{result.subtitle || result.details}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-2 text-center text-sm text-muted-foreground">No results found</div>
                )}
            </div>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
             <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">New Lab Result</div>
                <div className="text-xs text-muted-foreground">Blood work for Rohan Das is available.</div>
                <div className="text-[10px] text-muted-foreground mt-1">2 mins ago</div>
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">Appointment Request</div>
                <div className="text-xs text-muted-foreground">Priya Patel requested a video consult.</div>
                <div className="text-[10px] text-muted-foreground mt-1">1 hour ago</div>
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">System Update</div>
                <div className="text-xs text-muted-foreground">Platform maintenance scheduled for Sunday.</div>
                <div className="text-[10px] text-muted-foreground mt-1">1 day ago</div>
             </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer justify-center text-primary font-medium">
             View All Notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage alt="User" />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer w-full">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer w-full">
             Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 focus:text-red-700">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
