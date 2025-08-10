// src/lib/pdf-payment-export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  PaymentData, 
  addSafeText, 
  addCompanyFooter, 
  addHeader,
  setupVietnameseFonts,
  addFooterAfterTable,
  getOptimizedTableStyles,
  processVietnameseText
} from './pdf-utils-base'

// Export single payment receipt/invoice to PDF
export const exportSinglePaymentToPDF = (paymentData: PaymentData) => {
  console.log('Exporting single payment to PDF:', paymentData)
  
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Add header with improved positioning and spacing
    addHeader(doc, paymentData.isPaid ? 'HOÁ ĐƠN THANH TOÁN' : 'LỜI NHẮC THANH TOÁN')
    
    // Add company info with better spacing from title
    doc.setFontSize(14) // Increased font size for better readability
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, 'Hải Âu Academy', 105, 55, { align: 'center' }) // Increased Y position for better spacing
    
    // Add payment details with better spacing
    doc.setFontSize(16) // Increased font size for better readability
    doc.setTextColor(0, 0, 0)
    addSafeText(doc, `Học viên: ${paymentData.studentName}`, 20, 85) // Increased Y position for better spacing
    addSafeText(doc, `Lớp học: ${paymentData.className}`, 20, 105) // Increased Y position for better spacing
    addSafeText(doc, `Số tiền: ${paymentData.amount.toLocaleString('vi-VN')} VND`, 20, 125) // Increased Y position for better spacing
    
    // Add payment status
    doc.setFontSize(18) // Increased font size for better visibility
    doc.setTextColor(paymentData.isPaid ? 34 : 220, paymentData.isPaid ? 197 : 53, 94)
    addSafeText(doc, paymentData.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN', 105, 145, { align: 'center' }) // Increased Y position for better spacing
    
    // Add payment method and staff info
    doc.setFontSize(14) // Increased font size for better readability
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Phương thức: ${paymentData.paymentMethod}`, 20, 165) // Increased Y position for better spacing
    addSafeText(doc, `Nhân viên: ${paymentData.staffName}`, 20, 185) // Increased Y position for better spacing
    
    // Add payment date if available
    if (paymentData.paymentDate) {
      addSafeText(doc, `Ngày thanh toán: ${paymentData.paymentDate}`, 20, 205) // Increased Y position for better spacing
    }
    
    // Add export info with better spacing
    doc.setFontSize(12) // Increased font size for better readability
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 225) // Increased Y position for better spacing
    
    // Add company footer
    addCompanyFooter(doc, 1, true) // Single page document, so this is the last page
    
    // Save PDF
    const fileName = `hoa-don-${paymentData.studentName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName)
    
  } catch (error) {
    console.error('Error in exportSinglePaymentToPDF:', error)
    alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.')
  }
}

// Export payment details to PDF (multiple payments)
export const exportPaymentToPDF = (payments: PaymentData[]) => {
  console.log('Exporting payments to PDF:', payments)
  
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Add header with improved positioning and spacing
    addHeader(doc, 'DANH SÁCH THANH TOÁN', `Tổng số: ${payments.length} giao dịch`)
    
    // Calculate totals
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const paidCount = payments.filter(payment => payment.isPaid).length
    const unpaidCount = payments.length - paidCount
    
    // Add payment details with better spacing from title
    doc.setFontSize(14) // Increased font size for better readability
    doc.setTextColor(59, 130, 246)
    addSafeText(doc, `Tổng số thanh toán: ${payments.length}`, 20, 120) // Increased Y position for better spacing
    addSafeText(doc, `Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ`, 20, 135) // Increased Y position for better spacing
    addSafeText(doc, `Đã thanh toán: ${paidCount}`, 20, 150) // Increased Y position for better spacing
    addSafeText(doc, `Chưa thanh toán: ${unpaidCount}`, 20, 165) // Increased Y position for better spacing
    
    // Add export info with better spacing
    doc.setFontSize(12) // Increased font size for better readability
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 180) // Increased Y position for better spacing
    
    // Prepare payment table data - process Vietnamese text to ensure proper encoding
    const tableData = payments.map(payment => [
      processVietnameseText(payment.studentName),
      processVietnameseText(payment.className),
      payment.amount.toLocaleString('vi-VN'),
      processVietnameseText(payment.paymentMethod),
      processVietnameseText(payment.staffName),
      payment.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      processVietnameseText(payment.paymentDate || 'Chưa có')
    ])
    
    console.log('Payment table data prepared:', tableData)
    
    // Create table with better formatting and improved spacing
    try {
      // Ensure Vietnamese fonts are set up before creating the table
      setupVietnameseFonts(doc)
      
      autoTable(doc, {
        head: [[
          'Họ tên học viên',
          'Lớp học',
          'Số tiền',
          'Phương thức thanh toán',
          'Nhân viên',
          'Trạng thái',
          'Ngày thanh toán'
        ]],
        body: tableData,
        ...getOptimizedTableStyles(200), // Use optimized styles starting at Y=200
        columnStyles: {
          0: { cellWidth: 32 }, // Student Name - adjusted for better fit
          1: { cellWidth: 24 }, // Class Name - adjusted for better fit
          2: { cellWidth: 20 }, // Amount
          3: { cellWidth: 28 }, // Payment Method - adjusted for better fit
          4: { cellWidth: 24 }, // Staff Name - adjusted for better fit
          5: { cellWidth: 20 }, // Payment Status
          6: { cellWidth: 24 }  // Payment Date - adjusted for better fit
        },
        // Force Vietnamese font in all table styles
        styles: {
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'normal' as const
        },
        headStyles: {
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'bold' as const
        },
        bodyStyles: {
          font: 'VNPro', // Force Vietnamese font
          fontStyle: 'normal' as const
        }
      })
      
      // Re-apply Vietnamese fonts after table creation to ensure consistency
      setupVietnameseFonts(doc)
      
      // Add footer after table is completely drawn
      addFooterAfterTable(doc)
      
    } catch (error) {
      console.error('Error creating payment table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, 'Lỗi khi tạo bảng thanh toán', 20, 195)
      
      // Still add footer even if table fails
      addFooterAfterTable(doc)
    }
    
    // Save PDF
    const fileName = `danh-sach-thanh-toan-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF saved successfully:', fileName)
    
  } catch (error) {
    console.error('Error in exportPaymentToPDF:', error)
    alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.')
  }
}
