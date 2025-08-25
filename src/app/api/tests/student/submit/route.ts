import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { QuestionOption } from "@/lib/types"

// POST /api/tests/student/submit - Submit test answers
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = session.user.id
    const body = await request.json()
    const { assignmentId, answers } = body

    if (!assignmentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the assignment belongs to the student
    const assignment = await prisma.testAssignment.findFirst({
      where: { 
        id: assignmentId,
        studentId,
        completedAt: undefined // Use undefined for MongoDB null values
      },
      include: {
        test: {
                  include: {
          questions: {
            include: {
              options: true,
              mappingColumns: true
            }
          }
        }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or already completed" },
        { status: 404 }
      )
    }

    // Calculate score based on answers
    let totalScore = 0
    const studentAnswers = []

    for (const answer of answers) {
      const question = assignment.test.questions.find(q => q.id === answer.questionId)
      if (!question) continue

      let score = 0
      let feedback = ""

      // Score calculation based on question type
      if (question.questionType === 'mcq' && answer.selectedOptions) {
        // For MCQ, check if selected options match correct answers
        const correctOptions = question.options?.filter((opt: QuestionOption) => opt.isCorrect).map((opt: QuestionOption) => opt.id) || []
        const isCorrect = answer.selectedOptions.length === correctOptions.length &&
          answer.selectedOptions.every((opt: string) => correctOptions.includes(opt))
        score = isCorrect ? question.score : 0
        feedback = isCorrect ? "Đúng" : "Sai"
      } else if (question.questionType === 'constructed_response') {
        // For constructed response, score will be manually reviewed by teacher
        score = 0
        feedback = "Cần giáo viên chấm điểm"
      } else if (question.questionType === 'fill_blank' && answer.answerText) {
        // For fill in the blank, check against correct answers
        const studentAnswers = answer.answerText.split('|')
        const correctAnswers = question.correctAnswers || []
        let correctCount = 0
        
        for (let i = 0; i < Math.min(studentAnswers.length, correctAnswers.length); i++) {
          if (studentAnswers[i].trim().toLowerCase() === correctAnswers[i].trim().toLowerCase()) {
            correctCount++
          }
        }
        
        score = Math.round((correctCount / correctAnswers.length) * question.score)
        feedback = `${correctCount}/${correctAnswers.length} đúng`
      } else if (question.questionType === 'mapping' && answer.mappingAnswers) {
        // For mapping, score will be manually reviewed by teacher for now
        score = 0
        feedback = "Cần giáo viên chấm điểm"
      }

      totalScore += score

      studentAnswers.push({
        assignmentId,
        questionId: answer.questionId,
        answerText: answer.answerText,
        selectedOptions: answer.selectedOptions,
        mappingAnswers: answer.mappingAnswers,
        score,
        feedback
      })
    }

    // Create student answers and update assignment
    await prisma.$transaction([
      // Create all student answers
      prisma.studentAnswer.createMany({
        data: studentAnswers
      }),
      
      // Update assignment as completed
      prisma.testAssignment.update({
        where: { id: assignmentId },
        data: {
          completedAt: new Date(),
          score: totalScore
        }
      })
    ])

    return NextResponse.json({ 
      message: "Test submitted successfully",
      score: totalScore,
      totalPossibleScore: assignment.test.questions.reduce((sum, q) => sum + q.score, 0)
    })
  } catch (error) {
    console.error("Error submitting test:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
