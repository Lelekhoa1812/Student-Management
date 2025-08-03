import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phoneNumber, password } = body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error creating staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản staff" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Fetch specific staff member by email
      const staff = await prisma.staff.findUnique({
        where: { email }
      })

      if (!staff) {
        return NextResponse.json(
          { error: "Không tìm thấy nhân viên" },
          { status: 404 }
        )
      }

      return NextResponse.json(staff)
    } else {
      // Fetch all staff members
      const staff = await prisma.staff.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })

      return NextResponse.json(staff)
    }
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách staff" },
      { status: 500 }
    )
  }
} 