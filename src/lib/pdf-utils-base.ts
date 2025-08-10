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
      // Reduced image height and adjusted positioning for better fit with reduced margins
      const imageHeight = 30 // Reduced from 40 to 30 for better fit
      const imageWidth = pageWidth - 30
      const imageY = pageHeight - imageHeight - 20 // Adjusted positioning for reduced margins
      
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
export const getOptimizedTableStyles = (startY: number = 20): Partial<UserOptions> => {
  return {
    // Start table at specified Y position (reduced from 30 to 20 for better space usage)
    startY: startY,
    
    // Optimized margins: minimal margins for maximum content space
    // Reduced margins to eliminate excessive empty spaces
    margin: { top: 5, right: 15, bottom: 25, left: 15 },
    
    // Table layout settings - center the table horizontally
    tableWidth: 'auto',
    showFoot: 'lastPage',
    
    // Center the table horizontally on the page
    didDrawPage: (data) => {
      if (data.doc) {
        console.log('📄 Setting font in didDrawPage for page:', data.pageNumber)
        setupVietnameseFonts(data.doc)
                
        // Add footer to all pages (pagination + logo only on last page)
        const totalPages = data.doc.getNumberOfPages()
        const isLastPage = data.pageNumber === totalPages
        addCompanyFooter(data.doc, data.pageNumber, isLastPage)
      }
    },
    
    // Styles for table cells - force Vietnamese font
    styles: {
      fontSize: 9,
      cellPadding: 2, // Reduced padding for more compact layout
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
      cellPadding: 3 // Reduced from 4 to 3 for more compact header
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
        
        // Ensure consistent cell height for better table layout and prevent row splitting
        // Reduced height for more compact rows and better page utilization
        data.cell.height = 8 // Reduced from 10 to 8 for more compact layout
      }
    },
    
    // Prevent table splitting across pages - ensure rows stay together
    pageBreak: 'avoid' as const,
    
    // Additional settings to prevent row splitting
    rowPageBreak: 'avoid' as const
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

// Convert Vietnamese text to ASCII-safe characters for file naming
export const toSafeFileName = (text: string): string => {
  if (!text) return 'unknown'
  
  // Vietnamese character mapping to ASCII
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D'
  }
  
  let result = text
  
  // Replace Vietnamese characters
  for (const [vietnamese, ascii] of Object.entries(vietnameseMap)) {
    result = result.replace(new RegExp(vietnamese, 'g'), ascii)
  }
  
  // Replace other special characters and spaces with hyphens
  result = result.replace(/[^a-zA-Z0-9]/g, '-')
  
  // Remove multiple consecutive hyphens
  result = result.replace(/-+/g, '-')
  
  // Remove leading and trailing hyphens
  result = result.replace(/^-+|-+$/g, '')
  
  // Limit length and ensure it's not empty
  if (result.length > 50) {
    result = result.substring(0, 50)
  }
  
  return result || 'file'
}
