import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Company information
const COMPANY_NAME = "Student Management System"
const COMPANY_LOGO = "/company.JPG"

export interface StudentData {
  name: string
  email: string
  phone: string
  school: string
  platform: string
  note: string
  classes: string
  examScore: string
  examDate: string
  level: string
}

export interface ClassData {
  name: string
  level: string
  maxStudents: number
  paymentAmount: number
  teacherName: string
  students: {
    name: string
    examScore: string
    paymentStatus: string
  }[]
}

export interface PaymentData {
  studentName: string
  className: string
  amount: number
  paymentMethod: string
  staffName: string
  isPaid: boolean
  paymentDate: string
}

// Helper function to add company footer to PDF
const addCompanyFooter = (doc: jsPDF, pageNumber: number) => {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  
  // Add company logo at bottom left
  try {
    doc.addImage(COMPANY_LOGO, 'JPEG', 10, pageHeight - 30, 20, 20)
  } catch (error) {
    console.warn('Could not load company logo:', error)
  }
  
  // Add company name and page info at bottom right
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`${COMPANY_NAME} - Trang ${pageNumber}`, pageWidth - 20, pageHeight - 15, { align: 'right' })
  doc.text(`Xuất bản: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
}

// Helper function to add Vietnamese text with proper encoding
const addVietnameseText = (doc: jsPDF, text: string, x: number, y: number, options?: any) => {
  // Use a font that supports Vietnamese characters better
  doc.setFont('helvetica')
  
  // For better Vietnamese support, we'll use the default text method
  // but ensure proper font loading
  try {
    doc.text(text, x, y, options)
  } catch (error) {
    console.warn('Error adding Vietnamese text:', error, 'Text:', text)
    // Fallback: try to add text without special characters
    const fallbackText = text.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, 'a')
    doc.text(fallbackText, x, y, options)
  }
}

// Export all students to PDF
export const exportStudentsToPDF = (students: StudentData[], filters: string = "") => {
  console.log('Exporting students to PDF:', { students, filters }) // Debug log
  
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Add header
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246) // Blue color
    addVietnameseText(doc, 'DANH SÁCH HỌC VIÊN', 105, 20, { align: 'center' })
    
    // Add subtitle with filters if any
    if (filters) {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      addVietnameseText(doc, `Bộ lọc: ${filters}`, 105, 30, { align: 'center' })
    }
    
    // Add export info
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addVietnameseText(doc, `Tổng số học viên: ${students.length}`, 20, 40)
    addVietnameseText(doc, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 45)
    
    // Prepare table data
    const tableData = students.map(student => [
      student.name,
      student.email,
      student.phone,
      student.school,
      student.platform,
      student.note || 'Không có',
      student.classes || 'Không có lớp',
      student.examScore || 'Chưa có',
      student.examDate || 'Chưa có',
      student.level || 'Chưa có'
    ])
    
    console.log('Table data prepared:', tableData) // Debug log
    
    // Create table with better formatting
    try {
      autoTable(doc, {
        head: [[
          'Họ tên',
          'Email', 
          'SĐT',
          'Trường học',
          'Nền tảng',
          'Ghi chú',
          'Lớp học',
          'Điểm thi',
          'Ngày thi',
          'Level'
        ]],
        body: tableData,
        startY: 55,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left',
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 28 }, // Name
          1: { cellWidth: 38 }, // Email
          2: { cellWidth: 22 }, // Phone
          3: { cellWidth: 28 }, // School
          4: { cellWidth: 22 }, // Platform
          5: { cellWidth: 28 }, // Note
          6: { cellWidth: 32 }, // Classes
          7: { cellWidth: 18 }, // Exam Score
          8: { cellWidth: 22 }, // Exam Date
          9: { cellWidth: 22 }  // Level
        },
        didDrawPage: (data) => {
          addCompanyFooter(doc, data.pageNumber)
        }
      })
    } catch (error) {
      console.error('Error creating table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addVietnameseText(doc, 'Lỗi khi tạo bảng dữ liệu', 20, 60)
    }
    
    // Save PDF
    const fileName = `danh-sach-hoc-vien-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName) // Debug log
    
  } catch (error) {
    console.error('Error in exportStudentsToPDF:', error)
    alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.')
  }
}

// Export class information to PDF
export const exportClassToPDF = (classData: ClassData) => {
  console.log('Exporting class to PDF:', classData) // Debug log
  
  const doc = new jsPDF('portrait', 'mm', 'a4')
  
  // Add header
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246)
  addVietnameseText(doc, 'THÔNG TIN LỚP HỌC', 105, 20, { align: 'center' })
  
  // Add class details with better spacing
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  addVietnameseText(doc, `Tên lớp: ${classData.name}`, 20, 40)
  addVietnameseText(doc, `Level: ${classData.level}`, 20, 55)
  addVietnameseText(doc, `Số học viên tối đa: ${classData.maxStudents}`, 20, 70)
  addVietnameseText(doc, `Học phí: ${classData.paymentAmount.toLocaleString('vi-VN')} VNĐ`, 20, 85)
  addVietnameseText(doc, `Giáo viên: ${classData.teacherName || 'Chưa phân công'}`, 20, 100)
  
  // Add student table
  if (classData.students && classData.students.length > 0) {
    console.log('Students found:', classData.students) // Debug log
    
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    addVietnameseText(doc, 'Danh sách học viên:', 20, 120)
    
    const tableData = classData.students.map(student => [
      student.name,
      student.examScore || 'Chưa có',
      student.paymentStatus
    ])
    
    console.log('Table data prepared:', tableData) // Debug log
    
    try {
      autoTable(doc, {
        head: [['Họ tên', 'Điểm thi', 'Trạng thái thanh toán']],
        body: tableData,
        startY: 130,
        styles: {
          fontSize: 10,
          cellPadding: 4,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 70 }, // Name
          1: { cellWidth: 35 }, // Exam Score
          2: { cellWidth: 65 }  // Payment Status
        },
        didDrawPage: (data) => {
          addCompanyFooter(doc, data.pageNumber)
        }
      })
    } catch (error) {
      console.error('Error creating class table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addVietnameseText(doc, 'Lỗi khi tạo bảng học viên', 20, 140)
    }
  } else {
    console.log('No students found in class data') // Debug log
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    addVietnameseText(doc, 'Chưa có học viên nào trong lớp', 20, 120)
  }
  
  // Save PDF
  doc.save(`thong-tin-lop-${classData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}

// Export payment receipt/invoice to PDF
export const exportPaymentToPDF = (paymentData: PaymentData) => {
  const doc = new jsPDF('portrait', 'mm', 'a4')
  
  // Add header
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246)
  addVietnameseText(doc, paymentData.isPaid ? 'HOÁ ĐƠN THANH TOÁN' : 'LỜI NHẮC THANH TOÁN', 105, 20, { align: 'center' })
  
  // Add company info
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  addVietnameseText(doc, COMPANY_NAME, 105, 30, { align: 'center' })
  
  // Add payment details with better spacing
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  addVietnameseText(doc, `Học viên: ${paymentData.studentName}`, 20, 50)
  addVietnameseText(doc, `Lớp học: ${paymentData.className}`, 20, 65)
  addVietnameseText(doc, `Số tiền: ${paymentData.amount.toLocaleString('vi-VN')} VNĐ`, 20, 80)
  
  if (paymentData.isPaid) {
    addVietnameseText(doc, `Phương thức thanh toán: ${paymentData.paymentMethod}`, 20, 95)
    addVietnameseText(doc, `Ngày thanh toán: ${paymentData.paymentDate}`, 20, 110)
    addVietnameseText(doc, `Nhân viên xử lý: ${paymentData.staffName}`, 20, 125)
    
    // Add success message
    doc.setFontSize(16)
    doc.setTextColor(34, 197, 94) // Green color
    addVietnameseText(doc, '✓ Đã thanh toán thành công', 105, 150, { align: 'center' })
  } else {
    addVietnameseText(doc, `Ngày nhắc nhở: ${paymentData.paymentDate}`, 20, 95)
    addVietnameseText(doc, `Nhân viên phụ trách: ${paymentData.staffName}`, 20, 110)
    
    // Add reminder message
    doc.setFontSize(16)
    doc.setTextColor(239, 68, 68) // Red color
    addVietnameseText(doc, '⚠ Cần thanh toán gấp', 105, 140, { align: 'center' })
  }
  
  // Add footer
  addCompanyFooter(doc, 1)
  
  // Save PDF
  const fileName = paymentData.isPaid 
    ? `hoa-don-${paymentData.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    : `loi-nhac-thanh-toan-${paymentData.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  
  doc.save(fileName)
}
