import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { gmail: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query } }
        ]
      },
      include: {
        exams: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        registrations: {
          where: { paid: false },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          where: { have_paid: false },
          include: {
            class: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    const studentsWithStatus = students.map(student => ({
      id: student.id,
      name: student.name,
      gmail: student.gmail,
      phoneNumber: student.phoneNumber,
      examinationStatus: student.exams.length > 0 ? 'completed' : 'pending',
      paymentStatus: student.registrations.length > 0 || student.payments.length > 0 ? 'pending' : 'completed',
      pendingPayments: student.payments.length,
      pendingRegistrations: student.registrations.length
    }))

    return NextResponse.json(studentsWithStatus)
  } catch (error) {
    console.error("Error searching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 