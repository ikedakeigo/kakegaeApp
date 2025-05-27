"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Database } from "@/lib/database.types"

type LikeButtonProps = {
  postId: string
  initialLikes: number
  size?: "sm" | "default"
}

export function LikeButton({ postId, initialLikes, size = "default" }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikes)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Toggle like state optimistically
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
      
      // TODO: Update like in database
      // const { error } = await supabase
      //   .from('likes')
      //   .upsert({
      //     user_id: user.id,
      //     post_id: postId,
      //     created_at: new Date().toISOString()
      //   })
      
      // if (error) throw error
    } catch (error) {
      // Revert on error
      setLiked(liked)
      setLikeCount(likeCount)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "flex items-center gap-1 transition-all",
        liked && "text-destructive",
        isLoading && "opacity-70 pointer-events-none"
      )}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart className={cn(
        "transition-all",
        size === "sm" ? "h-4 w-4" : "h-5 w-5",
        liked && "fill-destructive text-destructive animate-heartbeat"
      )} />
      <span>{likeCount}</span>
    </Button>
  )
}