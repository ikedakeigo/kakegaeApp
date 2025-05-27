"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Database } from "@/lib/database.types"

type PostItem = Database['public']['Tables']['posts']['Row']

interface CalendarViewProps {
  initialPosts: PostItem[]
}

export function CalendarView({ initialPosts }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts] = useState<PostItem[]>(initialPosts)
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day, dayIndex) => {
            const dayPosts = posts.filter(post => {
              const postDate = new Date(post.created_at)
              return isSameDay(postDate, day)
            })
            
            return (
              <div
                key={dayIndex}
                className={cn(
                  "min-h-24 p-1 border rounded-md",
                  !isSameMonth(day, currentMonth) && "opacity-40",
                )}
              >
                <div className="text-right text-sm p-1">
                  {format(day, "d")}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {dayPosts.slice(0, 4).map((post) => (
                    <Link 
                      key={post.id} 
                      href={`/post/${post.id}`}
                      className="relative aspect-square rounded-sm overflow-hidden"
                    >
                      <Image
                        src={post.media_url}
                        alt={post.title || "Post"}
                        fill
                        className="object-cover"
                      />
                    </Link>
                  ))}
                  {dayPosts.length > 4 && (
                    <div className="flex items-center justify-center text-xs bg-muted/50 rounded-sm">
                      +{dayPosts.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}