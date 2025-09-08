import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cashier = await prisma.cashier.findUnique({
      where: { id }
    })

    if (!cashier) {
      return NextResponse.json(
        { error: "Không tìm thấy thu ngân" },
        { status: 404 }
      )
    }

    return NextResponse.json(cashier)
  } catch (error) {
    console.error("Error fetching cashier:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy thông tin thu ngân" },
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

    // Validate required fields
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    const updatedCashier = await prisma.cashier.update({
      where: { id },
      data: {
        name,
        phoneNumber,
      },
    })

    return NextResponse.json(updatedCashier)
  } catch (error) {
    console.error("Error updating cashier:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin thu ngân" },
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
    await prisma.cashier.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Xóa thu ngân thành công" })
  } catch (error) {
    console.error("Error deleting cashier:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa thu ngân" },
      { status: 500 }
    )
  }
}
