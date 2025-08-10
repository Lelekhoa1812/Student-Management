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
  getTableStylesWithFooter
} from './pdf-utils-base'

// Export single payment receipt/invoice to PDF
export const exportSinglePaymentToPDF = (paymentData: PaymentData) => {
  console.log('Exporting single payment to PDF:', paymentData)
  
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    
    // Setup Vietnamese fonts first
    setupVietnameseFonts(doc)
    
    // Add header
    addHeader(doc, paymentData.isPaid ? 'HOÁ ĐƠN THANH TOÁN' : 'LỜI NHẮC THANH TOÁN')
    
    // Add company info
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, 'Hải Âu Academy', 105, 35, { align: 'center' })
    
    // Add payment details with better spacing
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    addSafeText(doc, `Học viên: ${paymentData.studentName}`, 20, 55)
    addSafeText(doc, `Lớp học: ${paymentData.className}`, 20, 70)
    addSafeText(doc, `Số tiền: ${paymentData.amount.toLocaleString('vi-VN')} VND`, 20, 85)
    
    if (paymentData.isPaid) {
      addSafeText(doc, `Phương thức thanh toán: ${paymentData.paymentMethod}`, 20, 100)
      addSafeText(doc, `Ngày thanh toán: ${paymentData.paymentDate}`, 20, 115)
      addSafeText(doc, `Nhân viên xử lý: ${paymentData.staffName}`, 20, 130)
      
      // Add success message
      doc.setFontSize(16)
      doc.setTextColor(34, 197, 94) // Green color
      addSafeText(doc, 'Đã thanh toán thành công', 105, 160, { align: 'center' })
    } else {
      addSafeText(doc, `Ngày nhắc nhở: ${paymentData.paymentDate}`, 20, 100)
      addSafeText(doc, `Nhân viên phụ trách: ${paymentData.staffName}`, 20, 115)
      
      // Add reminder message
      doc.setFontSize(16)
      doc.setTextColor(239, 68, 68) // Red color
      addSafeText(doc, 'Quý khách hàng cần thanh toán hoá đơn', 105, 150, { align: 'center' })
    }
    
    // Add footer (this is a single page document, so always show footer)
    addCompanyFooter(doc, 1, true)
    
    // Save PDF
    const fileName = paymentData.isPaid 
      ? `hoa-don-${paymentData.studentName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      : `loi-nhac-thanh-toan-${paymentData.studentName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    
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
    
    // Add header
    addHeader(doc, 'DANH SÁCH THANH TOÁN', `Tổng số: ${payments.length} giao dịch`)
    
    // Calculate totals
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const paidCount = payments.filter(payment => payment.isPaid).length
    const unpaidCount = payments.length - paidCount
    
    // Add payment details
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    addSafeText(doc, `Tổng số thanh toán: ${payments.length}`, 20, 100) // Reduced from 105 to 100
    addSafeText(doc, `Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ`, 20, 110) // Reduced from 115 to 110
    addSafeText(doc, `Đã thanh toán: ${paidCount}`, 20, 120) // Reduced from 125 to 120
    addSafeText(doc, `Chưa thanh toán: ${unpaidCount}`, 20, 130) // Reduced from 135 to 130
    
    // Add export info
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    addSafeText(doc, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 140) // Reduced from 145 to 140
    
    // Prepare payment table data
    const tableData = payments.map(payment => [
      payment.studentName,
      payment.className,
      payment.amount.toLocaleString('vi-VN'),
      payment.paymentMethod,
      payment.staffName,
      payment.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      payment.paymentDate || 'Chưa có'
    ])
    
    console.log('Payment table data prepared:', tableData)
    
    // Create table with better formatting and improved footer positioning
    try {
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
        startY: 150, // Increased from 120 to 150 to create more space
        ...getTableStylesWithFooter(), // Use the improved table styles with footer
        columnStyles: {
          0: { cellWidth: 32 }, // Student Name - adjusted for better fit
          1: { cellWidth: 24 }, // Class Name - adjusted for better fit
          2: { cellWidth: 20 }, // Amount
          3: { cellWidth: 28 }, // Payment Method - adjusted for better fit
          4: { cellWidth: 24 }, // Staff Name - adjusted for better fit
          5: { cellWidth: 20 }, // Payment Status
          6: { cellWidth: 24 }  // Payment Date - adjusted for better fit
        },
        // Improved spacing and table layout
        margin: { top: 150, right: 10, bottom: 30, left: 10 }, // Increased top margin to match startY
        pageBreak: 'auto',
        showFoot: 'lastPage',
        tableWidth: 'auto' // Let table use available width efficiently
      })
      
      // Add footer after table is completely drawn
      addFooterAfterTable(doc)
      
    } catch (error) {
      console.error('Error creating payment table:', error)
      // Fallback: add text manually if table fails
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      addSafeText(doc, 'Lỗi khi tạo bảng thanh toán', 20, 140)
      
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
