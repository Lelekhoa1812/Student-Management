import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test reminder creation
    const testStaff = await prisma.staff.findFirst()
    const testStudent = await prisma.student.findFirst()

    if (!testStaff || !testStudent) {
      return NextResponse.json({ 
        error: "No staff or student found for testing",
        staffCount: await prisma.staff.count(),
        studentCount: await prisma.student.count()
      })
    }

    // Create a test reminder
    const testReminder = await prisma.reminder.create({
      data: {
        staffId: testStaff.id,
        type: "payment",
        platform: "call",
        studentId: testStudent.id,
        content: "Test reminder content"
      },
      include: {
        staff: {
          select: { name: true, email: true }
        },
        student: {
          select: { name: true, gmail: true }
        }
      }
    })

    // Get all reminders
    const allReminders = await prisma.reminder.findMany({
      include: {
        staff: {
          select: { name: true, email: true }
        },
        student: {
          select: { name: true, gmail: true }
        }
      }
    })

    return NextResponse.json({
      message: "Reminder functionality test successful",
      testReminder,
      totalReminders: allReminders.length,
      allReminders
    })
  } catch (error) {
    console.error("Error testing reminders:", error)
    return NextResponse.json({ 
      error: "Error testing reminders",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 