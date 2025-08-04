// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const studentId = searchParams.get("studentId")
    const classId = searchParams.get("classId")
    const havePaid = searchParams.get("havePaid")

    if (id) {
      // Get specific payment
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          class: true,
          student: true,
          staff: true
        }
      })

      if (!payment) {
        return NextResponse.json(
          { error: "Không tìm thấy thanh toán" },
          { status: 404 }
        )
      }

      return NextResponse.json(payment)
    }

    // Build where clause for filtering
    const whereClause: {
      user_id?: string
      class_id?: string
      have_paid?: boolean
    } = {}
    
    if (studentId) {
      whereClause.user_id = studentId
    }
    
    if (classId) {
      whereClause.class_id = classId
    }
    
    if (havePaid !== null && havePaid !== undefined) {
      whereClause.have_paid = havePaid === "true"
    }

    // Get payments with filters
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        class: true,
        student: true,
        staff: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải danh sách thanh toán" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { class_id, payment_amount, user_id, payment_method, staff_assigned } = body

    // Validate required fields
    if (!class_id || !payment_amount || !user_id || !payment_method || !staff_assigned) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Check if payment already exists for this student and class
    const existingPayment = await prisma.payment.findFirst({
      where: {
        class_id,
        user_id
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: "Thanh toán cho học viên này đã tồn tại" },
        { status: 400 }
      )
    }

    // Create payment
    const newPayment = await prisma.payment.create({
      data: {
        class_id,
        payment_amount: parseFloat(payment_amount),
        user_id,
        payment_method,
        staff_assigned
      },
      include: {
        class: true,
        student: true,
        staff: true
      }
    })

    return NextResponse.json(newPayment)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo thanh toán" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, have_paid, payment_method, staff_assigned } = body

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID thanh toán" },
        { status: 400 }
      )
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Không tìm thấy thanh toán" },
        { status: 404 }
      )
    }

    // Update payment
    const updateData: {
      have_paid?: boolean
      datetime?: Date
      payment_method?: string
      staff_assigned?: string
    } = {}
    
    if (have_paid !== undefined) {
      updateData.have_paid = have_paid
      if (have_paid) {
        updateData.datetime = new Date()
      }
    }
    
    if (payment_method !== undefined) {
      updateData.payment_method = payment_method
    }
    
    if (staff_assigned !== undefined) {
      updateData.staff_assigned = staff_assigned
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        student: true,
        staff: true
      }
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thanh toán" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID thanh toán" },
        { status: 400 }
      )
    }

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Không tìm thấy thanh toán" },
        { status: 404 }
      )
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Xóa thanh toán thành công" })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa thanh toán" },
      { status: 500 }
    )
  }
} 