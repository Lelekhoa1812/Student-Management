import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await prisma.$connect()
    
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
        studentClasses: {
          include: {
            class: true
          }
        }
      }
    })

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

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
              studentClasses: true
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
      if (targetClass._count.studentClasses >= targetClass.maxStudents) {
        return NextResponse.json(
          { error: "Lớp học đã đầy" },
          { status: 400 }
        )
      }

      // Check if student is already in this class
      const existingClassAssignment = currentStudent.studentClasses.find(
        sc => sc.classId === classId
      )
      
      if (existingClassAssignment) {
        return NextResponse.json(
          { error: "Học viên đã có trong lớp này" },
          { status: 400 }
        )
      }

      // Add student to class using StudentClass model
      try {
        await prisma.studentClass.create({
          data: {
            studentId,
            classId,
            classRegistered: targetClass.numSessions || 24
          }
        })

        // Create payment if class has payment_amount
        if (targetClass.payment_amount) {
          const firstStaff = await prisma.staff.findFirst()
          
          if (firstStaff) {
            await prisma.payment.create({
              data: {
                class_id: classId,
                payment_amount: targetClass.payment_amount,
                user_id: studentId,
                payment_method: "Chưa thanh toán",
                staff_assigned: firstStaff.id,
                have_paid: false
              }
            })
          }
        }

        // Get updated student data
        const updatedStudent = await prisma.student.findUnique({
          where: { id: studentId },
          include: {
            studentClasses: {
              include: {
                class: true
              }
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: "Thêm học viên vào lớp thành công",
          student: updatedStudent
        })
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: "Học viên đã có trong lớp này" },
            { status: 400 }
          )
        }
        throw error
      }
    } else if (action === "remove") {
      if (!classId) {
        return NextResponse.json(
          { error: "Thiếu ID lớp học" },
          { status: 400 }
        )
      }

      // Remove student from specific class
      await prisma.studentClass.deleteMany({
        where: {
          studentId,
          classId
        }
      })

      // Delete payment for this class
      await prisma.payment.deleteMany({
        where: {
          class_id: classId,
          user_id: studentId
        }
      })

      // Get updated student data
      const updatedStudent = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          studentClasses: {
            include: {
              class: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: "Xóa học viên khỏi lớp thành công",
        student: updatedStudent
      })
    } else {
      return NextResponse.json(
        { error: "Hành động không hợp lệ" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error managing class registration:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi quản lý đăng ký lớp học" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    // Ensure database connection
    await prisma.$connect()
    
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
  } finally {
    await prisma.$disconnect()
  }
} 