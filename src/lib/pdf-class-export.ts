// src/lib/pdf-class-export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  ClassData, 
  addSafeText, 
  addHeader,
  setupVietnameseFonts,
  addFooterAfterTable,
  getTableStylesWithFooter
} from './pdf-utils-base'

// Export class details to PDF
export const exportClassToPDF = (classData: ClassData) => {
  console.log('Exporting class to PDF:', classData)
  
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Add header
    addHeader(doc, 'THÔNG TIN LỚP HỌC', classData.name)
    
    // Add class information
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    addSafeText(doc, `Lớp: ${classData.name}`, 20, 110) // Reduced from 115 to 110
    addSafeText(doc, `Level: ${classData.level}`, 20, 120) // Reduced from 125 to 120
    addSafeText(doc, `Số học viên tối đa: ${classData.maxStudents}`, 20, 130) // Reduced from 135 to 130
    addSafeText(doc, `Học phí: ${classData.paymentAmount.toLocaleString('vi-VN')} VNĐ`, 20, 140) // Reduced from 145 to 140
    addSafeText(doc, `Giáo viên: ${classData.teacherName}`, 20, 150) // Reduced from 155 to 150
    
    // Add export info
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 160) // Reduced from 165 to 160
    
    // Prepare student table data
    const tableData = classData.students.map(student => [
      student.name,
      student.examScore || 'Chưa có',
      student.paymentStatus || 'Chưa thanh toán'
    ])
    
    console.log('Student table data prepared:', tableData)
    
    // Create table with better formatting and improved footer positioning
    try {
      autoTable(doc, {
        head: [[
          'Họ tên học viên',
          'Điểm thi',
          'Trạng thái thanh toán'
        ]],
        body: tableData,
        startY: 180, // Space in-between title and table
        ...getTableStylesWithFooter(), // Use the improved table styles with footer
        columnStyles: {
          0: { cellWidth: 75 }, // Student Name - adjusted for better fit
          1: { cellWidth: 30 }, // Exam Score
          2: { cellWidth: 45 }  // Payment Status - adjusted for better fit
        },
        // Improved spacing and table layout
        margin: { top: 180, right: 10, bottom: 30, left: 10 }, // Increased top margin to match startY
        pageBreak: 'auto',
        showFoot: 'lastPage',
        tableWidth: 'auto' // Let table use available width efficiently
      })
      
      // Add footer after table is completely drawn
      addFooterAfterTable(doc)
      
    } catch (error) {
      console.error('Error creating student table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, 'Lỗi khi tạo bảng danh sách học viên', 20, 150)
      
      // Still add footer even if table fails
      addFooterAfterTable(doc)
    }
    
    // Save PDF
    const fileName = `thong-tin-lop-${classData.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName)
    
  } catch (error) {
    console.error('Error in exportClassToPDF:', error)
    alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.')
  }
}
