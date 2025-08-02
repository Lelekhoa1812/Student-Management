"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface CompanyImageProps {
  className?: string
  position?: "top" | "bottom"
}

export function CompanyImage({ className, position = "top" }: CompanyImageProps) {
  return (
    <div className={cn(
      "flex justify-center items-center",
      position === "top" ? "mb-6" : "mt-8",
      className
    )}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
        <Image
          src="/company.JPG"
          alt="Company Information"
          width={300}
          height={200}
          className="relative rounded-lg transition-all duration-300 group-hover:scale-105 object-cover max-w-full h-auto"
          style={{
            maxWidth: 'min(300px, 90vw)',
            height: 'auto'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  )
} 