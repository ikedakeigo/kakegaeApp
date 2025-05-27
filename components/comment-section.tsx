"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/lib/database.types"

type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: { username: string, avatar_url: string | null } | null
}

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id(username, avatar_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setComments(data || [])
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchComments()
  }, [postId, supabase])
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive"
      })
      return
    }
    
    if (!newComment.trim()) return
    
    try {
      setSubmitting(true)
      
      // Add optimistic comment
      const optimisticComment = {
        id: crypto.randomUUID(),
        post_id: postId,
        user_id: user.id,
        content: newComment,
        created_at: new Date().toISOString(),
        profiles: {
          username: user.username || 'Anonymous',
          avatar_url: user.avatar_url
        }
      } as Comment
      
      setComments([optimisticComment, ...comments])
      setNewComment("")
      
      // TODO: Add comment to database
      // const { error } = await supabase
      //   .from('comments')
      //   .insert({
      //     post_id: postId,
      //     user_id: user.id,
      //     content: newComment
      //   })
      
      // if (error) throw error
    } catch (error) {
      // Remove optimistic comment on error
      setComments(comments)
      setNewComment(newComment)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
      
      {user && (
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment} 
                disabled={!newComment.trim() || submitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => {
            const createdAt = new Date(comment.created_at)
            const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })
            const username = comment.profiles?.username || 'Anonymous'
            const avatarUrl = comment.profiles?.avatar_url
            
            return (
              <div key={comment.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{username}</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}