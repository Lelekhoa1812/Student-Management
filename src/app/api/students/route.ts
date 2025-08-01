import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, dob, address, phoneNumber, school, platformKnown, note } = body

    const student = await prisma.student.create({
      data: {
        name,
        dob: new Date(dob),
        address,
        phoneNumber,
        school,
        platformKnown,
        note: note || null,
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo học viên" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        exams: true,
        registrations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách học viên" },
      { status: 500 }
    )
  }
} 