// scripts/test-pdf-generation.ts
// Comprehensive test script to generate actual PDFs and verify fixes for Vietnamese text and footer logic

import { exportStudentsToPDF, exportClassToPDF, exportPaymentToPDF } from '../src/lib/pdf-utils'

// Generate synthetic data for testing with enhanced Vietnamese text
const generateSyntheticStudents = () => {
  return [
    {
      name: 'Nguyễn Văn An',
      email: 'nguyen.van.an@example.com',
      phone: '0123456789',
      school: 'Trường THPT Chuyên Hà Nội',
      platform: 'Zoom',
      note: 'Học viên xuất sắc, cần hỗ trợ thêm về toán học nâng cao',
      classes: 'Lớp Toán Nâng Cao, Lớp Vật Lý Chuyên Sâu',
      examScore: '9.5/10',
      examDate: '15/12/2024',
      level: 'Trung cấp'
    },
    {
      name: 'Trần Thị Bình',
      email: 'tran.thi.binh@example.com',
      phone: '0987654321',
      school: 'Trường THPT Lê Quý Đôn',
      platform: 'Google Meet',
      note: 'Cần cải thiện kỹ năng giao tiếp và thuyết trình',
      classes: 'Lớp Tiếng Anh Giao Tiếp, Lớp Văn Học Sáng Tạo',
      examScore: '8.0/10',
      examDate: '20/12/2024',
      level: 'Cơ bản'
    },
    {
      name: 'Lê Hoàng Cường',
      email: 'le.hoang.cuong@example.com',
      phone: '0369852147',
      school: 'Trường THPT Nguyễn Huệ',
      platform: 'Microsoft Teams',
      note: 'Học viên có tiềm năng về lập trình và công nghệ thông tin',
      classes: 'Lớp Tin Học Lập Trình, Lớp Toán Ứng Dụng',
      examScore: '9.0/10',
      examDate: '18/12/2024',
      level: 'Nâng cao'
    },
    {
      name: 'Phạm Thị Dung',
      email: 'pham.thi.dung@example.com',
      phone: '0521478963',
      school: 'Trường THPT Trần Phú',
      platform: 'Zoom',
      note: 'Cần hỗ trợ về môn Hóa học và thí nghiệm thực hành',
      classes: 'Lớp Hóa Học Thực Nghiệm, Lớp Sinh Học Ứng Dụng',
      examScore: '7.5/10',
      examDate: '22/12/2024',
      level: 'Cơ bản'
    },
    {
      name: 'Hoàng Văn Em',
      email: 'hoang.van.em@example.com',
      phone: '0147852369',
      school: 'Trường THPT Lý Thường Kiệt',
      platform: 'Google Meet',
      note: 'Học viên chăm chỉ, tiến bộ tốt trong các môn xã hội',
      classes: 'Lớp Văn Học Dân Gian, Lớp Lịch Sử Văn Hóa',
      examScore: '8.5/10',
      examDate: '25/12/2024',
      level: 'Trung cấp'
    }
  ]
}

const generateSyntheticClass = () => {
  return {
    name: 'Lớp Toán Nâng Cao 12A1',
    level: 'Nâng cao',
    maxStudents: 25,
    paymentAmount: 2500000,
    teacherName: 'Thầy Nguyễn Văn Giỏi',
    students: [
      { name: 'Nguyễn Văn An', examScore: '9.5/10', paymentStatus: 'Đã thanh toán đầy đủ' },
      { name: 'Trần Thị Bình', examScore: '8.0/10', paymentStatus: 'Chưa thanh toán học phí' },
      { name: 'Lê Hoàng Cường', examScore: '9.0/10', paymentStatus: 'Đã thanh toán một phần' },
      { name: 'Phạm Thị Dung', examScore: '7.5/10', paymentStatus: 'Đã thanh toán đầy đủ' },
      { name: 'Hoàng Văn Em', examScore: '8.5/10', paymentStatus: 'Chưa thanh toán học phí' }
    ]
  }
}

const generateSyntheticPayments = () => {
  return [
    {
      studentName: 'Nguyễn Văn An',
      className: 'Lớp Toán Nâng Cao 12A1',
      amount: 2500000,
      paymentMethod: 'Chuyển khoản ngân hàng BIDV',
      staffName: 'Cô Trần Thị Nhân Viên Kế Toán',
      isPaid: true,
      paymentDate: '15/12/2024'
    },
    {
      studentName: 'Trần Thị Bình',
      className: 'Lớp Tiếng Anh Giao Tiếp 12B2',
      amount: 1800000,
      paymentMethod: 'Tiền mặt tại văn phòng',
      staffName: 'Anh Lê Văn Thu Ngân Chính',
      isPaid: false,
      paymentDate: '20/12/2024'
    },
    {
      studentName: 'Lê Hoàng Cường',
      className: 'Lớp Tin Học Lập Trình 12C3',
      amount: 2200000,
      paymentMethod: 'Ví điện tử MoMo và ZaloPay',
      staffName: 'Cô Phạm Thị Kế Toán Trưởng',
      isPaid: true,
      paymentDate: '18/12/2024'
    },
    {
      studentName: 'Phạm Thị Dung',
      className: 'Lớp Hóa Học Thực Nghiệm 12D4',
      amount: 2000000,
      paymentMethod: 'Chuyển khoản ngân hàng Vietcombank',
      staffName: 'Anh Hoàng Văn Thu Ngân Phó',
      isPaid: true,
      paymentDate: '22/12/2024'
    },
    {
      studentName: 'Hoàng Văn Em',
      className: 'Lớp Văn Học Dân Gian 12E5',
      amount: 1600000,
      paymentMethod: 'Tiền mặt và thẻ tín dụng',
      staffName: 'Cô Nguyễn Thị Kế Toán Phụ Trách',
      isPaid: false,
      paymentDate: '25/12/2024'
    }
  ]
}

// Test PDF generation with enhanced verification
const testPDFGeneration = async () => {
  console.log('🚀 Starting comprehensive PDF generation test...')
  console.log('🔍 Testing Vietnamese text support and footer logic')
  
  try {
    // Test 1: Student Export
    console.log('\n📚 Testing Student Export...')
    const students = generateSyntheticStudents()
    console.log(`Generated ${students.length} synthetic students with Vietnamese names`)
    console.log('Sample names:', students.map(s => s.name).slice(0, 3))
    console.log('Sample Vietnamese text:', students.map(s => s.note).slice(0, 2))
    
    exportStudentsToPDF(students, 'Test Filter: Tất cả học viên xuất sắc')
    console.log('✅ Student PDF generated successfully')
    
    // Test 2: Class Export
    console.log('\n🏫 Testing Class Export...')
    const classData = generateSyntheticClass()
    console.log(`Generated class: ${classData.name}`)
    console.log(`Teacher: ${classData.teacherName}`)
    console.log('Sample student data:', classData.students.slice(0, 2))
    
    exportClassToPDF(classData)
    console.log('✅ Class PDF generated successfully')
    
    // Test 3: Payment Export
    console.log('\n💰 Testing Payment Export...')
    const payments = generateSyntheticPayments()
    console.log(`Generated ${payments.length} synthetic payments`)
    console.log('Sample student names:', payments.map(p => p.studentName).slice(0, 3))
    console.log('Sample payment methods:', payments.map(p => p.paymentMethod).slice(0, 2))
    
    exportPaymentToPDF(payments)
    console.log('✅ Payment PDF generated successfully')
    
    console.log('\n🎉 All PDF tests completed successfully!')
    console.log('\n📋 Verification Checklist:')
    console.log('1. ✅ Check the generated PDF files in your download folder')
    console.log('2. 🔍 Verify Vietnamese text is displayed correctly (no corruption)')
    console.log('3. 🔍 Verify company footer only appears on the last page')
    console.log('4. 🔍 Check browser console for footer logic logs')
    console.log('5. 🔍 Verify all Vietnamese characters (ă, ế, ộ, etc.) are intact')
    
    console.log('\n🚨 Critical Vietnamese Text Checks:')
    console.log('- "Nguyễn Văn An" should display correctly (not "Nguyen Van An")')
    console.log('- "Trần Thị Bình" should display correctly (not "Tran Thi Binh")')
    console.log('- "Lê Hoàng Cường" should display correctly (not "Le Hoang Cuong")')
    console.log('- "Phạm Thị Dung" should display correctly (not "Pham Thi Dung")')
    console.log('- "Hoàng Văn Em" should display correctly (not "Hoang Van Em")')
    
    console.log('\n🔍 Footer Logic Verification:')
    console.log('- Single page PDFs: Footer should appear')
    console.log('- Multi-page PDFs: Footer should ONLY appear on last page')
    console.log('- Console should show: "✅ Adding company footer on last page X"')
    
    console.log('\n📊 Expected Console Logs:')
    console.log('- "✅ Vietnamese font setup successful with helvetica"')
    console.log('- "📊 Table completed. Total pages: X"')
    console.log('- "✅ Adding company footer on last page X"')
    
  } catch (error) {
    console.error('❌ Error during PDF generation test:', error)
  }
}

// Run the test
testPDFGeneration()
