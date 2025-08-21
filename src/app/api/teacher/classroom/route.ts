import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET: fetch classroom by classId (create if not exists) or history when history=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    if (!classId) return NextResponse.json({ error: 'Thiếu classId' }, { status: 400 })

    const historyFlag = searchParams.get('history')
    if (historyFlag === 'true') {
      const notes = await prisma.classNote.findMany({
        where: { classId },
        orderBy: { sessionNumber: 'asc' },
        select: { id: true, sessionNumber: true, createdAt: true, content: true }
      })
      return NextResponse.json({ notes })
    }

    let classroom = await prisma.classroom.findUnique({ where: { classId } })
    if (!classroom) {
      classroom = await prisma.classroom.create({ data: { classId } })
    }
    return NextResponse.json(classroom)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Lỗi khi lấy classroom' }, { status: 500 })
  }
}

// POST: increment classCount and write optional note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, note } = body as { classId?: string, note?: string }
    if (!classId) return NextResponse.json({ error: 'Thiếu classId' }, { status: 400 })

    const classroom = await prisma.classroom.upsert({
      where: { classId },
      update: { classCount: { increment: 1 } },
      create: { classId, classCount: 1 }
    })

    if (note && classroom) {
      await prisma.classNote.create({
        data: {
          classId,
          sessionNumber: classroom.classCount, // session just completed
          content: note
        }
      })
    }

    return NextResponse.json(classroom)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Lỗi khi cập nhật classroom' }, { status: 500 })
  }
}

