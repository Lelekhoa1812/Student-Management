import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { Prisma } from "@prisma/client"

// GET /api/teacher/grades?scope=all|my-classes&query=...
// Lists submitted assignments available for this teacher to review
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get("scope") || "my-classes"
    const query = searchParams.get("query")?.trim() || ""

    // Find assignment IDs accessible to this teacher based on scope
    // "all": any assignment of tests created by any teacher
    // "my-classes": only assignments of students who are in classes managed by this teacher
    const assignmentWhere: Prisma.TestAssignmentWhereInput = { completedAt: { not: null } }

    if (scope === "my-classes") {
      // Students in classes this teacher manages
      const myClassStudentIds = await prisma.studentClass.findMany({
        where: {
          class: { teacherId }
        },
        select: { studentId: true }
      })
      const studentIds = Array.from(new Set(myClassStudentIds.map(s => s.studentId)))
      // If no students, short-circuit
      if (studentIds.length === 0) {
        return NextResponse.json([])
      }
      assignmentWhere.studentId = { in: studentIds }
    }

    // Optional student name/email filter
    const assignments = await prisma.testAssignment.findMany({
      where: assignmentWhere,
      include: {
        test: { select: { id: true, title: true, teacherId: true, totalScore: true } },
        student: { select: { id: true, name: true, gmail: true } }
      },
      orderBy: { completedAt: "desc" }
    })

    const filtered = query
      ? assignments.filter(a =>
          a.student.name.toLowerCase().includes(query.toLowerCase()) ||
          a.student.gmail.toLowerCase().includes(query.toLowerCase()) ||
          a.test.title.toLowerCase().includes(query.toLowerCase())
        )
      : assignments

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Error listing grades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


