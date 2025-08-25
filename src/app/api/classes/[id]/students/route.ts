import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/classes/[id]/students - Get students in a specific class
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
    const classId = resolvedParams.id

    // Verify the class belongs to the teacher
    const classData = await prisma.class.findFirst({
      where: { 
        id: classId,
        teacherId
      }
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Get students in the class
    const students = await prisma.studentClass.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            gmail: true,
            school: true
          }
        }
      },
      orderBy: {
        student: { name: 'asc' }
      }
    })

    // Transform the data to match the expected format
    const transformedStudents = students.map(sc => ({
      id: sc.student.id,
      name: sc.student.name,
      gmail: sc.student.gmail,
      school: sc.student.school,
      class: {
        name: classData.name
      }
    }))

    return NextResponse.json(transformedStudents)
  } catch (error) {
    console.error("Error fetching class students:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
