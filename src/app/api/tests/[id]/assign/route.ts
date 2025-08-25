import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST /api/tests/[id]/assign - Assign test to students
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    const resolvedParams = await params
    const testId = resolvedParams.id
    const body = await request.json()
    
    const { studentIds, dueDate } = body

    // Validate required fields
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs are required" },
        { status: 400 }
      )
    }

    // Check if test exists and belongs to teacher
    const test = await prisma.test.findFirst({
      where: { 
        id: testId,
        teacherId 
      }
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Create test assignments for each student
    const assignments = await Promise.all(
      studentIds.map(async (studentId: string) => {
        return prisma.testAssignment.create({
          data: {
            testId,
            studentId,
            dueDate: dueDate ? new Date(dueDate) : null
          }
        })
      })
    )

    return NextResponse.json(assignments, { status: 201 })
  } catch (error) {
    console.error("Error assigning test:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/tests/[id]/assign - Get test assignments
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
    const resolvedParams = await params
    const testId = resolvedParams.id

    // Check if test exists and belongs to teacher
    const test = await prisma.test.findFirst({
      where: { 
        id: testId,
        teacherId 
      }
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get all assignments for this test
    const assignments = await prisma.testAssignment.findMany({
      where: { testId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            gmail: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching test assignments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
