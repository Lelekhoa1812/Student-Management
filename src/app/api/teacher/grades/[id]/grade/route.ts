import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

// PUT /api/teacher/grades/[id]/grade
// Body: { perAnswers: [{ answerId, score, feedback }], overallScore?: number, overallComment?: string }
export async function PUT(
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
    const body = await request.json()
    const { perAnswers, overallScore } = body || {}

    const assignment = await prisma.testAssignment.findUnique({
      where: { id },
      include: { test: true, student: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Access control: creator teacher or class manager
    const isTestOwner = assignment.test.teacherId === teacherId
    let isClassManager = false
    if (!isTestOwner) {
      const sc = await prisma.studentClass.findFirst({
        where: { studentId: assignment.studentId, class: { teacherId } },
        select: { id: true }
      })
      isClassManager = !!sc
    }
    if (!isTestOwner && !isClassManager) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const tx: Prisma.PrismaPromise<unknown>[] = []

    if (Array.isArray(perAnswers) && perAnswers.length > 0) {
      for (const a of perAnswers) {
        if (!a.answerId) continue
        tx.push(prisma.studentAnswer.update({
          where: { id: a.answerId },
          data: {
            score: typeof a.score === "number" ? a.score : undefined,
            feedback: typeof a.feedback === "string" ? a.feedback : undefined
          }
        }))
      }
    }

    // If overallScore not provided, recompute from per answers
    let finalScore = overallScore
    if (typeof finalScore !== "number") {
      const answers = await prisma.studentAnswer.findMany({ where: { assignmentId: id } })
      finalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0)
    }

    tx.push(prisma.testAssignment.update({
      where: { id },
      data: { score: finalScore }
    }))

    await prisma.$transaction(tx)

    return NextResponse.json({ message: "Grading updated", score: finalScore })
  } catch (error) {
    console.error("Error updating grading:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


