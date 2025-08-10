"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { exportStudentsToPDF, exportClassToPDF, exportPaymentToPDF } from "@/lib/pdf-utils"

export default function TestPDFPage() {
  const testStudents = [
    {
      name: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      phone: "0123456789",
      school: "THPT ABC",
      platform: "React",
      note: "Học viên mới",
      classes: "Lớp React cơ bản (Beginner)",
      examScore: "85",
      examDate: "15/12/2024",
      level: "Intermediate"
    },
    {
      name: "Trần Thị B",
      email: "tranthib@gmail.com",
      phone: "0987654321",
      school: "THPT XYZ",
      platform: "Vue.js",
      note: "",
      classes: "Lớp Vue.js nâng cao (Advanced)",
      examScore: "92",
      examDate: "20/12/2024",
      level: "Advanced"
    },
    {
      name: "Lê Văn C",
      email: "levanc@gmail.com",
      phone: "0369852147",
      school: "THPT DEF",
      platform: "Angular",
      note: "Học viên cũ",
      classes: "Lớp Angular cơ bản (Beginner)",
      examScore: "78",
      examDate: "25/12/2024",
      level: "Beginner"
    }
  ]

  const testClass = {
    name: "Lớp React cơ bản",
    level: "Beginner",
    maxStudents: 20,
    paymentAmount: 5000000,
    teacherName: "Nguyễn Văn Giáo Viên",
    students: [
      { name: "Nguyễn Văn A", examScore: "85", paymentStatus: "Đã thanh toán" },
      { name: "Trần Thị B", examScore: "92", paymentStatus: "Đã thanh toán" },
      { name: "Lê Văn C", examScore: "78", paymentStatus: "Chưa thanh toán" }
    ]
  }

  const testPayment = {
    studentName: "Nguyễn Văn A",
    className: "Lớp React cơ bản",
    amount: 5000000,
    paymentMethod: "Chuyển khoản ngân hàng",
    staffName: "Nhân viên A",
    isPaid: true,
    paymentDate: "15/12/2024"
  }

  const testUnpaidPayment = {
    studentName: "Trần Thị B",
    className: "Lớp Vue.js nâng cao",
    amount: 6000000,
    paymentMethod: "Tiền mặt",
    staffName: "Nhân viên B",
    isPaid: false,
    paymentDate: "20/12/2024"
  }

  const testEmptyClass = {
    name: "Lớp mới (chưa có học viên)",
    level: "Advanced",
    maxStudents: 15,
    paymentAmount: 8000000,
    teacherName: "Giáo viên mới",
    students: []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">
          Test PDF Export Functionality
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Students Export */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Students Export
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export a sample list of students to PDF with Vietnamese text
            </p>
            <Button
              onClick={() => exportStudentsToPDF(testStudents, "Test filter: React students")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Students PDF
            </Button>
          </div>

          {/* Test Class Export */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Class Export
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export class information with students to PDF
            </p>
            <Button
              onClick={() => exportClassToPDF(testClass)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Class PDF
            </Button>
          </div>

          {/* Test Empty Class Export */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Empty Class Export
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export class information without students to PDF
            </p>
            <Button
              onClick={() => exportClassToPDF(testEmptyClass)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Empty Class PDF
            </Button>
          </div>

          {/* Test Payment Receipt */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Payment Receipt
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export a paid payment receipt to PDF
            </p>
            <Button
              onClick={() => exportPaymentToPDF(testPayment)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Receipt PDF
            </Button>
          </div>

          {/* Test Payment Reminder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Payment Reminder
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export an unpaid payment reminder to PDF
            </p>
            <Button
              onClick={() => exportPaymentToPDF(testUnpaidPayment)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Reminder PDF
            </Button>
          </div>

          {/* Test All PDFs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test All PDFs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export all types of PDFs to test functionality
            </p>
            <Button
              onClick={() => {
                exportStudentsToPDF(testStudents, "Test all")
                setTimeout(() => exportClassToPDF(testClass), 1000)
                setTimeout(() => exportPaymentToPDF(testPayment), 2000)
                setTimeout(() => exportPaymentToPDF(testUnpaidPayment), 3000)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export All PDFs
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Click any button above to test the PDF export functionality. 
            PDFs will be downloaded to your default download folder.
          </p>
          <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">
            Check the browser console for debug information about the PDF generation process.
          </p>
        </div>
      </div>
    </div>
  )
}
