import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "staff" && session.user?.role !== "cashier")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams: _searchParams } = new URL(request.url)
    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    // Get user ID based on role
    let userId: string | null = null
    if (session.user.role === "staff") {
      const staff = await prisma.staff.findUnique({
        where: { email: userEmail }
      })
      userId = staff?.id || null
    } else if (session.user.role === "cashier") {
      const cashier = await prisma.cashier.findUnique({
        where: { email: userEmail }
      })
      userId = cashier?.id || null
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const reminders = await prisma.reminder.findMany({
      where: { 
        OR: [
          { staffId: userId },
          { cashierId: userId }
        ]
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            gmail: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "staff" && session.user?.role !== "cashier")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, platform, studentId, content } = body

    if (!type || !platform || !studentId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    // Get user ID based on role
    let userId: string | null = null
    let isStaff = false
    if (session.user.role === "staff") {
      const staff = await prisma.staff.findUnique({
        where: { email: userEmail }
      })
      userId = staff?.id || null
      isStaff = true
    } else if (session.user.role === "cashier") {
      const cashier = await prisma.cashier.findUnique({
        where: { email: userEmail }
      })
      userId = cashier?.id || null
      isStaff = false
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        staffId: isStaff ? userId : null,
        cashierId: !isStaff ? userId : null,
        type,
        platform,
        studentId,
        content
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            gmail: true
          }
        }
      }
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 