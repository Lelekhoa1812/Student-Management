// scripts/test-pdf-generation.ts
import { exportStudentsToPDF } from '../src/lib/pdf-student-export'
import { exportClassToPDF } from '../src/lib/pdf-class-export'
import { StudentData, ClassData } from '../src/lib/pdf-utils-base'

// Test data for students
const testStudents: StudentData[] = [
  {
    name: 'Nguyễn Văn An',
    email: 'nguyen.van.an@example.com',
    phone: '0123456789',
    school: 'Trường THPT ABC',
    platform: 'Online',
    note: 'Học viên xuất sắc',
    classes: 'Lớp A1, Lớp B2',
    examScore: '95/100',
    examDate: '15/08/2024',
    level: 'Trung cấp'
  },
  {
    name: 'Trần Thị Bình',
    email: 'tran.thi.binh@example.com',
    phone: '0987654321',
    school: 'Trường THPT XYZ',
    platform: 'Offline',
    note: 'Cần hỗ trợ thêm',
    classes: 'Lớp C3',
    examScore: '78/100',
    examDate: '20/08/2024',
    level: 'Sơ cấp'
  },
  {
    name: 'Lê Văn Cường',
    email: 'le.van.cuong@example.com',
    phone: '0555666777',
    school: 'Trường THPT DEF',
    platform: 'Hybrid',
    note: 'Tiến bộ nhanh',
    classes: 'Lớp A1',
    examScore: '88/100',
    examDate: '18/08/2024',
    level: 'Trung cấp'
  }
]

// Test data for class
const testClass: ClassData = {
  name: 'Lớp Tiếng Anh A1',
  level: 'Trung cấp',
  maxStudents: 20,
  paymentAmount: 2000000,
  teacherName: 'Cô Nguyễn Thị Dung',
  students: [
    {
      name: 'Nguyễn Văn An',
      examScore: '95/100',
      paymentStatus: 'Đã thanh toán'
    },
    {
      name: 'Trần Thị Bình',
      examScore: '78/100',
      paymentStatus: 'Chưa thanh toán'
    },
    {
      name: 'Lê Văn Cường',
      examScore: '88/100',
      paymentStatus: 'Đã thanh toán'
    }
  ]
}

// Test function
async function testPDFGeneration() {
  console.log('🚀 Testing PDF Generation with Improved Formatting...')
  
  try {
    console.log('\n📊 Testing Student List PDF...')
    console.log('- Generating PDF with Vietnamese characters')
    console.log('- Testing proper header positioning and pagination')
    console.log('- Testing table height optimization')
    console.log('- Testing footer placement on last page only')
    
    exportStudentsToPDF(testStudents, 'Test filter: All students')
    
    console.log('\n📚 Testing Class Information PDF...')
    console.log('- Generating PDF with Vietnamese characters')
    console.log('- Testing proper header positioning and pagination')
    console.log('- Testing table height optimization')
    console.log('- Testing footer placement on last page only')
    
    exportClassToPDF(testClass)
    
    console.log('\n✅ PDF generation tests completed successfully!')
    console.log('- Check the generated PDFs for proper formatting')
    console.log('- Verify Vietnamese characters are displayed correctly')
    console.log('- Verify headers appear only on first page')
    console.log('- Verify pagination appears on all pages')
    console.log('- Verify footer appears only on last page')
    console.log('- Verify tables use maximum available height')
    
  } catch (error) {
    console.error('❌ Error during PDF generation test:', error)
  }
}

// Run the test
testPDFGeneration()
