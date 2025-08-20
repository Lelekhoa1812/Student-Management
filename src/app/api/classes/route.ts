// src/app/api/classes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        await prisma.$connect()
        break
      } catch (error) {
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
    const active = searchParams.get("active")
    const teacherId = searchParams.get("teacherId")

    if (id) {
      // Get specific class with students
      const classData = await prisma.class.findUnique({
        where: { id },
        include: {
          studentClasses: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  gmail: true,
                  dob: true,
                  phoneNumber: true
                }
              }
            }
          },
          teacher: {
            select: { id: true, name: true, email: true }
          },
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

      return NextResponse.json(classData)
    }

    // Get all classes
    const whereClause: any = active === "true" ? { isActive: true } : {}
    if (teacherId) {
      whereClause.teacherId = teacherId
    }
    
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            studentClasses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải danh sách lớp học" },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error("Error disconnecting from database:", error)
    }
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
      } catch (error) {
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
    const { name, level, maxStudents, teacherId, payment_amount, numSessions } = body

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
        teacherId: teacherId || null,
        payment_amount: payment_amount ? parseFloat(payment_amount) : null,
        numSessions: numSessions ? parseInt(numSessions) : undefined
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
    } catch (error) {
      console.error("Error disconnecting from database:", error)
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
      } catch (error) {
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
    const { id, name, level, maxStudents, teacherId, payment_amount, numSessions, isActive } = body

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
        teacherId: teacherId !== undefined ? (teacherId || null) : (existingClass as any).teacherId,
        payment_amount: payment_amount !== undefined ? (payment_amount ? parseFloat(payment_amount) : null) : existingClass.payment_amount,
        numSessions: numSessions !== undefined ? parseInt(numSessions) : existingClass.numSessions,
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
    } catch (error) {
      console.error("Error disconnecting from database:", error)
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
      } catch (error) {
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
    } catch (error) {
      console.error("Error disconnecting from database:", error)
    }
  }
} 