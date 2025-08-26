import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/tests/student/assignments - Get all student's test assignments (active and completed)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = session.user.id

    const assignments = await prisma.testAssignment.findMany({
      where: { studentId },
      include: {
        test: {
          include: {
            questions: {
              include: {
                options: { orderBy: { order: 'asc' } },
                mappingColumns: { orderBy: { order: 'asc' } }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    })

    // Treat both undefined and null as not completed (Mongo can return null)
    const activeAssignments = assignments.filter(a => !a.completedAt)
    const completedAssignments = assignments.filter(a => !!a.completedAt)

    return NextResponse.json({ activeAssignments, completedAssignments })
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


