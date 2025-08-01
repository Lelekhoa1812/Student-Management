import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { levelName, amountPaid, paid } = body

    const registration = await prisma.registration.create({
      data: {
        levelName,
        amountPaid,
        paid,
        studentId: "temp-student-id", // This should be linked to the actual student
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng ký khóa học" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        student: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách đăng ký" },
      { status: 500 }
    )
  }
} 