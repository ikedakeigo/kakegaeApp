"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"
import { format } from "date-fns"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/lib/database.types"

type Post = Database['public']['Tables']['posts']['Row']

export default function ComparePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [beforePost, setBeforePost] = useState<Post | null>(null)
  const [afterPost, setAfterPost] = useState<Post | null>(null)
  const [sliderValue, setSliderValue] = useState(50)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()
  
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setPosts(data || [])
        
        // Set default selections
        if (data && data.length >= 2) {
          setBeforePost(data[1])
          setAfterPost(data[0])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [user, supabase])
  
  const handleBeforeChange = (value: string) => {
    const post = posts.find(p => p.id === value)
    if (post) setBeforePost(post)
  }
  
  const handleAfterChange = (value: string) => {
    const post = posts.find(p => p.id === value)
    if (post) setAfterPost(post)
  }
  
  if (!user) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not signed in</CardTitle>
            <CardDescription>
              Please sign in to compare your posts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/login">Sign in</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Before & After</h1>
        <p>Loading your posts...</p>
      </div>
    )
  }
  
  if (posts.length < 2) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Before & After</h1>
        <Card>
          <CardHeader>
            <CardTitle>Not enough posts</CardTitle>
            <CardDescription>
              You need at least two posts to use the comparison feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/new">Create a post</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Before & After</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Before</label>
          <Select
            value={beforePost?.id}
            onValueChange={handleBeforeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a post" />
            </SelectTrigger>
            <SelectContent>
              {posts.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.title} ({format(new Date(post.created_at), "MMM d, yyyy")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">After</label>
          <Select
            value={afterPost?.id}
            onValueChange={handleAfterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a post" />
            </SelectTrigger>
            <SelectContent>
              {posts.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.title} ({format(new Date(post.created_at), "MMM d, yyyy")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          {beforePost && afterPost ? (
            <div className="space-y-6">
              <div className="relative aspect-[4/3] overflow-hidden border rounded-lg">
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderValue}%` }}>
                  <div className="relative h-full w-full" style={{ width: `${100 / (sliderValue / 100)}%` }}>
                    <Image
                      src={beforePost.media_url}
                      alt={beforePost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={afterPost.media_url}
                    alt={afterPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div 
                  className="absolute inset-y-0" 
                  style={{ left: `${sliderValue}%` }}
                >
                  <div className="absolute inset-y-0 -ml-px border-l-2 border-white"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-md">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                </div>
              </div>
              
              <div className="px-8">
                <Slider
                  value={[sliderValue]}
                  onValueChange={(value) => setSliderValue(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="font-medium">{beforePost.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(beforePost.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{afterPost.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(afterPost.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Time difference: {formatTimeDifference(new Date(beforePost.created_at), new Date(afterPost.created_at))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p>Select two posts to compare</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center text-muted-foreground">
        <p>Tip: For best results, choose photos taken from the same angle and lighting conditions.</p>
      </div>
    </div>
  )
}

function formatTimeDifference(date1: Date, date2: Date) {
  const diffInMs = Math.abs(date2.getTime() - date1.getTime())
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 1) return "Less than a day"
  if (diffInDays === 1) return "1 day"
  if (diffInDays < 7) return `${diffInDays} days`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`
  return `${Math.floor(diffInDays / 365)} years`
}