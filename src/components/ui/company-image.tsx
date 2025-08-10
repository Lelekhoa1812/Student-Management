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
  // Fixed: Changed from object-cover to object-contain to prevent image cropping
  // Added responsive design and proper height constraints
  return (
    <div className={cn(
      "w-full mt-8 flex justify-center px-4", // Added padding for mobile
      className
    )}>
      <div className="relative group w-full max-w-6xl">
        <Image
          src="/company.JPG"
          alt="Company Information"
          width={1920}
          height={400}
          className="w-full h-auto object-contain transition-all duration-300 group-hover:scale-105 shadow-lg rounded-lg" // Added rounded corners
          style={{
            maxHeight: '400px', // Allow natural height, just set a reasonable maximum
            objectFit: 'contain', // Ensure the entire image is visible
            objectPosition: 'center', // Center the image within its container
            minHeight: 'auto' // Remove any minimum height constraints
          }}
          priority
          onLoad={() => console.log('✅ Company image loaded successfully in footer')}
          onError={(e) => console.error('❌ Company image failed to load:', e)}
        />
      </div>
    </div>
  )
} 