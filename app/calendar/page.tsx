import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CalendarView } from "@/components/calendar-view"
import { Database } from "@/lib/database.types"

export default async function CalendarPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, media_url, created_at')
    .order('created_at', { ascending: false })
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <CalendarView initialPosts={posts || []} />
    </div>
  )
}