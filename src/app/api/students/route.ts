import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("=== STUDENT CREATION START ===")
    console.log("1. Testing database connection...")

    // Test database connection first
    await prisma.$connect()
    console.log("✅ Database connection successful")

    const body = await request.json()
    console.log("2. Request body received:", { ...body, password: "[REDACTED]" })

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

    // Validate required fields
    if (!name || !gmail || !password || !dob || !address || !phoneNumber || !school || !platformKnown) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

          console.log("3. Checking for existing students...")
      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { gmail }
      })

    if (existingStudent) {
      console.log("❌ Student already exists:", gmail)
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 409 }
      )
    }

    console.log("4. Hashing password...")
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("✅ Password hashed successfully")

    console.log("5. Creating student record...")
    // Create Student record
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
        note,
      },
    })
    console.log("✅ Student created:", student.id)

    console.log("=== STUDENT CREATION SUCCESS ===")
    console.log("Final result:", { studentId: student.id })

    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản thành công",
      student: { id: student.id, name: student.name }
    })
  } catch (error) {
    console.error("=== STUDENT CREATION ERROR ===")
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    console.error("Error message:", error instanceof Error ? error.message : "No message")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    console.error("Full error object:", error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        console.log("❌ Unique constraint violation")
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 409 }
        )
      }

      if (error.message.includes("Invalid date")) {
        console.log("❌ Invalid date error")
        return NextResponse.json(
          { error: "Ngày sinh không hợp lệ" },
          { status: 400 }
        )
      }

      if (error.message.includes("connect")) {
        console.log("❌ Database connection error")
        return NextResponse.json(
          { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại." },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
      console.log("✅ Database disconnected")
    } catch (e) {
      console.error("❌ Error disconnecting:", e)
    }
  }
}

// GET /api/students - Get students for test assignment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    
    // Get students from classes taught by this teacher
    const students = await prisma.student.findMany({
      where: {
        studentClasses: {
          some: {
            class: {
              teacherId
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        gmail: true,
        school: true,
        studentClasses: {
          select: {
            class: {
              select: {
                name: true,
                level: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 