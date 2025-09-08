import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing reminder ID" }, { status: 400 })
  }
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "staff" && session.user?.role !== "cashier")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, platform, content } = body

    if (!type || !platform || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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

    // Verify the reminder belongs to this user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: id,
        OR: [
          { staffId: userId },
          { cashierId: userId }
        ]
      }
    })

    if (!existingReminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: id },
      data: {
        type,
        platform,
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

    return NextResponse.json(updatedReminder)
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "staff" && session.user?.role !== "cashier")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Verify the reminder belongs to this user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: id,
        OR: [
          { staffId: userId },
          { cashierId: userId }
        ]
      }
    })

    if (!existingReminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    await prisma.reminder.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Reminder deleted successfully" })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 