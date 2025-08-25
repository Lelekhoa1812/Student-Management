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

    console.log("🔍 Fetching test assignment for student:", studentId)
    console.log("🔍 Session user:", session.user)
    
    // Also check if we can find the student by email to verify the ID
    const student = await prisma.student.findUnique({
      where: { gmail: session.user.email || '' },
      select: { id: true, name: true, gmail: true }
    })
    
    if (student) {
      console.log("🔍 Student found in database:", student)
      if (student.id !== studentId) {
        console.log("⚠️ WARNING: Session user ID doesn't match database student ID!")
        console.log("   Session ID:", studentId)
        console.log("   Database ID:", student.id)
      }
    } else {
      console.log("❌ Student not found in database with email:", session.user.email)
    }

    // Get all active test assignments for the student
    const assignments = await prisma.testAssignment.findMany({
      where: { 
        studentId,
        completedAt: undefined // Not completed yet - use undefined for MongoDB null values
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

    if (!assignments || assignments.length === 0) {
      console.log("❌ No assignments found for student:", studentId)
      return NextResponse.json({ assignment: null })
    }

    console.log(`✅ ${assignments.length} assignment(s) found for student:`, studentId)
    assignments.forEach((assignment, index) => {
      console.log(`   Assignment ${index + 1}:`, {
        id: assignment.id,
        testTitle: assignment.test.title,
        studentId: assignment.studentId,
        completedAt: assignment.completedAt
      })
    })

    // Return single assignment if only one, array if multiple
    const result = assignments.length === 1 ? assignments[0] : assignments
    return NextResponse.json({ assignment: result })
  } catch (error) {
    console.error("Error fetching student assignment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
