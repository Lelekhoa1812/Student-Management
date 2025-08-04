import { NextRequest, NextResponse } from "next/server"
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

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect()
    console.log("✅ Database connected for GET request")

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (email) {
      // Get specific student by email
      const student = await prisma.student.findUnique({
        where: { gmail: email },
        include: {
          studentClasses: {
            include: {
              class: true
            }
          }
        }
      })

      if (!student) {
        return NextResponse.json(
          { error: "Không tìm thấy học viên" },
          { status: 404 }
        )
      }

      console.log("✅ Retrieved student by email:", student.id)
      return NextResponse.json([student]) // Return as array for consistency
    }

    // Get all students
    const students = await prisma.student.findMany({
      include: {
        studentClasses: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("✅ Retrieved students:", students.length)
    return NextResponse.json(students)
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách học viên" },
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