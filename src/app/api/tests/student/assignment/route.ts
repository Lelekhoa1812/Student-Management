import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/tests/student/assignment - Get current student's test assignment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = session.user.id

    // Get the most recent active test assignment for the student
    const assignment = await prisma.testAssignment.findFirst({
      where: { 
        studentId,
        completedAt: null // Not completed yet
      },
      include: {
        test: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                },
                mappingColumns: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    })

    if (!assignment) {
      return NextResponse.json({ assignment: null })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("Error fetching student assignment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
