import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== UPDATE STUDENT START ===")
    console.log("Student ID:", params.id)
    
    const body = await request.json()
    console.log("Update data:", { ...body, password: "[REDACTED]" })
    
    const {
      name,
      dob,
      address,
      phoneNumber,
      school,
      platformKnown,
      note
    } = body

    // Validate required fields
    if (!name || !dob || !address || !phoneNumber || !school || !platformKnown) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    console.log("1. Updating student record...")
    // Update Student record
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
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
    console.log("✅ Student updated:", updatedStudent.id)

    console.log("2. Updating user record...")
    // Update User record using the gmail from the updated student
    const updatedUser = await prisma.user.update({
      where: { email: (updatedStudent as any).gmail },
      data: {
        name,
      },
    })
    console.log("✅ User updated:", updatedUser.id)

    console.log("=== UPDATE STUDENT SUCCESS ===")
    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("=== UPDATE STUDENT ERROR ===")
    console.error("Error:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          { error: "Không tìm thấy học viên" },
          { status: 404 }
        )
      }
      
      if (error.message.includes("Invalid date")) {
        return NextResponse.json(
          { error: "Ngày sinh không hợp lệ" },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== GET STUDENT BY ID ===")
    console.log("Student ID:", params.id)
    
    const student = await prisma.student.findUnique({
      where: { id: params.id },
    })

    if (!student) {
      console.log("❌ Student not found")
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

    console.log("✅ Student found:", student.id)
    return NextResponse.json(student)
  } catch (error) {
    console.error("=== GET STUDENT ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy thông tin học viên" },
      { status: 500 }
    )
  }
} 