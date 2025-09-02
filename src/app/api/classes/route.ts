// src/app/api/classes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/classes - Get all classes for the authenticated teacher
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id

    const classes = await prisma.class.findMany({
      where: { 
        teacherId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        level: true,
        maxStudents: true,
        _count: {
          select: { studentClasses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        await prisma.$connect()
        break
      } catch {
        retries--
        if (retries === 0) {
          console.error("Failed to connect to database after 3 attempts")
          return NextResponse.json(
            { error: "Không thể kết nối cơ sở dữ liệu" },
            { status: 500 }
          )
        }
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    }
    
    const body = await request.json()
    const { name, level, maxStudents, teacherId, payment_amount, numSessions } = body as {
      name: string
      level: string
      maxStudents: string | number
      teacherId?: string | null
      payment_amount?: string | number | null
      numSessions?: string | number
    }

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
        maxStudents: typeof maxStudents === 'string' ? parseInt(maxStudents) : maxStudents,
        teacherId: teacherId || null,
        payment_amount: payment_amount != null ? (typeof payment_amount === 'string' ? parseFloat(payment_amount) : payment_amount) : null,
        numSessions: numSessions != null ? (typeof numSessions === 'string' ? parseInt(numSessions) : numSessions) : undefined
      },
      include: { teacher: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json(newClass)
  } catch (error) {
    console.error("Error creating class:", error)
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo lớp học" },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      console.error("Error disconnecting from database:", e)
    }
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Ensure database connection with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        await prisma.$connect()
        break
      } catch {
        retries--
        if (retries === 0) {
          console.error("Failed to connect to database after 3 attempts")
          return NextResponse.json(
            { error: "Không thể kết nối cơ sở dữ liệu" },
            { status: 500 }
          )
        }
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    }
    
    const body = await request.json()
    const { id, name, level, maxStudents, teacherId, payment_amount, numSessions, isActive } = body as {
      id: string
      name?: string
      level?: string
      maxStudents?: string | number
      teacherId?: string | null
      payment_amount?: string | number | null
      numSessions?: string | number
      isActive?: boolean
    }

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
        name: name ?? existingClass.name,
        level: level ?? existingClass.level,
        maxStudents: maxStudents != null ? (typeof maxStudents === 'string' ? parseInt(maxStudents) : maxStudents) : existingClass.maxStudents,
        teacherId: teacherId !== undefined ? (teacherId || null) : existingClass.teacherId,
        payment_amount: payment_amount !== undefined ? (payment_amount != null ? (typeof payment_amount === 'string' ? parseFloat(payment_amount) : payment_amount) : null) : existingClass.payment_amount,
        numSessions: numSessions !== undefined ? (typeof numSessions === 'string' ? parseInt(numSessions) : numSessions) : existingClass.numSessions,
        isActive: isActive !== undefined ? isActive : existingClass.isActive
      },
      include: { teacher: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error("Error updating class:", error)
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật lớp học" },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      console.error("Error disconnecting from database:", e)
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Ensure database connection with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        await prisma.$connect()
        break
      } catch {
        retries--
        if (retries === 0) {
          console.error("Failed to connect to database after 3 attempts")
          return NextResponse.json(
            { error: "Không thể kết nối cơ sở dữ liệu" },
            { status: 500 }
          )
        }
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    }
    
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
            studentClasses: true
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

    if (classData._count.studentClasses > 0) {
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
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa lớp học" },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      console.error("Error disconnecting from database:", e)
    }
  }
} 