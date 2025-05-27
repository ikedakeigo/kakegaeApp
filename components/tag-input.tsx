"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps {
  placeholder?: string
  tags: string[]
  setTags: (tags: string[]) => void
  maxTags?: number
  className?: string
}

export function TagInput({
  placeholder = "Add tags...",
  tags,
  setTags,
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault()
      
      const newTag = inputValue.trim().toLowerCase()
      
      if (
        newTag.length > 0 && 
        !tags.includes(newTag) && 
        tags.length < maxTags
      ) {
        setTags([...tags, newTag])
        setInputValue("")
      }
    }
  }
  
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }
  
  return (
    <div
      className={cn(
        "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length < maxTags ? placeholder : `Maximum ${maxTags} tags`}
          className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-[120px] bg-transparent"
          disabled={tags.length >= maxTags}
        />
      </div>
    </div>
  )
}