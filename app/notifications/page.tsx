"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Database } from "@/lib/database.types"

type Notification = Database['public']['Tables']['notifications']['Row'] & {
  sender?: {
    username: string
    avatar_url: string | null
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      
      try {
        // const { data, error } = await supabase
        //   .from('notifications')
        //   .select(`
        //     *,
        //     sender:profiles(username, avatar_url)
        //   `)
        //   .eq('recipient_id', user.id)
        //   .order('created_at', { ascending: false })
        
        // if (error) throw error
        
        // Mark all as read
        // await supabase
        //   .from('notifications')
        //   .update({ is_read: true })
        //   .eq('recipient_id', user.id)
        //   .eq('is_read', false)
        
        // Sample data for demonstration
        const data = [
          {
            id: '1',
            type: 'like',
            content: 'liked your post "Morning workout"',
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            is_read: false,
            recipient_id: user.id,
            sender: {
              username: 'johndoe',
              avatar_url: null
            }
          },
          {
            id: '2',
            type: 'comment',
            content: 'commented on your post "Beach day"',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            is_read: true,
            recipient_id: user.id,
            sender: {
              username: 'janedoe',
              avatar_url: null
            }
          },
          {
            id: '3',
            type: 'follow',
            content: 'started following you',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            is_read: true,
            recipient_id: user.id,
            sender: {
              username: 'marksmith',
              avatar_url: null
            }
          },
          {
            id: '4',
            type: 'system',
            content: 'Welcome to GrowthSnap! Start by creating your first post.',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            is_read: true,
            recipient_id: user.id,
            sender: undefined
          }
        ]
        
        setNotifications(data as Notification[])
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotifications()
  }, [user, supabase])
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-destructive" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'system':
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }
  
  const unreadCount = notifications.filter(n => !n.is_read).length
  
  if (!user) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Sign in to see notifications</h3>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your notifications.
          </p>
          <Button asChild>
            <a href="/login">Sign in</a>
          </Button>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Badge variant="secondary">{unreadCount} new</Badge>
        )}
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderNotificationList(notifications, loading)}
        </TabsContent>
        
        <TabsContent value="unread">
          {renderNotificationList(
            notifications.filter(n => !n.is_read),
            loading
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function renderNotificationList(notifications: Notification[], loading: boolean) {
  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start gap-4 p-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    ))
  }
  
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No notifications</h3>
        <p className="text-muted-foreground">
          You don't have any notifications yet.
        </p>
      </div>
    )
  }
  
  return notifications.map((notification) => {
    const createdAt = new Date(notification.created_at)
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })
    
    return (
      <div 
        key={notification.id} 
        className={cn(
          "flex items-start gap-4 p-4 border-b transition-colors",
          !notification.is_read && "bg-muted/50"
        )}
      >
        {notification.sender ? (
          <Avatar>
            <AvatarImage src={notification.sender.avatar_url || undefined} />
            <AvatarFallback>
              {notification.sender.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            {getNotificationIcon(notification.type)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline">
            {notification.sender && (
              <span className="font-medium mr-1">{notification.sender.username}</span>
            )}
            <span>{notification.content}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{timeAgo}</div>
        </div>
        <div className="flex items-center">
          {!notification.is_read && (
            <div className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
      </div>
    )
  })
}