import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phoneNumber, password } = body

    const hashedPassword = await bcrypt.hash(password, 12)

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error creating teacher:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản teacher" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const teacher = await prisma.teacher.findUnique({ where: { email } })
      if (!teacher) {
        return NextResponse.json(
          { error: "Không tìm thấy giáo viên" },
          { status: 404 }
        )
      }
      return NextResponse.json(teacher)
    }

    const teachers = await prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(teachers)
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách teacher" },
      { status: 500 }
    )
  }
}

