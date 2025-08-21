import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection is ready
    try {
      await prisma.$connect()
    } catch (connectionError) {
      console.error('❌ Database connection failed:', connectionError)
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again.' 
      }, { status: 503 })
    }

    const body = await request.json()
    const {
      classId,
      incrementIds,
      decrementIds,
      presentStudentIds
    } = body as {
      classId?: string
      incrementIds?: string[]
      decrementIds?: string[]
      presentStudentIds?: string[]
    }

    console.log('🔄 Attendance API called with:', {
      classId,
      incrementIds,
      decrementIds,
      presentStudentIds,
      body
    })

    if (!classId) {
      console.log('❌ Missing classId')
      return NextResponse.json({ error: 'Thiếu classId' }, { status: 400 })
    }

    const toIncrement = Array.isArray(incrementIds)
      ? incrementIds
      : Array.isArray(presentStudentIds)
      ? presentStudentIds
      : []

    const toDecrement = Array.isArray(decrementIds) ? decrementIds : []

    console.log('📊 Processing attendance updates:')
    console.log(`   - To increment: ${toIncrement.length} students`)
    console.log(`   - To decrement: ${toDecrement.length} students`)

    // Increment attendance
    if (toIncrement.length > 0) {
      console.log('🔄 Incrementing attendance for students:', toIncrement)
      
      try {
        await Promise.all(toIncrement.map(async (studentId) => {
          console.log(`   - Processing student: ${studentId}`)
          
          const sc = await prisma.studentClass.findFirst({ 
            where: { classId, studentId },
            include: {
              student: { select: { name: true } },
              class: { select: { name: true } }
            }
          })
          
          if (sc) {
            console.log(`     Found StudentClass: ${sc.student.name} in ${sc.class.name}`)
            console.log(`     Current attendance: ${sc.attendance}`)
            
            // Use manual increment instead of Prisma increment (which has a bug)
            const newAttendance = sc.attendance + 1
            const updatedSC = await prisma.studentClass.update({
              where: { id: sc.id },
              data: { attendance: newAttendance }
            })
            
            console.log(`     ✅ Updated attendance from ${sc.attendance} to: ${updatedSC.attendance}`)
          } else {
            console.log(`     ❌ StudentClass not found for student ${studentId} in class ${classId}`)
          }
        }))
      } catch (incrementError) {
        console.error('❌ Error incrementing attendance:', incrementError)
        throw new Error(`Failed to increment attendance: ${incrementError}`)
      }
    }

    // Decrement attendance (not below 0)
    if (toDecrement.length > 0) {
      console.log('🔄 Decrementing attendance for students:', toDecrement)
      
      try {
        await Promise.all(toDecrement.map(async (studentId) => {
          console.log(`   - Processing student: ${studentId}`)
          
          const sc = await prisma.studentClass.findFirst({ 
            where: { classId, studentId },
            include: {
              student: { select: { name: true } },
              class: { select: { name: true } }
            }
          })
          
          if (sc && sc.attendance > 0) {
            console.log(`     Found StudentClass: ${sc.student.name} in ${sc.class.name}`)
            console.log(`     Current attendance: ${sc.attendance}`)
            
            // Use manual decrement instead of Prisma decrement (which has a bug)
            const newAttendance = Math.max(0, sc.attendance - 1)
            const updatedSC = await prisma.studentClass.update({
              where: { id: sc.id },
              data: { attendance: newAttendance }
            })
            
            console.log(`     ✅ Updated attendance from ${sc.attendance} to: ${updatedSC.attendance}`)
          } else {
            console.log(`     ❌ StudentClass not found or attendance already 0 for student ${studentId}`)
          }
        }))
      } catch (decrementError) {
        console.error('❌ Error decrementing attendance:', decrementError)
        throw new Error(`Failed to decrement attendance: ${decrementError}`)
      }
    }

    console.log('✅ Attendance update completed successfully')
    return NextResponse.json({ message: 'Đã cập nhật điểm danh' })
  } catch (e) {
    console.error('❌ Error in attendance API:', e)
    
    // Check if it's a connection error
    if (e instanceof Error && e.message.includes('Engine is not yet connected')) {
      return NextResponse.json({ 
        error: 'Database connection issue. Please try again.' 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Lỗi khi lưu điểm danh. Vui lòng thử lại.' 
    }, { status: 500 })
  } finally {
    // Don't disconnect here as other requests might need the connection
    // The connection will be managed by the global Prisma instance
  }
}

