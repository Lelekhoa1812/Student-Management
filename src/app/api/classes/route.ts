import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const active = searchParams.get("active")

    if (id) {
      // Get specific class with students
      const classData = await prisma.class.findUnique({
        where: { id },
        include: {
          students: {
            select: {
              id: true,
              name: true,
              gmail: true,
              dob: true,
              phoneNumber: true
            }
          }
        }
      })

      if (!classData) {
        return NextResponse.json(
          { error: "Không tìm thấy lớp học" },
          { status: 404 }
        )
      }

      return NextResponse.json(classData)
    }

    // Get all classes
    const whereClause = active === "true" ? { isActive: true } : {}
    
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải danh sách lớp học" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, level, maxStudents, teacherName, payment_amount } = body

    // Validate required fields
    if (!name || !level || !maxStudents) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Check if class name already exists
    const existingClass = await prisma.class.findFirst({
      where: { name, isActive: true }
    })

    if (existingClass) {
      return NextResponse.json(
        { error: "Tên lớp học đã tồn tại" },
        { status: 400 }
      )
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        name,
        level,
        maxStudents: parseInt(maxStudents),
        teacherName: teacherName || null,
        payment_amount: payment_amount ? parseFloat(payment_amount) : null
      }
    })

    return NextResponse.json(newClass)
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo lớp học" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, level, maxStudents, teacherName, payment_amount, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID lớp học" },
        { status: 400 }
      )
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Không tìm thấy lớp học" },
        { status: 404 }
      )
    }

    // Check if new name conflicts with other active classes
    if (name && name !== existingClass.name) {
      const nameConflict = await prisma.class.findFirst({
        where: {
          name,
          isActive: true,
          id: { not: id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "Tên lớp học đã tồn tại" },
          { status: 400 }
        )
      }
    }

    // Update class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: name || existingClass.name,
        level: level || existingClass.level,
        maxStudents: maxStudents ? parseInt(maxStudents) : existingClass.maxStudents,
        teacherName: teacherName !== undefined ? teacherName : existingClass.teacherName,
        payment_amount: payment_amount !== undefined ? (payment_amount ? parseFloat(payment_amount) : null) : existingClass.payment_amount,
        isActive: isActive !== undefined ? isActive : existingClass.isActive
      }
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật lớp học" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID lớp học" },
        { status: 400 }
      )
    }

    // Check if class exists and has students
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: "Không tìm thấy lớp học" },
        { status: 404 }
      )
    }

    if (classData._count.students > 0) {
      return NextResponse.json(
        { error: "Không thể xóa lớp học có học viên" },
        { status: 400 }
      )
    }

    // Delete class
    await prisma.class.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Xóa lớp học thành công" })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa lớp học" },
      { status: 500 }
    )
  }
} 