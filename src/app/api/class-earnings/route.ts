import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Get all active classes
    const classes = await prisma.class.findMany({
      where: {
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

    const classEarnings = classes.map(classData => {
      // Calculate total earnings (paid payments)
      const totalEarnings = classData.payments
        .filter(payment => payment.have_paid)
        .reduce((sum, payment) => sum + payment.payment_amount, 0)

      // Calculate pending amount (unpaid payments)
      const pendingAmount = classData.payments
        .filter(payment => !payment.have_paid)
        .reduce((sum, payment) => sum + payment.payment_amount, 0)

      // Count paid and unpaid students
      const paidStudents = classData.payments.filter(payment => payment.have_paid).length
      const totalStudents = classData.studentClasses.length
      const unpaidStudents = totalStudents - paidStudents

      return {
        classId: classData.id,
        className: classData.name,
        level: classData.level,
        totalEarnings,
        pendingAmount,
        paidStudents,
        unpaidStudents,
        totalStudents
      }
    })

    return NextResponse.json(classEarnings)
  } catch (error) {
    console.error("Error fetching class earnings:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy dữ liệu doanh thu lớp học" },
      { status: 500 }
    )
  }
}
