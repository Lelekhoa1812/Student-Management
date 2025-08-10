// src/lib/pdf-utils-base.ts
import jsPDF from 'jspdf'
import { UserOptions } from 'jspdf-autotable'
import { setupVietnameseFontsAdvanced, renderVietnameseTextSync, processVietnameseTextAdvanced } from './pdf-vietnamese-fonts'

// Company information
export const COMPANY_NAME = "Hải Âu Academy"
export const COMPANY_LOGO = "/company.JPG"

// Common interfaces
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

// Enhanced Vietnamese font setup with advanced methods
export const setupVietnameseFonts = (doc: jsPDF) => {
  return setupVietnameseFontsAdvanced(doc)
}

// Enhanced safe text rendering with advanced Vietnamese text support
export const addSafeText = (doc: jsPDF, text: string, x: number, y: number, options?: { 
  align?: 'left' | 'center' | 'right' | 'justify'; 
  baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging';
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic';
}) => {
  if (!text) return
  
  // Use the synchronous Vietnamese text rendering for compatibility
  return renderVietnameseTextSync(doc, text, x, y, options)
}

// Process Vietnamese text to ensure proper encoding for table cells
export const processVietnameseText = (text: string): string => {
  return processVietnameseTextAdvanced(text)
}

// Student PDF cover page
export const createStudentListCoverPage = (doc: jsPDF, students: StudentData[], filters: string = "") => {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  
  // Setup Vietnamese fonts
  setupVietnameseFonts(doc)
  
  // Main title - BIG and centered
  doc.setFontSize(40)
  doc.setTextColor(59, 130, 246) // Blue color
  addSafeText(doc, 'DANH SÁCH HỌC VIÊN', pageWidth / 2, pageHeight / 2 - 40, { align: 'center' })
  
  // Company name - BIG and below title
  doc.setFontSize(30)
  doc.setTextColor(255, 165, 0) // Orange color
  addSafeText(doc, COMPANY_NAME, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' })
  
  // Summary info - concise and below company name
  doc.setFontSize(15)
  doc.setTextColor(51, 65, 85)
  addSafeText(doc, `Tổng số: ${students.length} học viên`, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' })
  addSafeText(doc, `Ngày: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, pageHeight / 2 + 80, { align: 'center' })
  
  // Footer note - small and at bottom
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  addSafeText(doc, 'Hệ thống quản lý học viên Hải Âu Academy', pageWidth / 2, pageHeight - 20, { align: 'center' })
}

// Class PDF cover page
export const createClassInfoCoverPage = (doc: jsPDF, classData: ClassData) => {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  
  // Setup Vietnamese fonts
  setupVietnameseFonts(doc)
  
  // Main title - BIG and centered
  doc.setFontSize(40)
  doc.setTextColor(59, 130, 246) // Blue color
  addSafeText(doc, 'THÔNG TIN LỚP HỌC', pageWidth / 2, pageHeight / 2 - 60, { align: 'center' })
  
  // Company name - BIG and below title
  doc.setFontSize(30)
  doc.setTextColor(255, 165, 0) // Orange color
  addSafeText(doc, COMPANY_NAME, pageWidth / 2, pageHeight / 2 - 30, { align: 'center' })

  // Class name - BIG and prominent
  doc.setFontSize(20)
  doc.setTextColor(100, 100, 100)
  addSafeText(doc, classData.name, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' })
  
  // Key info - concise and below class name
  doc.setFontSize(15)
  doc.setTextColor(100, 100, 100)
  addSafeText(doc, `Level: ${classData.level} | ${classData.students.length}/${classData.maxStudents} học viên`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' })
  
  // Footer note - small and at bottom
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  addSafeText(doc, 'Hệ thống quản lý học viên', pageWidth / 2, pageHeight - 20, { align: 'center' })
}

// Add page header with pagination (only on data pages, not cover page)
export const addPageHeader = (doc: jsPDF, pageNumber: number, isCoverPage: boolean = false) => {
  try {
    // Removed top-right pagination and header line to save space
    // Pagination will now be shown in the footer of all pages
    if (!isCoverPage) {
      console.log(`📄 Page ${pageNumber} header added (no pagination - moved to footer)`)
    }
    
  } catch (error) {
    console.error('Error adding page header:', error)
  }
}

// Enhanced company footer that shows pagination on all pages, but logo only on last page
export const addCompanyFooter = (doc: jsPDF, pageNumber: number, isLastPage: boolean = false) => {
  console.log(`✅ Adding footer on page ${pageNumber} (isLastPage: ${isLastPage})`)
  
  try {
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // Always add pagination text on every page
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `${COMPANY_NAME} - Trang ${pageNumber}`, pageWidth / 2, pageHeight - 15, { align: 'center' })
    
    // Only add company logo on the last page
    if (isLastPage) {
      console.log(`🖼️ Adding company logo on last page ${pageNumber}`)
      
      // Calculate safe position for footer - ensure it doesn't overlap content
      const imageHeight = 40
      const imageWidth = pageWidth - 30
      const imageY = pageHeight - imageHeight - 25 // Moved up to make room for pagination text
      
      // Add company banner image
      doc.addImage(COMPANY_LOGO, 'JPEG', 15, imageY, imageWidth, imageHeight)
    }
    
  } catch (error) {
    console.error('Error adding company footer:', error)
    // Fallback: add simple text footer
    try {
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, `${COMPANY_NAME} - Trang ${pageNumber}`, pageWidth / 2, pageHeight - 15, { align: 'center' })
    } catch (fallbackError) {
      console.error('Even fallback footer failed:', fallbackError)
    }
  }
}

// New function to get optimized table styles for maximum space usage with proper margins
export const getOptimizedTableStyles = (startY: number = 30): Partial<UserOptions> => {
  return {
    // Start table at specified Y position (after header)
    startY: startY,
    
    // Optimized margins: small header margin, smaller footer margin for pagination only
    // Company logo only appears on last page, so we can use smaller margins
    margin: { top: 0, right: 15, bottom: 30, left: 15 },
    
    // Table layout settings
    tableWidth: 'auto',
    showFoot: 'lastPage',
    
    // Styles for table cells - force Vietnamese font
    styles: {
      fontSize: 9,
      cellPadding: 3, // Comfortable padding
      overflow: 'linebreak' as const,
      halign: 'left' as const,
      font: 'VNPro',
      fontStyle: 'normal' as const,
      lineWidth: 0.1,
      textColor: [0, 0, 0]
    },
    
    // Header styles - force Vietnamese font
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold' as const,
      font: 'VNPro',
      cellPadding: 4
    },
    
    // Body styles - force Vietnamese font
    bodyStyles: {
      font: 'VNPro',
      fontStyle: 'normal' as const
    },
    
    // Ensure proper font handling for Vietnamese text in each cell
    didParseCell: (data) => {
      if (data.doc) {
        console.log('🔤 Setting font in didParseCell for cell:', data.cell.text)
        // Setup Vietnamese fonts for each cell to ensure consistency
        setupVietnameseFonts(data.doc)
        try {
          data.doc.setFont('VNPro', 'normal')
          data.doc.setFontSize(9)
          console.log('✅ Font set to VNPro in didParseCell')
        } catch (error) {
          console.warn('⚠️ Cell font setup failed:', error)
          try {
            data.doc.setFont('helvetica', 'normal')
            data.doc.setFontSize(9)
            console.log('✅ Fallback font set to helvetica in didParseCell')
          } catch (fallbackError) {
            console.warn('⚠️ Fallback font setup failed:', fallbackError)
          }
        }
      }
    },
    
    // Ensure font is applied when drawing each cell
    didDrawCell: (data) => {
      if (data.doc) {
        console.log('🎨 Setting font in didDrawCell for cell:', data.cell.text)
        // Re-apply Vietnamese font for each cell to ensure it's used
        try {
          data.doc.setFont('VNPro', 'normal')
          data.doc.setFontSize(9)
          console.log('✅ Font set to VNPro in didDrawCell')
        } catch (error) {
          console.warn('⚠️ Cell drawing font setup failed:', error)
          try {
            data.doc.setFont('helvetica', 'normal')
            data.doc.setFontSize(9)
            console.log('✅ Fallback font set to helvetica in didDrawCell')
          } catch (fallbackError) {
            console.warn('⚠️ Fallback font setup failed:', fallbackError)
          }
        }
        
        // Ensure consistent cell height for better table layout
        if (data.row.index < 50) { // Apply to most rows
          data.cell.height = 10
        }
      }
    },
    
    // Page drawing logic with proper header and footer spacing
    didDrawPage: (data) => {
      if (data.doc) {
        console.log('📄 Setting font in didDrawPage for page:', data.pageNumber)
        setupVietnameseFonts(data.doc)
        // Add page header (not on cover page)
        const isCoverPage = data.pageNumber === 1
        addPageHeader(data.doc, data.pageNumber, isCoverPage)
        
        // Add footer to all pages (pagination + logo only on last page)
        const totalPages = data.doc.getNumberOfPages()
        const isLastPage = data.pageNumber === totalPages
        addCompanyFooter(data.doc, data.pageNumber, isLastPage)
      }
    },
    
    // Prevent table splitting across pages
    pageBreak: 'avoid' as const
  }
}

// Alternative approach: Add footer after table is completely drawn
export const addFooterAfterTable = (doc: jsPDF) => {
  try {
    const totalPages = doc.getNumberOfPages()
    console.log(`📊 Table completed. Total pages: ${totalPages}`)
    
    // Note: Footers are now added in didDrawPage callback for all pages
    // This function is kept for compatibility but footers are handled automatically
    console.log('ℹ️ Footers are now automatically added to all pages during table drawing')
  } catch (error) {
    console.error('Error in addFooterAfterTable:', error)
  }
}

// Common header rendering with improved positioning and spacing
export const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Setup Vietnamese fonts first
  setupVietnameseFonts(doc)
  
  // Add main title with larger font and better positioning
  doc.setFontSize(26)
  doc.setTextColor(59, 130, 246)
  addSafeText(doc, title, 105, 25, { align: 'center' })
  
  // Add subtitle if provided with proper spacing
  if (subtitle) {
    doc.setFontSize(16)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, subtitle, 105, 40, { align: 'center' })
  }
}
