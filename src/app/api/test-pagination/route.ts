import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    
    // Get total count
    const totalStudents = await prisma.student.count()
    
    // Get paginated students
    const students = await prisma.student.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        gmail: true,
        phoneNumber: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const totalPages = Math.ceil(totalStudents / limit)
    
    return NextResponse.json({
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        studentsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error("Error testing pagination:", error)
    return NextResponse.json({ 
      error: "Error testing pagination",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 