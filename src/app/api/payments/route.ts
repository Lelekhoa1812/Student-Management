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
    const { class_id, payment_amount, user_id, payment_method, staff_assigned, discount_percentage, discount_reason } = body

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
        staff_assigned,
        discount_percentage: discount_percentage !== undefined ? parseFloat(discount_percentage) : 0,
        discount_reason: discount_reason ?? null
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
    const { id, have_paid, payment_method, staff_assigned, payment_amount, discount_percentage, discount_reason } = body

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
      payment_amount?: number
      discount_percentage?: number
      discount_reason?: string | null
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

    if (payment_amount !== undefined) {
      updateData.payment_amount = parseFloat(payment_amount)
    }

    if (discount_percentage !== undefined) {
      updateData.discount_percentage = parseFloat(discount_percentage)
    }

    if (discount_reason !== undefined) {
      updateData.discount_reason = discount_reason ?? null
    }

    // If client sends a discount without payment_amount, compute amount server-side
    if (payment_amount === undefined && discount_percentage !== undefined) {
      // Get class tuition (preferred), or infer full price from existing payment if a discount already exists
      const paymentWithClass = await prisma.payment.findUnique({
        where: { id },
        include: { class: true }
      })
      if (paymentWithClass) {
        const baseTuition = paymentWithClass.class?.payment_amount
        let fullAmount = baseTuition ?? undefined
        if (!fullAmount || !isFinite(fullAmount)) {
          // infer: payment_amount / (1 - existingPct)
          const existingPct = paymentWithClass.discount_percentage ?? 0
          if (existingPct < 100) {
            fullAmount = paymentWithClass.payment_amount / (1 - existingPct / 100)
          }
        }
        if (fullAmount && isFinite(fullAmount)) {
          updateData.payment_amount = Math.round(fullAmount * (1 - parseFloat(discount_percentage) / 100))
        }
      }
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

    // If discount_reason indicates reduced sessions, update StudentClass.classRegistered
    if (updateData.discount_reason && updateData.discount_reason.includes('Giảm số buổi')) {
      console.log('🔄 Detected reduced sessions discount reason:', updateData.discount_reason)
      
      // Try multiple regex patterns to handle different text encodings
      let newSessionCount: number | null = null
      
      // Pattern 1: "sang X" (Vietnamese)
      let match = updateData.discount_reason.match(/sang (\d+)/)
      if (match) {
        newSessionCount = parseInt(match[1])
        console.log('✅ Matched pattern 1 (sang):', newSessionCount)
      }
      
      // Pattern 2: "to X" (English fallback)
      if (!newSessionCount) {
        match = updateData.discount_reason.match(/to (\d+)/)
        if (match) {
          newSessionCount = parseInt(match[1])
          console.log('✅ Matched pattern 2 (to):', newSessionCount)
        }
      }
      
      // Pattern 3: Extract any number that appears after "Giảm số buổi"
      if (!newSessionCount) {
        match = updateData.discount_reason.match(/Giảm số buổi.*?(\d+)/)
        if (match) {
          newSessionCount = parseInt(match[1])
          console.log('✅ Matched pattern 3 (extract):', newSessionCount)
        }
      }
      
      if (newSessionCount) {
        console.log(`🔄 Updating StudentClass.classRegistered to ${newSessionCount} for student ${updatedPayment.user_id} in class ${updatedPayment.class_id}`)
        
        try {
          const updateResult = await prisma.studentClass.updateMany({
            where: {
              studentId: updatedPayment.user_id,
              classId: updatedPayment.class_id
            },
            data: {
              classRegistered: newSessionCount
            }
          })
          
          console.log(`✅ Successfully updated ${updateResult.count} StudentClass records`)
          
          // Verify the update
          const verifySC = await prisma.studentClass.findFirst({
            where: {
              studentId: updatedPayment.user_id,
              classId: updatedPayment.class_id
            }
          })
          
          if (verifySC) {
            console.log(`📊 Verification: StudentClass.classRegistered is now ${verifySC.classRegistered}`)
          }
          
        } catch (error) {
          console.error('❌ Error updating StudentClass.classRegistered:', error)
        }
      } else {
        console.log('⚠️ Could not extract session count from discount reason:', updateData.discount_reason)
      }
    } else {
      console.log('ℹ️ No reduced sessions discount reason detected')
    }

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