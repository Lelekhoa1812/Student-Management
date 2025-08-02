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
    if (!score || !levelEstimate || !examDate || !studentEmail) {
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

    // Create exam record
    const exam = await prisma.exam.create({
      data: {
        score: parseFloat(score),
        levelEstimate,
        studentId: student.id,
        notes: notes || null
      }
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo kết quả thi" },
      { status: 500 }
    )
  }
} 