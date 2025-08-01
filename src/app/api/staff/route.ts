import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phoneNumber } = body

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        phoneNumber,
      },
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error("Error creating staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản staff" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách staff" },
      { status: 500 }
    )
  }
} 