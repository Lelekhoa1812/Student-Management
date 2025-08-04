import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const studentCount = await prisma.student.count()
    const staffCount = await prisma.staff.count()
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        studentCount,
        staffCount,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
        nextAuthUrl: process.env.NEXTAUTH_URL || "Not set"
      }
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
} 