"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts"

// Sample data - would be fetched from your API in a real application
const activityData = [
  { month: "Jan", posts: 4, likes: 12, comments: 5 },
  { month: "Feb", posts: 3, likes: 9, comments: 2 },
  { month: "Mar", posts: 5, likes: 15, comments: 8 },
  { month: "Apr", posts: 7, likes: 24, comments: 12 },
  { month: "May", posts: 2, likes: 8, comments: 4 },
  { month: "Jun", posts: 6, likes: 29, comments: 14 },
]

const tagData = [
  { name: "Fitness", posts: 12, color: "hsl(var(--chart-1))" },
  { name: "Travel", posts: 8, color: "hsl(var(--chart-2))" },
  { name: "Family", posts: 6, color: "hsl(var(--chart-3))" },
  { name: "Food", posts: 4, color: "hsl(var(--chart-4))" },
  { name: "Other", posts: 3, color: "hsl(var(--chart-5))" },
]

const growthData = [
  { month: "Jan", progress: 5 },
  { month: "Feb", progress: 12 },
  { month: "Mar", progress: 18 },
  { month: "Apr", progress: 25 },
  { month: "May", progress: 32 },
  { month: "Jun", progress: 40 },
]

export default function StatsPage() {
  const [timeframe, setTimeframe] = useState("6months")
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <div className="mt-4 md:mt-0">
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">24</CardTitle>
            <CardDescription>Total Posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">↑ 12%</span> from previous period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">128</CardTitle>
            <CardDescription>Total Likes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">↑ 24%</span> from previous period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">37</CardTitle>
            <CardDescription>Total Comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">↑ 18%</span> from previous period
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="activity">
        <TabsList className="mb-6">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>
                Your posting activity, likes, and comments over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" name="Posts" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="likes" name="Likes" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="comments" name="Comments" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Tags Distribution</CardTitle>
              <CardDescription>
                Distribution of your posts by tags.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tagData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="posts"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {tagData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col space-y-4">
                  {tagData.map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">{tag.posts} posts</span>
                        <span className="text-muted-foreground">
                          {((tag.posts / tagData.reduce((sum, item) => sum + item.posts, 0)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trend</CardTitle>
              <CardDescription>
                Your progress over time based on your own assessment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    name="Progress" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2} 
                    dot={{ r: 6 }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}