// src/lib/pdf-student-export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  StudentData, 
  createStudentListCoverPage,
  getOptimizedTableStyles,
  setupVietnameseFonts,
  processVietnameseText,
  addFooterAfterTable,
  addSafeText,
  toSafeFileName
} from './pdf-utils-base'

// Export all students to PDF with improved layout
export const exportStudentsToPDF = (students: StudentData[], filters: string = "") => {
  console.log('Exporting students to PDF:', { students, filters })
  
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Create beautiful cover page
    createStudentListCoverPage(doc, students, filters)
    
    // Start table on the same page after cover content
    
    // Prepare table data - process Vietnamese text to ensure proper encoding
    const tableData = students.map(student => [
      processVietnameseText(student.name),
      processVietnameseText(student.email),
      processVietnameseText(student.phone),
      processVietnameseText(student.school),
      processVietnameseText(student.platform),
      processVietnameseText(student.note || 'Không có'),
      processVietnameseText(student.classes || 'Không có lớp'),
      processVietnameseText(student.examScore || 'Chưa có'),
      processVietnameseText(student.examDate || 'Chưa có'),
      processVietnameseText(student.level || 'Chưa có')
    ])
    
    console.log('Table data prepared:', tableData)
    
    // Create table with optimized layout for maximum space usage
    try {
      // Ensure Vietnamese fonts are set up before creating the table
      setupVietnameseFonts(doc)
      
      autoTable(doc, {
        head: [[
          'Student Name',
          'Email',
          'SDT',
          'School',
          'Platform',
          'Note',
          'Classes',
          'Ex Score',
          'Test Date',
          'Level'
        ]],
        body: tableData,
        ...getOptimizedTableStyles(100), // Start table at Y=100 to avoid overlap with cover content
        columnStyles: {
          0: { cellWidth: 35 }, // Student Name - wider for better fit
          1: { cellWidth: 30 }, // Email - wider for better fit
          2: { cellWidth: 22 }, // Phone - adjusted for better fit
          3: { cellWidth: 26 }, // School - wider for better fit
          4: { cellWidth: 22 }, // Platform - adjusted for better fit
          5: { cellWidth: 22 }, // Note - adjusted for better fit
          6: { cellWidth: 22 }, // Classes - adjusted for better fit
          7: { cellWidth: 20 }, // Exam Score - adjusted for better fit
          8: { cellWidth: 22 }, // Exam Date - adjusted for better fit
          9: { cellWidth: 18 }  // Level - adjusted for better fit
        },
        // Additional settings for better table layout - force Vietnamese font
        styles: {
          fontSize: 8, // Slightly smaller font to fit more content
          cellPadding: 2, // Minimal padding to maximize space
          overflow: 'linebreak' as const,
          halign: 'left' as const,
          lineWidth: 0.1,
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'normal' as const
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold' as const,
          cellPadding: 3,
          font: 'VNPro' // Force Vietnamese font
        },
        bodyStyles: {
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'normal' as const
        },
        // Ensure proper pagination and prevent table splitting
        pageBreak: 'avoid', // Changed from 'auto' to 'avoid' to prevent row splitting
        showFoot: 'lastPage',
        // Custom row height calculation for better spacing
        didDrawCell: (data) => {
          // Ensure consistent row height for better pagination
          data.cell.height = 8 // Reduced from 9 to 8 for more compact layout
        }
      })
      
      // Re-apply Vietnamese fonts after table creation to ensure consistency
      setupVietnameseFonts(doc)
      
      // Add footer after table is completed
      addFooterAfterTable(doc)
      
    } catch (error) {
      console.error('Error creating table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, 'Lỗi khi tạo bảng dữ liệu', 20, 100)
    }
    
    // Save PDF with safe filename
    const fileName = `danh-sach-hoc-vien-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName)
    
  } catch (error) {
    console.error('Error in exportStudentsToPDF:', error)
    alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.')
  }
}
