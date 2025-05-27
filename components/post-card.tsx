"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/database.types"

type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: { username: string, avatar_url: string | null } | null
}

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.like_count || 0)
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    // TODO: Update like in database
  }

  const tags = post.tags || []
  const createdAt = new Date(post.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })
  const username = post.profiles?.username || 'Anonymous'
  const avatarUrl = post.profiles?.avatar_url

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={post.media_url}
            alt={post.title || 'Post image'}
            fill
            className="object-cover transition-transform hover:scale-105"
            priority
          />
        </div>
        <CardContent className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{username}</span>
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>
          </div>
          <h3 className="font-semibold leading-tight line-clamp-1">{post.title}</h3>
          {post.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 px-2"
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-destructive text-destructive")} />
            <span className="text-xs">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 px-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comment_count || 0}</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}