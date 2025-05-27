import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Image from "next/image"
import { formatDistanceToNow, format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CommentSection } from "@/components/comment-section"
import { LikeButton } from "@/components/like-button"
import { Database } from "@/lib/database.types"

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id(username, avatar_url)
    `)
    .eq("id", params.id)
    .single()
  
  if (!post) {
    notFound()
  }

  const createdAt = new Date(post.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })
  const formattedDate = format(createdAt, "MMMM d, yyyy 'at' h:mm a")
  const username = post.profiles?.username || 'Anonymous'
  const avatarUrl = post.profiles?.avatar_url
  const tags = post.tags || []

  return (
    <div className="container max-w-4xl py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            <Image 
              src={post.media_url} 
              alt={post.title || 'Post image'} 
              fill 
              className="object-cover" 
              priority
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Avatar>
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            {post.description && (
              <p className="text-muted-foreground">{post.description}</p>
            )}
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <LikeButton postId={post.id} initialLikes={post.like_count || 0} />
            <div className="text-sm text-muted-foreground">
              <time dateTime={post.created_at} title={formattedDate}>
                {formattedDate}
              </time>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <CommentSection postId={post.id} />
      </div>
    </div>
  )
}