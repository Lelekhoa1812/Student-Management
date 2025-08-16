import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect()
    console.log("✅ Database connected for GET class by ID")

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID lớp học không được cung cấp" },
        { status: 400 }
      )
    }

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
                gmail: true
              }
            }
          }
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

    // Transform the data to match the expected format for the modal
    const transformedClassData = {
      id: classData.id,
      name: classData.name,
      level: classData.level,
      maxStudents: classData.maxStudents,
      teacherName: classData.teacherName || "",
      isActive: classData.isActive,
      createdAt: classData.createdAt.toISOString(),
      students: classData.studentClasses.map(sc => sc.student)
    }

    console.log("✅ Retrieved class by ID:", classData.id)
    return NextResponse.json(transformedClassData)

  } catch (error) {
    console.error("❌ Error fetching class by ID:", error)
    
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải thông tin lớp học" },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
      console.log("✅ Database disconnected")
    } catch (error) {
      console.error("❌ Error disconnecting:", error)
    }
  }
}
