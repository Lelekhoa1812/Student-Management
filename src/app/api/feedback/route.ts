import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, screenshot } = body

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        userRole: session.user.role || "user",
        type,
        title,
        description,
        screenshot: screenshot || null,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Get all feedback (staff only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 