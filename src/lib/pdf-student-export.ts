// src/lib/pdf-student-export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  StudentData, 
  addSafeText, 
  getTableStylesWithFooter,
  addHeader,
  setupVietnameseFonts,
  addFooterAfterTable
} from './pdf-utils-base'

// Export all students to PDF with improved layout
export const exportStudentsToPDF = (students: StudentData[], filters: string = "") => {
  console.log('Exporting students to PDF:', { students, filters })
  
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Add header
    addHeader(doc, 'DANH SÁCH HỌC VIÊN', filters ? `Bộ lọc: ${filters}` : undefined)
    
    // Add export info
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Tổng số học viên: ${students.length}`, 20, 40) // Reduced from 45 to 40
    addSafeText(doc, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 45) // Reduced from 50 to 45
    
    // Prepare table data - keep original Vietnamese text
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
    
    console.log('Table data prepared:', tableData)
    
    // Create table with better formatting and improved footer positioning
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
        startY: 60, // Increased from 55 to 60 to create more space
        ...getTableStylesWithFooter(), // Use the improved table styles with footer
        // Improved spacing and table layout
        margin: { top: 60, right: 10, bottom: 30, left: 10 }, // Increased top margin to match startY
        pageBreak: 'auto',
        showFoot: 'lastPage',
        tableWidth: 'auto' // Let table use available width efficiently
      })
      
      // Add footer after table is completely drawn
      addFooterAfterTable(doc)
      
    } catch (error) {
      console.error('Error creating table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, 'Lỗi khi tạo bảng dữ liệu', 20, 70)
      
      // Still add footer even if table fails
      addFooterAfterTable(doc)
    }
    
    // Save PDF
    const fileName = `danh-sach-hoc-vien-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName)
    
  } catch (error) {
    console.error('Error in exportStudentsToPDF:', error)
    alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.')
  }
}
