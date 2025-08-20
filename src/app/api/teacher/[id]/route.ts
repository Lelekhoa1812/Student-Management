import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const teacher = await prisma.teacher.findUnique({ where: { id } })
    if (!teacher) {
      return NextResponse.json(
        { error: "Không tìm thấy giáo viên" },
        { status: 404 }
      )
    }
    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error fetching teacher:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy thông tin giáo viên" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phoneNumber } = body

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: { name, phoneNumber },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating teacher:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin giáo viên" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.teacher.delete({ where: { id } })
    return NextResponse.json({ message: "Xóa giáo viên thành công" })
  } catch (error) {
    console.error("Error deleting teacher:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa giáo viên" },
      { status: 500 }
    )
  }
}

