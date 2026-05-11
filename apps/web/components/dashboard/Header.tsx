"use client"

import { useState } from "react"
import { Bell, Search, User, Calendar, Loader2, Menu } from "lucide-react"
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
import { useNotifications } from "@/hooks/useNotifications"
import Link from "next/link"

import { useRouter } from "next/navigation"

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Debounce could be handled here or in hook (hook has min length check)
  const { data: searchResults, isLoading: isSearching } = useGlobalSearch(searchQuery);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    if (!name) return "DR";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      
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
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-[10px] text-primary hover:bg-transparent"
                onClick={() => markAllAsRead.mutate()}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
             {notifications && notifications.length > 0 ? (
               notifications.map((n, i) => (
                 <div key={n.id}>
                    <DropdownMenuItem 
                      className={`cursor-pointer flex flex-col items-start gap-1 p-3 focus:bg-muted ${!n.is_read ? 'bg-primary/5' : ''}`}
                      onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`font-medium text-sm ${!n.is_read ? 'text-primary' : ''}`}>{n.title}</div>
                        {!n.is_read && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</div>
                    </DropdownMenuItem>
                    {i < notifications.length - 1 && <DropdownMenuSeparator />}
                 </div>
               ))
             ) : (
               <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
             )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer justify-center text-primary font-medium focus:text-primary"
            onClick={() => router.push('/notifications')}
          >
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
            <User className="mr-2 h-4 w-4" /> My Profile
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
