import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      gmail,
      password,
      dob,
      address,
      phoneNumber,
      school,
      platformKnown,
      note
    } = body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create both User and Student records
    const user = await prisma.user.create({
      data: {
        name,
        email: gmail,
        password: hashedPassword,
        role: "user", // Default to student role
      },
    })

    const student = await prisma.student.create({
      data: {
        name,
        gmail,
        password: hashedPassword,
        dob: new Date(dob),
        address,
        phoneNumber,
        school,
        platformKnown,
        note: note || null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Tạo tài khoản thành công",
      user: { id: user.id, name: user.name, email: user.email },
      student: { id: student.id, name: student.name }
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
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