// src/lib/pdf-utils.ts - Main export file
// This file serves as the main entry point for all PDF utilities

// Export all interfaces
export type { 
  StudentData, 
  ClassData, 
  PaymentData 
} from './pdf-utils-base'

// Export all PDF functions
export { exportStudentsToPDF } from './pdf-student-export'
export { exportClassToPDF } from './pdf-class-export'
export { exportPaymentToPDF, exportSinglePaymentToPDF } from './pdf-payment-export'

// Export utility functions if needed elsewhere
export { 
  addSafeText, 
  addCompanyFooter, 
  addPageHeader,
  addHeader,
  setupVietnameseFonts
} from './pdf-utils-base'
