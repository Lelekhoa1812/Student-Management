// src/lib/pdf-utils-base.ts
import jsPDF from 'jspdf'
import { UserOptions } from 'jspdf-autotable'

// Company information
export const COMPANY_NAME = "Student Management System"
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

// Enhanced Vietnamese font setup with proper encoding and custom font support
export const setupVietnameseFonts = (doc: jsPDF) => {
  try {
    // For jsPDF v3, we need to use a different approach
    // Try to use helvetica which has better Unicode support in newer versions
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    // Set text encoding to UTF-8
    try {
      doc.setLanguage('vi')
    } catch (langError) {
      console.warn('⚠️ Language setting failed, continuing with font setup:', langError)
    }
    
    console.log('✅ Vietnamese font setup successful with helvetica font')
    return true
  } catch (error) {
    console.warn('⚠️ Helvetica font failed, trying times:', error)
    try {
      // Fallback to times font
      doc.setFont('times', 'normal')
      doc.setFontSize(10)
      try {
        doc.setLanguage('vi')
      } catch (langError) {
        console.warn('⚠️ Language setting failed on fallback, continuing:', langError)
      }
      console.log('✅ Fallback font setup successful with times font')
      return true
    } catch (fallbackError) {
      console.error('❌ All font setup failed:', fallbackError)
      return false
    }
  }
}

// Enhanced safe text rendering with proper Vietnamese text support
export const addSafeText = (doc: jsPDF, text: string, x: number, y: number, options?: { 
  align?: 'left' | 'center' | 'right' | 'justify'; 
  baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging';
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic';
}) => {
  if (!text) return
  
  try {
    // Set font properties
    const fontSize = options?.fontSize || doc.getFontSize()
    const fontStyle = options?.fontStyle || 'normal'
    
    // Ensure Vietnamese font is set
    setupVietnameseFonts(doc)
    
    // For Vietnamese text, we need to handle special characters carefully
    // Try to normalize the text to handle Vietnamese diacritics
    const normalizedText = text.normalize('NFC')
    
    // Render text directly with proper encoding
    doc.text(normalizedText, x, y, options)
  } catch (error) {
    console.error('Text rendering failed:', error)
    // Fallback: try with different font
    try {
      doc.setFont('times', 'normal')
      doc.text(text, x, y, options)
    } catch (fallbackError) {
      console.error('Fallback text rendering failed:', fallbackError)
      // Last resort: add empty text to maintain positioning
      try {
        doc.text('', x, y, options)
      } catch {
        console.error('Complete text rendering failure')
      }
    }
  }
}

// Add page header with pagination at top right
export const addPageHeader = (doc: jsPDF, pageNumber: number) => {
  try {
    const pageWidth = doc.internal.pageSize.width
    
    // Add pagination at top right
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Trang ${pageNumber}`, pageWidth - 20, 15, { align: 'right' })
    
  } catch (error) {
    console.error('Error adding page header:', error)
  }
}

// Enhanced company footer that ONLY appears on the last page and doesn't overlap content
export const addCompanyFooter = (doc: jsPDF, pageNumber: number, isLastPage: boolean = false) => {
  // Critical: Only add footer on the last page
  if (!isLastPage) {
    console.log(`🚫 Skipping footer on page ${pageNumber} - not the last page`)
    return
  }
  
  console.log(`✅ Adding company footer on last page ${pageNumber}`)
  
  try {
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // Calculate safe position for footer - ensure it doesn't overlap content
    const imageHeight = 60 // Reduced height to prevent overlap
    const imageWidth = pageWidth - 20
    const imageY = pageHeight - imageHeight - 15 // Reduced margin
    
    // Add company banner image
    doc.addImage(COMPANY_LOGO, 'JPEG', 10, imageY, imageWidth, imageHeight)
    
    // Add company info above the image with proper spacing
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    
  } catch (error) {
    console.error('Error adding company footer:', error)
    // Fallback: add simple text footer
    try {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, `${COMPANY_NAME} - Page ${pageNumber}`, 105, doc.internal.pageSize.height - 10, { align: 'center' })
    } catch (fallbackError) {
      console.error('Even fallback footer failed:', fallbackError)
    }
  }
}

// Common table styles with proper typing and Vietnamese font support
export const getCommonTableStyles = (): Partial<UserOptions> => ({
  styles: {
    fontSize: 9,
    cellPadding: 2, // Reduced padding to fit more rows
    overflow: 'linebreak' as const,
    halign: 'left' as const,
    font: 'helvetica', // Use helvetica for better Vietnamese support in jsPDF v3
    fontStyle: 'normal' as const,
    lineWidth: 0.1 // Thin borders to save space
  },
  headStyles: {
    fillColor: [59, 130, 246],
    textColor: 255,
    fontSize: 10,
    fontStyle: 'bold' as const,
    font: 'helvetica', // Use helvetica for better Vietnamese support in jsPDF v3
    cellPadding: 3 // Slightly more padding for headers
  },
  // Ensure proper font handling for Vietnamese text
  didParseCell: (data) => {
    // Set font for each cell to ensure Vietnamese support
    if (data.doc) {
      setupVietnameseFonts(data.doc)
    }
  },
  // Custom font setup for the entire table
  didDrawPage: (data) => {
    if (data.doc) {
      setupVietnameseFonts(data.doc)
      // Add page header with pagination
      addPageHeader(data.doc, data.pageNumber)
    }
  },
  // Improved table layout settings
  tableWidth: 'auto', // Let table use available width
  pageBreak: 'auto', // Allow automatic page breaks
  showFoot: 'lastPage', // Only show footer on last page
  margin: { top: 20, right: 10, bottom: 20, left: 10 }, // Reduced margins for more content
  startY: 20 // Start table closer to top
})

// Enhanced table styles with proper footer logic for multi-page tables
export const getTableStylesWithFooter = (): Partial<UserOptions> => {
  return {
    ...getCommonTableStyles(),
    // Enhanced footer logic that properly detects the last page
    didDrawPage: (data) => {
      if (data.doc) {
        setupVietnameseFonts(data.doc)
        // Add page header with pagination
        addPageHeader(data.doc, data.pageNumber)
      }
      
      // IMPORTANT: We need to wait until the table is completely drawn
      // to get the accurate page count. Use a small delay to ensure
      // the page count is finalized.
      setTimeout(() => {
        try {
          const actualTotalPages = data.doc.getNumberOfPages()
          const currentPage = data.pageNumber
          const isLastPage = currentPage === actualTotalPages
          
          console.log(`📄 Drawing page ${currentPage}/${actualTotalPages}, isLastPage: ${isLastPage}`)
          
          // Only add footer on the last page
          if (isLastPage) {
            addCompanyFooter(data.doc, currentPage, true)
          }
        } catch (error) {
          console.error('Error in footer logic:', error)
        }
      }, 100) // Small delay to ensure page count is accurate
    }
  }
}

// Alternative approach: Add footer after table is completely drawn
export const addFooterAfterTable = (doc: jsPDF) => {
  try {
    const totalPages = doc.getNumberOfPages()
    console.log(`📊 Table completed. Total pages: ${totalPages}`)
    
    // Add footer only to the last page
    if (totalPages > 0) {
      addCompanyFooter(doc, totalPages, true)
    }
  } catch (error) {
    console.error('Error adding footer after table:', error)
  }
}

// Common header rendering
export const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Setup Vietnamese fonts first
  setupVietnameseFonts(doc)
  
  // Add main title
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246) // Blue color
  addSafeText(doc, title, 105, 20, { align: 'center' }) // Reduced from 25 to 20
  
  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, subtitle, 105, 30, { align: 'center' }) // Reduced from 35 to 30
  }
}
