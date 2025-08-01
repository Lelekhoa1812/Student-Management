import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, minScore, maxScore } = body

    const threshold = await prisma.levelThreshold.create({
      data: {
        level,
        minScore,
        maxScore,
      },
    })

    return NextResponse.json(threshold, { status: 201 })
  } catch (error) {
    console.error("Error creating level threshold:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo ngưỡng điểm" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const thresholds = await prisma.levelThreshold.findMany({
      orderBy: {
        minScore: "asc",
      },
    })

    return NextResponse.json(thresholds)
  } catch (error) {
    console.error("Error fetching level thresholds:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách ngưỡng điểm" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, level, minScore, maxScore } = body

    const threshold = await prisma.levelThreshold.update({
      where: { id },
      data: {
        level,
        minScore,
        maxScore,
      },
    })

    return NextResponse.json(threshold)
  } catch (error) {
    console.error("Error updating level threshold:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật ngưỡng điểm" },
      { status: 500 }
    )
  }
} 