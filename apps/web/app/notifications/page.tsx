"use client"
// Forced rebuild to resolve Next.js cache issue

import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/useNotifications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bell, CheckCircle2, Circle, Clock, Loader2, Trash2, ArrowLeft } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      const diffHr = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin} min ago`
      if (diffHr < 24) return `${diffHr} hr ago`
      if (diffDays < 7) return `${diffDays}d ago`

      return date.toLocaleString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      })
    } catch (e) {
      return dateStr
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Clock className="h-4 w-4 text-blue-500" />
      case 'system': return <Bell className="h-4 w-4 text-amber-500" />
      default: return <Bell className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your latest alerts and activities.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {notifications?.length || 0} Total
            </Badge>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full px-3 py-1 bg-primary">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your notifications...</p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 group ${!n.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`mt-1 p-2 rounded-full ${!n.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-semibold ${!n.is_read ? 'text-primary' : ''}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                        {formatNotificationTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      {!n.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => markAsRead.mutate(n.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="p-4 bg-muted rounded-full">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No notifications yet</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  When you have updates about appointments or system alerts, they will appear here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
