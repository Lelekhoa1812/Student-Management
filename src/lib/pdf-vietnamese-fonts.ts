// src/lib/pdf-vietnamese-fonts.ts
import jsPDF from 'jspdf'

// Vietnamese font setup using custom TTF fonts for proper Vietnamese character support
export const setupVietnameseFontsAdvanced = (doc: jsPDF) => {
  try {
    // Try to add custom fonts for better Vietnamese support
    try {
      // Add Noto Sans font which has excellent Vietnamese support
      // Use the correct public path for the font file with cache buster
      const timestamp = Date.now()
      const fontPath = `/vnpro.ttf?v=${timestamp}`
      
      console.log('🔤 Attempting to load VNPro font from:', fontPath)
      doc.addFont(fontPath, 'VNPro', 'normal')
      doc.setFont('VNPro', 'normal')
      
      console.log('✅ Vietnamese font setup successful with custom VNPro TTF')
      return true
    } catch (vnproError) {
      console.warn('⚠️ VNPro font failed, trying Inter Vietnamese:', vnproError)
      
      try {
        // Try Inter Vietnamese font with cache buster
        const timestamp = Date.now()
        const fontPath = `/inter-vietnamese.woff2?v=${timestamp}`
        
        console.log('🔤 Attempting to load Inter Vietnamese font from:', fontPath)
        doc.addFont(fontPath, 'InterVietnamese', 'normal')
        doc.setFont('InterVietnamese', 'normal')
        
        console.log('✅ Vietnamese font setup successful with custom Inter Vietnamese font')
        return true
      } catch (interError) {
        console.warn('⚠️ Inter Vietnamese font failed, falling back to helvetica:', interError)
      }
    }
    
    // Fallback to helvetica which has improved Unicode support in jsPDF v3
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    // Set the document to use UTF-8 encoding for Vietnamese characters
    try {
      // Try to set language to Vietnamese for better character support
      doc.setLanguage('vi')
      console.log('✅ Vietnamese font setup successful with helvetica + UTF-8 + vi language')
    } catch (langError) {
      console.warn('⚠️ Language setting failed, using helvetica font only:', langError)
      console.log('✅ Vietnamese font setup successful with helvetica')
    }
    
    return true
  } catch (error) {
    console.warn('⚠️ Helvetica font failed, trying times:', error)
    try {
      // Fallback to times font which also has good Unicode support
      doc.setFont('times', 'normal')
      doc.setFontSize(10)
      console.log('✅ Fallback font setup successful with times font')
      return true
    } catch (fallbackError) {
      console.error('❌ All font setup methods failed:', fallbackError)
      return false
    }
  }
}

// Text rendering with proper Vietnamese support
export const renderVietnameseTextSync = (doc: jsPDF, text: string, x: number, y: number, options?: {
  align?: 'left' | 'center' | 'right' | 'justify'
  baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging'
  fontSize?: number
  fontStyle?: 'normal' | 'bold' | 'italic'
  maxWidth?: number
}) => {
  if (!text) return false
  
  try {
    // Setup Vietnamese fonts first
    setupVietnameseFontsAdvanced(doc)
    
    // Normalize Vietnamese text to ensure proper encoding
    // Use NFC normalization to combine characters properly
    const normalizedText = text.normalize('NFC')
    
    // Render text directly - custom fonts should handle Vietnamese characters perfectly
    doc.text(normalizedText, x, y, options)
    return true
  } catch (error) {
    console.warn('Text rendering failed:', error)
    
    try {
      // Fallback: try with basic font setup
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(options?.fontSize || 10)
      doc.text(text, x, y, options)
      return true
    } catch (fallbackError) {
      console.error('All text rendering methods failed:', fallbackError)
      return false
    }
  }
}

// Process Vietnamese text for table cells - keep original text without mapping
export const processVietnameseTextAdvanced = (text: string): string => {
  if (!text) return text
  
  try {
    // Normalize Vietnamese diacritics to ensure proper encoding
    // Don't replace characters - keep original Vietnamese text
    // Use NFC normalization to combine characters properly
    return text.normalize('NFC')
  } catch (error) {
    console.warn('Text processing failed:', error)
    return text
  }
}

// Legacy async function for compatibility
export const renderVietnameseText = async (doc: jsPDF, text: string, x: number, y: number, options?: {
  align?: 'left' | 'center' | 'right' | 'justify'
  baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging'
  fontSize?: number
  fontStyle?: 'normal' | 'bold' | 'italic'
  maxWidth?: number
  useImageFallback?: boolean
}) => {
  return renderVietnameseTextSync(doc, text, x, y, options)
}

// Legacy function for compatibility
export const createVietnameseTextImage = async (text: string, options: {
  fontSize?: number
  fontFamily?: string
  width?: number
  height?: number
  backgroundColor?: string
  textColor?: string
} = {}) => {
  console.warn('createVietnameseTextImage is deprecated - using direct text rendering instead')
  return null
}
