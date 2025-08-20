import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, presentStudentIds } = body as { classId?: string, presentStudentIds?: string[] }
    if (!classId || !Array.isArray(presentStudentIds)) {
      return NextResponse.json({ error: 'Thiếu classId hoặc danh sách học viên' }, { status: 400 })
    }

    // Increment attendance for present students in this class
    await Promise.all(presentStudentIds.map(async (studentId) => {
      const sc = await prisma.studentClass.findFirst({ where: { classId, studentId } })
      if (sc) {
        await prisma.studentClass.update({
          where: { id: sc.id },
          data: { attendance: { increment: 1 } }
        })
      }
    }))

    return NextResponse.json({ message: 'Đã lưu điểm danh' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Lỗi khi lưu điểm danh' }, { status: 500 })
  }
}

