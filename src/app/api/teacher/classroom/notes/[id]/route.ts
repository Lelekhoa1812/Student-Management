import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body as { content: string }

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Nội dung ghi chú không được để trống" },
        { status: 400 }
      )
    }

    // Ensure database connection is ready
    try {
      await prisma.$connect()
    } catch (connectionError) {
      console.error('❌ Database connection failed:', connectionError)
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again.' 
      }, { status: 503 })
    }

    // Update the note
    const updatedNote = await prisma.classNote.update({
      where: { id },
      data: { content: content.trim() },
      select: {
        id: true,
        sessionNumber: true,
        content: true,
        createdAt: true
      }
    })

    console.log(`✅ Note ${id} updated successfully`)
    return NextResponse.json(updatedNote)

  } catch (error) {
    console.error('❌ Error updating note:', error)
    
    if (error instanceof Error && error.message.includes('Engine is not yet connected')) {
      return NextResponse.json({ 
        error: 'Database connection issue. Please try again.' 
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật ghi chú' },
      { status: 500 }
    )
  }
}
