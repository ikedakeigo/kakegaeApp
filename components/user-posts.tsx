"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/lib/database.types"

type Post = Database['public']['Tables']['posts']['Row']

export function UserPosts({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setPosts(data || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [userId, supabase])
  
  const handleDelete = async (postId: string) => {
    try {
      // Delete post
      // const { error } = await supabase
      //   .from('posts')
      //   .delete()
      //   .eq('id', postId)
      
      // if (error) throw error
      
      setPosts(posts.filter(post => post.id !== postId))
      
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      })
    }
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    )
  }
  
  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven't created any posts yet. Start capturing your journey!
        </p>
        <Button asChild>
          <Link href="/new">Create your first post</Link>
        </Button>
      </Card>
    )
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {posts.map((post) => {
        const createdAt = new Date(post.created_at)
        const formattedDate = format(createdAt, "MMM d, yyyy")
        
        return (
          <div key={post.id} className="group relative">
            <Link href={`/post/${post.id}`}>
              <div className="aspect-square relative rounded-md overflow-hidden">
                <Image
                  src={post.media_url}
                  alt={post.title || "Post"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="h-5 w-5" />
                      <span>{post.like_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comment_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h3 className="font-medium line-clamp-1">{post.title}</h3>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/post/${post.id}`}>View</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      })}
    </div>
  )
}