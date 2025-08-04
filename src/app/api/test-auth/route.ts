import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      message: "Auth test successful",
      data: {
        session: session ? {
          user: {
            id: session.user?.id,
            name: session.user?.name,
            email: session.user?.email,
            role: session.user?.role,
          },
          expires: session.expires
        } : null,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
        nextAuthUrl: process.env.NEXTAUTH_URL || "Not set",
        googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
      }
    })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({
      success: false,
      message: "Auth test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
} 