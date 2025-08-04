import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, classId, action } = body

    if (!studentId || !action) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Get current student
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true
      }
    })

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

    const oldClassId = currentStudent.classId
    let newClassId = null

    if (action === "add") {
      if (!classId) {
        return NextResponse.json(
          { error: "Thiếu ID lớp học" },
          { status: 400 }
        )
      }

      // Check if class exists
      const targetClass = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          _count: {
            select: {
              students: true
            }
          }
        }
      })

      if (!targetClass) {
        return NextResponse.json(
          { error: "Không tìm thấy lớp học" },
          { status: 404 }
        )
      }

      // Check if class is full
      if (targetClass._count.students >= targetClass.maxStudents) {
        return NextResponse.json(
          { error: "Lớp học đã đầy" },
          { status: 400 }
        )
      }

      // Check if student is already in this class
      if (oldClassId === classId) {
        return NextResponse.json(
          { error: "Học viên đã có trong lớp này" },
          { status: 400 }
        )
      }

      newClassId = classId
    } else if (action === "remove") {
      // Remove student from class
      newClassId = null
    } else {
      return NextResponse.json(
        { error: "Hành động không hợp lệ" },
        { status: 400 }
      )
    }

    // Update student's class
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        classId: newClassId
      },
      include: {
        class: true
      }
    })

    // Handle payment creation/deletion based on class assignment changes
    if (oldClassId !== newClassId) {
      // If student was removed from a class, delete existing payment
      if (oldClassId) {
        await prisma.payment.deleteMany({
          where: {
            class_id: oldClassId,
            user_id: studentId
          }
        })
      }

      // If student was assigned to a new class, create payment
      if (newClassId) {
        // Get class details to check if it has payment_amount
        const newClass = await prisma.class.findUnique({
          where: { id: newClassId }
        })

        if (newClass && newClass.payment_amount) {
          // Get the first available staff member for the placeholder
          const firstStaff = await prisma.staff.findFirst()
          
          if (firstStaff) {
            // Create payment record with actual staff ID
            await prisma.payment.create({
              data: {
                class_id: newClassId,
                payment_amount: newClass.payment_amount,
                user_id: studentId,
                payment_method: "Chưa thanh toán",
                staff_assigned: firstStaff.id,
                have_paid: false
              }
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === "add" ? "Thêm học viên vào lớp thành công" : "Xóa học viên khỏi lớp thành công",
      student: updatedStudent
    })
  } catch (error) {
    console.error("Error managing class registration:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi quản lý đăng ký lớp học" },
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