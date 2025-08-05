import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, phoneNumber } = body
    const { id } = await params

    const updatedManager = await prisma.manager.update({
      where: { id },
      data: {
        name,
        phoneNumber,
      },
    })

    return NextResponse.json(updatedManager)
  } catch (error) {
    console.error("Error updating manager:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin manager" },
      { status: 500 }
    )
  }
} 