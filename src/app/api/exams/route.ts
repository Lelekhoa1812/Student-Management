import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Get exams for specific student
      const student = await prisma.student.findUnique({
        where: { gmail: email },
        include: {
          exams: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
      
      if (!student) {
        return NextResponse.json([])
      }
      
      return NextResponse.json(student.exams)
    } else {
      // Get all exams
      const exams = await prisma.exam.findMany({
        include: {
          student: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json(exams)
    }
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy dữ liệu thi" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { score, levelEstimate, examDate, studentEmail, notes } = body

    // Validate required fields
    if (!score || !studentEmail) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { gmail: studentEmail }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

    // Determine the final level estimate
    let finalLevelEstimate = levelEstimate
    
    // Only auto-calculate if level is completely empty or "Chưa xác định"
    if (!finalLevelEstimate || finalLevelEstimate.trim() === "" || finalLevelEstimate === "Chưa xác định") {
      if (score > 0) {
        // Get level thresholds and calculate level
        const thresholds = await prisma.levelThreshold.findMany({
          orderBy: { minScore: 'asc' }
        })
        
        const threshold = thresholds.find(
          t => score >= t.minScore && score <= t.maxScore
        )
        
        finalLevelEstimate = threshold ? threshold.level : "Chưa xác định"
      } else {
        finalLevelEstimate = "Chưa xác định"
      }
    }

    // Check if there's an existing exam for this student
    const existingExam = await prisma.exam.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    })

    let exam
    if (existingExam) {
      // Update existing exam
      exam = await prisma.exam.update({
        where: { id: existingExam.id },
        data: {
          score: parseFloat(score),
          levelEstimate: finalLevelEstimate,
          examDate: examDate ? new Date(examDate) : null,
          notes: notes || null
        }
      })
    } else {
      // Create new exam record
      exam = await prisma.exam.create({
        data: {
          score: parseFloat(score),
          levelEstimate: finalLevelEstimate,
          examDate: examDate ? new Date(examDate) : null,
          studentId: student.id,
          notes: notes || null
        }
      })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo kết quả thi" },
      { status: 500 }
    )
  }
} 