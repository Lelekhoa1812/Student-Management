import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface SessionData {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    role?: string
  }
  expires: string
}

interface DatabaseCheck {
  email: string
  foundInStudent: boolean
  foundInStaff: boolean
  studentData: {
    id: string
    name: string
    role: string
  } | null
  staffData: {
    id: string
    name: string
    role: string
  } | null
  error?: string
}

interface GoogleOAuthStatus {
  clientId: string
  clientSecret: string
  nextAuthUrl: string
  nextAuthSecret: string
}

interface TestResults {
  session: SessionData | null
  databaseCheck: DatabaseCheck | null
  googleOAuthStatus: GoogleOAuthStatus | string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email')
    
    const testResults: TestResults = {
      session: null,
      databaseCheck: null,
      googleOAuthStatus: "Not tested"
    }
    
    // Check current session
    if (session) {
      testResults.session = {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role,
        },
        expires: session.expires
      }
    }
    
    // Test database lookup for a specific email
    if (testEmail) {
      try {
        const student = await prisma.student.findUnique({
          where: { gmail: testEmail }
        })
        
        const staff = await prisma.staff.findUnique({
          where: { email: testEmail }
        })
        
        testResults.databaseCheck = {
          email: testEmail,
          foundInStudent: !!student,
          foundInStaff: !!staff,
          studentData: student ? {
            id: student.id,
            name: student.name,
            role: student.role
          } : null,
          staffData: staff ? {
            id: staff.id,
            name: staff.name,
            role: staff.role
          } : null
        }
      } catch (error) {
        testResults.databaseCheck = {
          email: testEmail,
          foundInStudent: false,
          foundInStaff: false,
          studentData: null,
          staffData: null,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
    
    // Check Google OAuth configuration
    testResults.googleOAuthStatus = {
      clientId: process.env.GOOGLE_CLIENT_ID ? "Configured" : "Missing",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Configured" : "Missing",
      nextAuthUrl: process.env.NEXTAUTH_URL || "Missing",
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Configured" : "Missing"
    }
    
    return NextResponse.json({
      success: true,
      message: "Google OAuth test completed",
      data: testResults,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error("Google OAuth test error:", error)
    return NextResponse.json({
      success: false,
      message: "Google OAuth test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
} 