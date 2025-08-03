import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: params.id }
    })

    if (!staff) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy thông tin nhân viên" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, phoneNumber } = body

    // Validate required fields
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        name,
        phoneNumber,
      },
    })

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error("Error updating staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin nhân viên" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.staff.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Xóa nhân viên thành công" })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa nhân viên" },
      { status: 500 }
    )
  }
} 