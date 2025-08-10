// src/lib/pdf-class-export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  ClassData, 
  createClassInfoCoverPage,
  getOptimizedTableStyles,
  setupVietnameseFonts,
  processVietnameseText,
  addFooterAfterTable,
  addSafeText
} from './pdf-utils-base'

// Export class details to PDF
export const exportClassToPDF = (classData: ClassData) => {
  console.log('Exporting class to PDF:', classData)
  
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Create beautiful cover page
    createClassInfoCoverPage(doc, classData)
    
    // Add a new page for the student table
    doc.addPage()
    
    // Prepare student table data - process Vietnamese text to ensure proper encoding
    const tableData = classData.students.map(student => [
      processVietnameseText(student.name),
      processVietnameseText(student.examScore || 'Chưa có'),
      processVietnameseText(student.paymentStatus || 'Chưa thanh toán')
    ])
    
    console.log('Student table data prepared:', tableData)
    
    // Create table with optimized layout for maximum space usage
    try {
      // Ensure Vietnamese fonts are set up before creating the table
      setupVietnameseFonts(doc)
      
      autoTable(doc, {
        head: [[
          'Họ tên học viên',
          'Điểm thi',
          'Trạng thái thanh toán'
        ]],
        body: tableData,
        ...getOptimizedTableStyles(35), // Start table at Y=35 (after header with proper spacing)
        columnStyles: {
          0: { cellWidth: 70 }, // Student Name - wider for better fit
          1: { cellWidth: 50 }, // Exam Score - wider for better fit
          2: { cellWidth: 70 }  // Payment Status - wider for better fit
        },
        // Additional settings for better table layout - force Vietnamese font
        styles: {
          fontSize: 9, // Appropriate font size for portrait layout
          cellPadding: 3, // Comfortable padding for portrait layout
          overflow: 'linebreak' as const,
          halign: 'left' as const,
          lineWidth: 0.1,
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'normal' as const
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold' as const,
          cellPadding: 4,
          font: 'VNPro' // Force Vietnamese font
        },
        bodyStyles: {
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'normal' as const
        },
        // Ensure proper pagination and prevent table splitting
        pageBreak: 'auto',
        showFoot: 'lastPage',
        // Custom page break logic
        didDrawPage: (data) => {
          // This will be handled by getOptimizedTableStyles
        },
        // Custom row height calculation for better spacing
        didDrawCell: (data) => {
          // Ensure consistent row height for better pagination
          data.cell.height = 11
        }
      })
      
      // Re-apply Vietnamese fonts after table creation to ensure consistency
      setupVietnameseFonts(doc)
      
      // Add footer after table is completed
      addFooterAfterTable(doc)
      
    } catch (error) {
      console.error('Error creating student table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, 'Lỗi khi tạo bảng danh sách học viên', 20, 100)
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
