'use client'

import { Button } from '@/components/ui/button'
import { exportStudentsToPDF, exportClassToPDF, exportSinglePaymentToPDF } from '@/lib/pdf-utils'
import { StudentData, ClassData, PaymentData } from '@/lib/pdf-utils'

export default function TestPDFPage() {
  const testStudents: StudentData[] = [
    {
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@example.com',
      phone: '0123456789',
      school: 'Trường THPT ABC',
      platform: 'Online',
      note: 'Học sinh giỏi',
      classes: 'Lớp 12A1',
      examScore: '85',
      examDate: '2024-01-15',
      level: 'Trung cấp'
    },
    {
      name: 'Trần Thị Bình',
      email: 'tranthibinh@example.com',
      phone: '0987654321',
      school: 'Trường THPT XYZ',
      platform: 'Offline',
      note: 'Cần hỗ trợ thêm',
      classes: 'Lớp 11B2',
      examScore: '72',
      examDate: '2024-01-20',
      level: 'Sơ cấp'
    }
  ]

  const testClass: ClassData = {
    name: 'Lớp Tiếng Anh Nâng Cao',
    level: 'Trung cấp',
    maxStudents: 25,
    paymentAmount: 2500000,
    teacherName: 'Cô Nguyễn Thị Mai',
    students: [
      {
        name: 'Lê Văn Cường',
        examScore: '88',
        paymentStatus: 'Đã thanh toán'
      },
      {
        name: 'Phạm Thị Dung',
        examScore: '92',
        paymentStatus: 'Đã thanh toán'
      }
    ]
  }

  const testPayment: PaymentData = {
    studentName: 'Hoàng Văn Em',
    className: 'Lớp Tiếng Anh Cơ Bản',
    amount: 1800000,
    paymentMethod: 'Chuyển khoản ngân hàng',
    staffName: 'Nhân viên Trần Văn Phúc',
    isPaid: true,
    paymentDate: '2024-01-25'
  }

  const handleTestStudentsPDF = () => {
    console.log('Testing students PDF export...')
    exportStudentsToPDF(testStudents, 'Test filter')
  }

  const handleTestClassPDF = () => {
    console.log('Testing class PDF export...')
    exportClassToPDF(testClass)
  }

  const handleTestPaymentPDF = () => {
    console.log('Testing payment PDF export...')
    exportSinglePaymentToPDF(testPayment)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test PDF Generation</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Students PDF</h2>
          <p className="text-gray-600 mb-3">
            Test PDF export with Vietnamese student names and data
          </p>
          <Button onClick={handleTestStudentsPDF} className="bg-blue-600 hover:bg-blue-700">
            Export Students PDF
          </Button>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Class PDF</h2>
          <p className="text-gray-600 mb-3">
            Test PDF export with Vietnamese class information
          </p>
          <Button onClick={handleTestClassPDF} className="bg-green-600 hover:bg-green-700">
            Export Class PDF
          </Button>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Payment PDF</h2>
          <p className="text-gray-600 mb-3">
            Test PDF export with Vietnamese payment details
          </p>
          <Button onClick={handleTestPaymentPDF} className="bg-purple-600 hover:bg-purple-700">
            Export Payment PDF
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Data Preview:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium">Students:</h4>
            <pre className="text-sm bg-white p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(testStudents, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Class:</h4>
            <pre className="text-sm bg-white p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(testClass, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Payment:</h4>
            <pre className="text-sm bg-white p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(testPayment, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
