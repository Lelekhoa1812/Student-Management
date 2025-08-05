import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all staff members
    const staffMembers = await prisma.staff.findMany({
      select: {
        id: true,
        name: true,
      }
    })

    const kpiData = await Promise.all(
      staffMembers.map(async (staff) => {
        // Count payments for today
        const todayCount = await prisma.payment.count({
          where: {
            staff_assigned: staff.id,
            datetime: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }
          }
        })

        // Count payments for last 7 days
        const weekCount = await prisma.payment.count({
          where: {
            staff_assigned: staff.id,
            datetime: {
              gte: weekAgo
            }
          }
        })

        // Count payments for last 30 days
        const monthCount = await prisma.payment.count({
          where: {
            staff_assigned: staff.id,
            datetime: {
              gte: monthAgo
            }
          }
        })

        // Count reminders for today
        const todayReminderCount = await prisma.reminder.count({
          where: {
            staffId: staff.id,
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }
          }
        })

        // Count reminders for last 7 days
        const weekReminderCount = await prisma.reminder.count({
          where: {
            staffId: staff.id,
            createdAt: {
              gte: weekAgo
            }
          }
        })

        // Count reminders for last 30 days
        const monthReminderCount = await prisma.reminder.count({
          where: {
            staffId: staff.id,
            createdAt: {
              gte: monthAgo
            }
          }
        })

        return {
          staffName: staff.name,
          todayCount,
          weekCount,
          monthCount,
          todayReminderCount,
          weekReminderCount,
          monthReminderCount
        }
      })
    )

    return NextResponse.json(kpiData)
  } catch (error) {
    console.error("Error fetching KPI data:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy dữ liệu KPI" },
      { status: 500 }
    )
  }
} 