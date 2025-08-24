import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/tests/[id] - Get a specific test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    const testId = params.id

    const test = await prisma.test.findFirst({
      where: { 
        id: testId,
        teacherId 
      },
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
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/tests/[id] - Update a test
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    const testId = params.id
    const body = await request.json()

    // Check if test exists and belongs to teacher
    const existingTest = await db.test.findFirst({
      where: { 
        id: testId,
        teacherId 
      }
    })

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    const {
      title,
      description,
      duration,
      totalQuestions,
      totalScore,
      passingScore,
      questions
    } = body

    // Validate required fields
    if (!title || !duration || !totalQuestions || !totalScore || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update test - first delete existing questions and recreate them
    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        title,
        description,
        duration,
        totalQuestions,
        totalScore,
        passingScore,
        updatedAt: new Date(),
        questions: {
          deleteMany: {},
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            order: index + 1,
            score: q.score,
            fillBlankContent: q.fillBlankContent,
            correctAnswers: q.correctAnswers || [],
            options: q.questionType === 'mcq' ? {
              create: q.options.map((opt: any, optIndex: number) => ({
                optionText: opt.optionText,
                optionKey: opt.optionKey,
                isCorrect: opt.isCorrect,
                order: optIndex + 1
              }))
            } : undefined,
            mappingColumns: q.questionType === 'mapping' ? {
              create: q.mappingColumns.map((col: any, colIndex: number) => ({
                columnType: col.columnType,
                itemText: col.itemText,
                order: colIndex + 1
              }))
            } : undefined
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true,
            mappingColumns: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedTest)
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/tests/[id] - Delete a test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    const testId = params.id

    // Check if test exists and belongs to teacher
    const existingTest = await db.test.findFirst({
      where: { 
        id: testId,
        teacherId 
      }
    })

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Delete test (cascades to questions, options, etc.)
    await prisma.test.delete({
      where: { id: testId }
    })

    return NextResponse.json({ message: "Test deleted successfully" })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
