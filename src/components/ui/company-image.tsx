"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface CompanyImageProps {
  className?: string
  position?: "top" | "bottom"
}

export function CompanyImage({ className, position = "top" }: CompanyImageProps) {
  if (position === "top") {
    return (
      <div className={cn(
        "flex justify-center items-center mb-6",
        className
      )}>
        <div className="relative group">
          <Image
            src="/company.JPG"
            alt="Company Information"
            width={400}
            height={250}
            className="relative rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl object-contain max-w-full h-auto"
            style={{
              maxWidth: 'min(400px, 95vw)',
              height: 'auto'
            }}
          />
        </div>
      </div>
    )
  }

  // Footer version - full width banner
  return (
    <div className={cn(
      "w-full mt-8",
      className
    )}>
      <div className="relative group">
        <Image
          src="/company.JPG"
          alt="Company Information"
          width={1920}
          height={400}
          className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105 shadow-lg"
          style={{
            minHeight: '150px',
            maxHeight: '300px'
          }}
          priority
        />
      </div>
    </div>
  )
} 