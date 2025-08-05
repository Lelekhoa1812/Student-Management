import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phoneNumber, password } = body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    const manager = await prisma.manager.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    })

    return NextResponse.json(manager)
  } catch (error) {
    console.error("Error creating manager:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản manager" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Fetch specific manager by email
      const manager = await prisma.manager.findUnique({
        where: { email }
      })

      if (!manager) {
        return NextResponse.json(
          { error: "Không tìm thấy manager" },
          { status: 404 }
        )
      }

      return NextResponse.json(manager)
    } else {
      // Fetch all managers
      const managers = await prisma.manager.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })

      return NextResponse.json(managers)
    }
  } catch (error) {
    console.error("Error fetching managers:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách manager" },
      { status: 500 }
    )
  }
} 