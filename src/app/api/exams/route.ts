import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { score, levelEstimate, notes } = body

    const exam = await prisma.exam.create({
      data: {
        score,
        levelEstimate,
        notes: notes || null,
        studentId: "temp-student-id", // This should be linked to the actual student
      },
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lưu kết quả thi" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        student: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách bài thi" },
      { status: 500 }
    )
  }
} 