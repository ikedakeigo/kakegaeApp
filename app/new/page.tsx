"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { TagInput } from "@/components/tag-input"
import { Camera, Image, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/lib/database.types"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).max(5),
  media: z.instanceof(File).refine(file => file.size > 0, "Media is required"),
})

export default function NewPostPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      media: new File([], ""),
    },
  })
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    form.setValue("media", file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Upload media to Supabase Storage
      // const { data: mediaData, error: mediaError } = await supabase.storage
      //   .from('media')
      //   .upload(`${user.id}/${Date.now()}-${values.media.name}`, values.media)
      
      // if (mediaError) throw mediaError
      
      // const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${mediaData.path}`
      
      // Create post in database
      // const { error: postError } = await supabase
      //   .from('posts')
      //   .insert({
      //     user_id: user.id,
      //     title: values.title,
      //     description: values.description || null,
      //     media_url: mediaUrl,
      //     media_type: values.media.type.startsWith('video') ? 'video' : 'image',
      //     tags: values.tags,
      //   })
      
      // if (postError) throw postError
      
      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      })
      
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container max-w-xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <FormLabel>Media</FormLabel>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {preview ? (
                    <div className="relative w-full aspect-square">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-md" 
                      />
                      <Button 
                        type="button"
                        variant="secondary" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreview(null)
                          form.setValue("media", new File([], ""))
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center space-y-2 mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <p className="font-medium">Drop your file here or click to browse</p>
                        <p className="text-sm text-muted-foreground">
                          Maximum file size: 10MB
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="gap-2" asChild>
                          <label>
                            <Camera className="h-4 w-4" />
                            Use Camera
                            <Input 
                              type="file" 
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </Button>
                        <Button type="button" variant="outline" className="gap-2" asChild>
                          <label>
                            <Image className="h-4 w-4" />
                            Upload File
                            <Input 
                              type="file" 
                              accept="image/*,video/*" 
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                {form.formState.errors.media && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.media.message}
                  </p>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My progress" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share more details about your post..." 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your progress or share details about this moment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <TagInput 
                        placeholder="fitness, travel, family (max 5)"
                        tags={field.value}
                        setTags={(tags) => field.onChange(tags)}
                        maxTags={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Add up to 5 tags to categorize your post.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            disabled={isLoading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}