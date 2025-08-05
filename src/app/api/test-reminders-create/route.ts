import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, platform, studentId, content, staffId } = body

    if (!type || !platform || !studentId || !content || !staffId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Verify staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    })

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        staffId,
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
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true
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