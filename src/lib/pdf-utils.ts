// src/lib/pdf-utils.ts
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
  
  // Define image dimensions
  const imageHeight = 60 // Fixed height for footer banner
  const imageWidth = pageWidth - 20 // Full width minus margins
  
  // Add company banner image spanning full width at bottom
  try {
    doc.addImage(COMPANY_LOGO, 'JPEG', 10, pageHeight - imageHeight - 10, imageWidth, imageHeight)
  } catch (error) {
    console.warn('Could not load company logo:', error)
  }
  
  // Add company name and page info at bottom right, above the image
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`${COMPANY_NAME} - Trang ${pageNumber}`, pageWidth - 20, pageHeight - imageHeight - 20, { align: 'right' })
  doc.text(`Xuat ban: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth - 20, pageHeight - imageHeight - 15, { align: 'right' })
}

// Helper function to add Vietnamese text with proper encoding
const addVietnameseText = (doc: jsPDF, text: string, x: number, y: number, options?: any) => {
  try {
    // Set font to helvetica which has better support for extended characters
    doc.setFont('helvetica')
    
    // Try to add the text as-is first - this should work for most Vietnamese characters
    doc.text(text, x, y, options)
  } catch (error) {
    console.warn('Error adding Vietnamese text:', error, 'Text:', text)
    
    // If that fails, try with a simplified version that removes problematic characters
    try {
      // Remove only the most problematic characters that might cause issues
      const simplifiedText = text
        .replace(/[^\x00-\x7F\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g, '')
        .trim()
      
      if (simplifiedText && simplifiedText.length > 0) {
        doc.text(simplifiedText, x, y, options)
      } else {
        // If simplified text is empty, use the original text with basic fallback
        const fallbackText = text
          .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
          .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
          .replace(/[ìíịỉĩ]/g, 'i')
          .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
          .replace(/[ùúụủũưừứựửữ]/g, 'u')
          .replace(/[ỳýỵỷỹ]/g, 'y')
          .replace(/[đ]/g, 'd')
          .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
          .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
          .replace(/[ÌÍỊỈĨ]/g, 'I')
          .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
          .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
          .replace(/[ỲÝỴỶỸ]/g, 'Y')
          .replace(/[Đ]/g, 'D')
        
        doc.text(fallbackText, x, y, options)
      }
    } catch (fallbackError) {
      console.error('All fallback methods failed for text:', text)
      // Last resort: try to add empty string or basic text
      try {
        doc.text('', x, y, options)
      } catch (finalError) {
        console.error('Final fallback also failed:', finalError)
      }
    }
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
    addVietnameseText(doc, 'DANH SACH HOC VIEN', 105, 20, { align: 'center' })
    
    // Add subtitle with filters if any
    if (filters) {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      addVietnameseText(doc, `Bo loc: ${filters}`, 105, 30, { align: 'center' })
    }
    
    // Add export info
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addVietnameseText(doc, `Tong so hoc vien: ${students.length}`, 20, 40)
    addVietnameseText(doc, `Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 20, 45)
    
    // Prepare table data
    const tableData = students.map(student => [
      student.name,
      student.email,
      student.phone,
      student.school,
      student.platform,
      student.note || 'Khong co',
      student.classes || 'Khong co lop',
      student.examScore || 'Chua co',
      student.examDate || 'Chua co',
      student.level || 'Chua co'
    ])
    
    console.log('Table data prepared:', tableData) // Debug log
    
    // Create table with better formatting
    try {
      autoTable(doc, {
        head: [[
          'Ho ten',
          'Email', 
          'SDT',
          'Truong hoc',
          'Nen tang',
          'Ghi chu',
          'Lop hoc',
          'Diem thi',
          'Ngay thi',
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
      addVietnameseText(doc, 'Loi khi tao bang du lieu', 20, 60)
    }
    
    // Save PDF
    const fileName = `danh-sach-hoc-vien-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName) // Debug log
    
  } catch (error) {
    console.error('Error in exportStudentsToPDF:', error)
    alert('Co loi xay ra khi xuat PDF. Vui long kiem tra console de biet them chi tiet.')
  }
}

// Export class information to PDF
export const exportClassToPDF = (classData: ClassData) => {
  console.log('Exporting class to PDF:', classData) // Debug log
  
  const doc = new jsPDF('portrait', 'mm', 'a4')
  
  // Add header
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246)
  addVietnameseText(doc, 'THONG TIN LOP HOC', 105, 20, { align: 'center' })
  
  // Add class details with better spacing
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  addVietnameseText(doc, `Ten lop: ${classData.name}`, 20, 40)
  addVietnameseText(doc, `Level: ${classData.level}`, 20, 55)
  addVietnameseText(doc, `So hoc vien toi da: ${classData.maxStudents}`, 20, 70)
  addVietnameseText(doc, `Hoc phi: ${classData.paymentAmount.toLocaleString('vi-VN')} VND`, 20, 85)
  addVietnameseText(doc, `Giao vien: ${classData.teacherName || 'Chua phan cong'}`, 20, 100)
  
  // Add student table
  if (classData.students && classData.students.length > 0) {
    console.log('Students found:', classData.students) // Debug log
    
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    addVietnameseText(doc, 'Danh sach hoc vien:', 20, 120)
    
    const tableData = classData.students.map(student => [
      student.name,
      student.examScore || 'Chua co',
      student.paymentStatus
    ])
    
    console.log('Table data prepared:', tableData) // Debug log
    
    try {
      autoTable(doc, {
        head: [['Ho ten', 'Diem thi', 'Trang thai thanh toan']],
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
      addVietnameseText(doc, 'Loi khi tao bang hoc vien', 20, 140)
    }
  } else {
    console.log('No students found in class data') // Debug log
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    addVietnameseText(doc, 'Chua co hoc vien nao trong lop', 20, 120)
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
  addVietnameseText(doc, paymentData.isPaid ? 'HOA DON THANH TOAN' : 'LOI NHAC THANH TOAN', 105, 20, { align: 'center' })
  
  // Add company info
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  addVietnameseText(doc, COMPANY_NAME, 105, 30, { align: 'center' })
  
  // Add payment details with better spacing
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  addVietnameseText(doc, `Hoc vien: ${paymentData.studentName}`, 20, 50)
  addVietnameseText(doc, `Lop hoc: ${paymentData.className}`, 20, 65)
  addVietnameseText(doc, `So tien: ${paymentData.amount.toLocaleString('vi-VN')} VND`, 20, 80)
  
  if (paymentData.isPaid) {
    addVietnameseText(doc, `Phuong thuc thanh toan: ${paymentData.paymentMethod}`, 20, 95)
    addVietnameseText(doc, `Ngay thanh toan: ${paymentData.paymentDate}`, 20, 110)
    addVietnameseText(doc, `Nhan vien xu ly: ${paymentData.staffName}`, 20, 125)
    
    // Add success message
    doc.setFontSize(16)
    doc.setTextColor(34, 197, 94) // Green color
    addVietnameseText(doc, '✓ Da thanh toan thanh cong', 105, 150, { align: 'center' })
  } else {
    addVietnameseText(doc, `Ngay nhac nho: ${paymentData.paymentDate}`, 20, 95)
    addVietnameseText(doc, `Nhan vien phu trach: ${paymentData.staffName}`, 20, 110)
    
    // Add reminder message
    doc.setFontSize(16)
    doc.setTextColor(239, 68, 68) // Red color
    addVietnameseText(doc, '⚠ Can thanh toan gap', 105, 140, { align: 'center' })
  }
  
  // Add footer
  addCompanyFooter(doc, 1)
  
  // Save PDF
  const fileName = paymentData.isPaid 
    ? `hoa-don-${paymentData.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    : `loi-nhac-thanh-toan-${paymentData.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  
  doc.save(fileName)
}
