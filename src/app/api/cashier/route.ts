import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phoneNumber, password } = body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    const cashier = await prisma.cashier.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    })

    return NextResponse.json(cashier)
  } catch (error) {
    console.error("Error creating cashier:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản thu ngân" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Fetch specific cashier member by email
      const cashier = await prisma.cashier.findUnique({
        where: { email }
      })

      if (!cashier) {
        return NextResponse.json(
          { error: "Không tìm thấy thu ngân" },
          { status: 404 }
        )
      }

      return NextResponse.json(cashier)
    } else {
      // Fetch all cashier members
      const cashiers = await prisma.cashier.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json(cashiers)
    }
  } catch (error) {
    console.error("Error fetching cashiers:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách thu ngân" },
      { status: 500 }
    )
  }
}
