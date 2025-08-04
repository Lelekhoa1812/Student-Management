import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await prisma.$connect()
    
    const { id } = await params
    console.log("=== DELETE STUDENT START ===")
    console.log("Student ID:", id)

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        exams: true,
        payments: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

    // Delete related records first (cascade delete will handle most, but we'll be explicit)
    await prisma.payment.deleteMany({
      where: { user_id: id }
    })

    await prisma.exam.deleteMany({
      where: { studentId: id }
    })

    // Delete the student
    await prisma.student.delete({
      where: { id }
    })

    console.log("=== DELETE STUDENT SUCCESS ===")
    return NextResponse.json({ message: "Xóa học viên thành công" })
  } catch (error) {
    console.error("=== DELETE STUDENT ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa học viên" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await prisma.$connect()
    
    const { id } = await params
    console.log("=== UPDATE STUDENT START ===")
    console.log("Student ID:", id)

    const body = await request.json()
    console.log("Update data:", { ...body, password: "[REDACTED]" })

    const {
      name,
      dob,
      address,
      phoneNumber,
      school,
      platformKnown,
      note,
      classId,
      classIds,
      password,
      currentPassword
    } = body

    // Get current student to check if classId is changing
    const currentStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true
      }
    })

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

    // Handle password update if provided
    if (password && currentPassword) {
      console.log("1. Validating current password...")
      
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentStudent.password
      )

      if (!isCurrentPasswordValid) {
        console.log("❌ Current password is incorrect")
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không đúng" },
          { status: 400 }
        )
      }

      console.log("✅ Current password validated, hashing new password...")
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // Update only password
      const updatedStudent = await prisma.student.update({
        where: { id: id },
        data: {
          password: hashedPassword
        },
        include: {
          class: true
        }
      })
      
      console.log("✅ Password updated successfully")
      return NextResponse.json(updatedStudent)
    }

    // Handle regular profile update
    // Validate required fields
    if (!name || !dob || !address || !phoneNumber || !school || !platformKnown) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    console.log("1. Updating student record...")
    // Update Student record
    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: {
        name,
        dob: new Date(dob),
        address,
        phoneNumber,
        school,
        platformKnown,
        note: note || null,
        classId: classId || null,
      },
      include: {
        class: true,
        studentClasses: {
          include: {
            class: true
          }
        }
      }
    })
    console.log("✅ Student updated:", updatedStudent.id)

    // Handle multiple class assignments
    if (classIds && Array.isArray(classIds)) {
      console.log("2. Handling multiple class assignments...")
      
      // Get current class assignments
      const currentClassAssignments = await prisma.studentClass.findMany({
        where: { studentId: id }
      })
      
      const currentClassIds = currentClassAssignments.map(sc => sc.classId)
      const newClassIds = classIds.filter(Boolean)
      
      // Remove classes that are no longer assigned
      const classesToRemove = currentClassIds.filter(classId => !newClassIds.includes(classId))
      if (classesToRemove.length > 0) {
        console.log("Removing classes:", classesToRemove)
        await prisma.studentClass.deleteMany({
          where: {
            studentId: id,
            classId: { in: classesToRemove }
          }
        })
        
        // Delete payments for removed classes
        await prisma.payment.deleteMany({
          where: {
            user_id: id,
            class_id: { in: classesToRemove }
          }
        })
      }
      
      // Add new class assignments
      const classesToAdd = newClassIds.filter(classId => !currentClassIds.includes(classId))
      if (classesToAdd.length > 0) {
        console.log("Adding classes:", classesToAdd)
        
        // Create StudentClass records
        for (const classId of classesToAdd) {
          try {
            await prisma.studentClass.create({
              data: {
                studentId: id,
                classId
              }
            })
          } catch (error) {
            // Ignore duplicate key errors
            if (error instanceof Error && error.message.includes('Unique constraint')) {
              console.log(`StudentClass already exists for student ${id} and class ${classId}`)
            } else {
              throw error
            }
          }
        }
        
        // Create payments for new classes
        for (const classId of classesToAdd) {
          const newClass = await prisma.class.findUnique({
            where: { id: classId }
          })
          
          if (newClass && newClass.payment_amount) {
            const firstStaff = await prisma.staff.findFirst()
            
            if (firstStaff) {
              await prisma.payment.create({
                data: {
                  class_id: classId,
                  payment_amount: newClass.payment_amount,
                  user_id: id,
                  payment_method: "Chưa thanh toán",
                  staff_assigned: firstStaff.id,
                  have_paid: false
                }
              })
              console.log("✅ Payment created for class:", newClass.name)
            }
          }
        }
      }
    } else if (classId !== undefined) {
      // Handle single class assignment (backward compatibility)
      const oldClassId = currentStudent.classId
      const newClassId = classId || null

      if (oldClassId !== newClassId) {
        console.log("2. Single class assignment changed, handling payments...")
        
        // If student was removed from a class, delete existing payment
        if (oldClassId) {
          console.log("Deleting payment for old class:", oldClassId)
          await prisma.payment.deleteMany({
            where: {
              class_id: oldClassId,
              user_id: id
            }
          })
        }

        // If student was assigned to a new class, create payment
        if (newClassId) {
          console.log("Creating payment for new class:", newClassId)
          
          // Get class details to check if it has payment_amount
          const newClass = await prisma.class.findUnique({
            where: { id: newClassId }
          })

          if (newClass && newClass.payment_amount) {
            // Get the first available staff member for the placeholder
            const firstStaff = await prisma.staff.findFirst()
            
            if (firstStaff) {
              // Create payment record with actual staff ID
              await prisma.payment.create({
                data: {
                  class_id: newClassId,
                  payment_amount: newClass.payment_amount,
                  user_id: id,
                  payment_method: "Chưa thanh toán",
                  staff_assigned: firstStaff.id,
                  have_paid: false
                }
              })
              console.log("✅ Payment created for new class with staff:", firstStaff.name)
            } else {
              console.log("⚠️ No staff members found, skipping payment creation")
            }
          } else {
            console.log("⚠️ No payment_amount set for class, skipping payment creation")
          }
        }
      }
    }

    console.log("=== UPDATE STUDENT SUCCESS ===")
    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("=== UPDATE STUDENT ERROR ===")
    console.error("Error:", error)

    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          { error: "Không tìm thấy học viên" },
          { status: 404 }
        )
      }

      if (error.message.includes("Invalid date")) {
        return NextResponse.json(
          { error: "Ngày sinh không hợp lệ" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await prisma.$connect()
    
    const { id } = await params
    console.log("=== GET STUDENT BY ID ===")
    console.log("Student ID:", id)

    const student = await prisma.student.findUnique({
      where: { id: id },
    })

    if (!student) {
      console.log("❌ Student not found")
      return NextResponse.json(
        { error: "Không tìm thấy học viên" },
        { status: 404 }
      )
    }

    console.log("✅ Student found:", student.id)
    return NextResponse.json(student)
  } catch (error) {
    console.error("=== GET STUDENT ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy thông tin học viên" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 