import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId

    // Get class details with students and payments
    const classData = await prisma.class.findUnique({
      where: {
        id: classId,
        isActive: true
      },
      include: {
        studentClasses: {
          include: {
            student: true
          }
        },
        payments: {
          include: {
            student: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: "Không tìm thấy lớp học" },
        { status: 404 }
      )
    }

    // Create a map of student payments
    const studentPaymentMap = new Map<string, any>()
    
    classData.payments.forEach(payment => {
      const key = payment.user_id
      if (!studentPaymentMap.has(key)) {
        studentPaymentMap.set(key, {
          studentId: payment.student.id,
          studentName: payment.student.name,
          studentEmail: payment.student.gmail,
          studentPhone: payment.student.phoneNumber,
          paymentAmount: payment.payment_amount,
          hasPaid: payment.have_paid,
          paymentDate: payment.datetime,
          paymentMethod: payment.payment_method,
          discountPercentage: payment.discount_percentage,
          discountReason: payment.discount_reason
        })
      }
    })

    // Separate paid and unpaid students
    const paidStudents: any[] = []
    const unpaidStudents: any[] = []

    studentPaymentMap.forEach((studentPayment) => {
      if (studentPayment.hasPaid) {
        paidStudents.push(studentPayment)
      } else {
        unpaidStudents.push(studentPayment)
      }
    })

    // Calculate totals
    const totalEarnings = paidStudents.reduce((sum, student) => sum + student.paymentAmount, 0)
    const pendingAmount = unpaidStudents.reduce((sum, student) => sum + student.paymentAmount, 0)

    const classDetails = {
      classId: classData.id,
      className: classData.name,
      level: classData.level,
      totalEarnings,
      pendingAmount,
      paidStudents,
      unpaidStudents
    }

    return NextResponse.json(classDetails)
  } catch (error) {
    console.error("Error fetching class details:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy chi tiết lớp học" },
      { status: 500 }
    )
  }
}
