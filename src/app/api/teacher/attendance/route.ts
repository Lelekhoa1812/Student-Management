import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
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
          
          const updatedSC = await prisma.studentClass.update({
            where: { id: sc.id },
            data: { attendance: { increment: 1 } }
          })
          
          console.log(`     ✅ Updated attendance to: ${updatedSC.attendance}`)
        } else {
          console.log(`     ❌ StudentClass not found for student ${studentId} in class ${classId}`)
        }
      }))
    }

    // Decrement attendance (not below 0)
    if (toDecrement.length > 0) {
      console.log('🔄 Decrementing attendance for students:', toDecrement)
      
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
          
          const updatedSC = await prisma.studentClass.update({
            where: { id: sc.id },
            data: { attendance: { decrement: 1 } }
          })
          
          console.log(`     ✅ Updated attendance to: ${updatedSC.attendance}`)
        } else {
          console.log(`     ❌ StudentClass not found or attendance already 0 for student ${studentId}`)
        }
      }))
    }

    console.log('✅ Attendance update completed successfully')
    return NextResponse.json({ message: 'Đã cập nhật điểm danh' })
  } catch (e) {
    console.error('❌ Error in attendance API:', e)
    return NextResponse.json({ error: 'Lỗi khi lưu điểm danh' }, { status: 500 })
  }
}

