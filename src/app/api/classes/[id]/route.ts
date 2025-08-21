import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.$connect()
    console.log("✅ Database connected for GET class by ID")

    const { id } = await params

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
          select: {
            attendance: true,
            classRegistered: true,
            student: {
              select: {
                id: true,
                name: true,
                gmail: true
              }
            }
          }
        },
        teacher: { select: { id: true, name: true, email: true } },
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
    const attendanceByStudentId: Record<string, number> = {}
    const classRegisteredByStudentId: Record<string, number> = {}
    for (const sc of classData.studentClasses) {
      attendanceByStudentId[sc.student.id] = sc.attendance ?? 0
      classRegisteredByStudentId[sc.student.id] = sc.classRegistered ?? classData.numSessions ?? 24
    }

    const transformedClassData = {
      id: classData.id,
      name: classData.name,
      level: classData.level,
      maxStudents: classData.maxStudents,
      teacherName: classData.teacher?.name || "",
      teacherId: classData.teacherId || null,
      numSessions: classData.numSessions ?? 24,
      isActive: classData.isActive,
      createdAt: classData.createdAt.toISOString(),
      students: classData.studentClasses.map(sc => sc.student),
      attendanceByStudentId,
      classRegisteredByStudentId
    }

    console.log("✅ Retrieved class by ID:", classData.id)
    console.log("📊 Transformed data:", {
      attendanceByStudentId,
      classRegisteredByStudentId,
      studentCount: classData.studentClasses.length
    })
    return NextResponse.json(transformedClassData)

  } catch (error) {
    console.error("❌ Error fetching class by ID:", error)
    
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải thông tin lớp học" },
      { status: 500 }
    )
  }
  // Don't disconnect here as other requests might need the connection
  // The connection will be managed by the global Prisma instance
}
