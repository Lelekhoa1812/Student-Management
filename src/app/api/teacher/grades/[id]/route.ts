import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/teacher/grades/[id] - fetch a single assignment with answers and questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    const { id } = await params

    const assignment = await prisma.testAssignment.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            questions: {
              include: { options: true, mappingColumns: true },
              orderBy: { order: "asc" }
            }
          }
        },
        student: { select: { id: true, name: true, gmail: true } },
        answers: true
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Ensure teacher can access: must be creator of test or manage student's class
    const canAccessByTest = assignment.test.teacherId === teacherId

    let canAccessByClass = false
    if (!canAccessByTest) {
      const sc = await prisma.studentClass.findFirst({
        where: { studentId: assignment.studentId, class: { teacherId } },
        select: { id: true }
      })
      canAccessByClass = !!sc
    }

    if (!canAccessByTest && !canAccessByClass) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


