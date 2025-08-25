import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Question, QuestionOption, MappingColumn, TestData } from "@/lib/types"

// GET /api/tests - Get all tests for the authenticated teacher
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    
    const tests = await prisma.test.findMany({
      where: { teacherId },
      include: {
        questions: {
          include: {
            options: true,
            mappingColumns: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { assignments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/tests - Create a new test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json() as TestData
    
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

    // Create test with questions in a transaction
    const test = await prisma.test.create({
      data: {
        title,
        description,
        teacherId,
        duration,
        totalQuestions,
        totalScore,
        passingScore,
        questions: {
          create: questions.map((q: Question, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            order: index + 1,
            score: q.score,
            fillBlankContent: q.fillBlankContent,
            correctAnswers: q.correctAnswers || [],
            options: q.questionType === 'mcq' ? {
              create: q.options?.map((opt: QuestionOption, optIndex: number) => ({
                optionText: opt.optionText,
                optionKey: opt.optionKey,
                isCorrect: opt.isCorrect,
                order: optIndex + 1
              }))
            } : undefined,
            mappingColumns: q.questionType === 'mapping' ? {
              create: q.mappingColumns?.map((col: MappingColumn, colIndex: number) => ({
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

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
