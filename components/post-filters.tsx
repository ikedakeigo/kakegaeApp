"use client"

import { useState } from "react"
import { Check, ChevronDown, Search, SlidersHorizontal, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function PostFilters() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [tagValue, setTagValue] = useState("")
  
  // This would come from your database
  const popularTags = [
    "fitness", "travel", "family", "cooking", "nature", 
    "pets", "selfcare", "motivation", "progress"
  ]

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
        {searchOpen && (
          <div className="absolute top-full mt-2 right-0 z-10 w-[300px] p-4 bg-background border rounded-lg shadow-lg">
            <Input placeholder="Search posts..." className="mb-2" />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setSearchOpen(false)}>Apply</Button>
            </div>
          </div>
        )}
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Tags</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup heading="Popular Tags">
                {popularTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={(value) => {
                      setTagValue(value === tagValue ? "" : value)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        tagValue === tag ? "opacity-100" : "opacity-0"
                      )}
                    />
                    #{tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px]">
          <div className="space-y-2">
            <h4 className="font-medium">Sort by</h4>
            <div className="flex flex-col space-y-1">
              <Button variant="ghost" size="sm" className="justify-start">
                <Check className="mr-2 h-4 w-4" />
                Latest
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <div className="w-4 mr-2" />
                Oldest
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <div className="w-4 mr-2" />
                Most liked
              </Button>
            </div>
            
            <Separator />
            
            <h4 className="font-medium">Media type</h4>
            <div className="flex flex-col space-y-1">
              <Button variant="ghost" size="sm" className="justify-start">
                <Check className="mr-2 h-4 w-4" />
                All
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <div className="w-4 mr-2" />
                Photos
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <div className="w-4 mr-2" />
                Videos
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}