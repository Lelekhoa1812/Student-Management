// src/app/tro-giup/page.tsx
"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ArrowLeft, HelpCircle, Users, UserCheck, UserCog, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "@/components/ui/feedback-modal"

export default function HelpPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "user"
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  
  // Map 'user' role to 'student' for display purposes
  const displayRole = userRole === "user" ? "student" : userRole

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại trang chủ
          </Link>
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trung tâm trợ giúp
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Hướng dẫn sử dụng hệ thống quản lý học viên Hải Âu Academy
          </p>
        </div>

        {/* Role-specific content based on user role */}
        {userRole === "user" && (
          <div className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Hướng dẫn cho Học viên</span>
                  </CardTitle>
                  <CardDescription>
                    Khám phá các tính năng dành cho học viên và cách sử dụng hiệu quả
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dashboard */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📊 Dashboard - Trang chủ học viên
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/student/dashboard.png"
                          alt="Student Dashboard"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Dashboard học viên</strong> cung cấp tổng quan về:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Thông tin cá nhân và trạng thái học tập</li>
                          <li>Lịch học và lớp đang theo học</li>
                          <li>Kết quả thi và level hiện tại</li>
                          <li>Thông báo và nhắc nhở quan trọng</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Thi xếp lớp */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📝 Thi xếp lớp
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/student/thi-xep-lop/no-result.png"
                          alt="Thi xếp lớp - Chưa có kết quả"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi chưa có kết quả:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Thông báo chưa có kết quả thi</li>
                          <li>Hướng dẫn liên hệ nhân viên để được hỗ trợ</li>
                          <li>Thông tin về quy trình thi xếp lớp</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/student/thi-xep-lop/get-result.png"
                          alt="Thi xếp lớp - Có kết quả - Chưa có lớp"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi có kết quả thi nhưng chưa xếp lớp:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem điểm thi và level được xếp</li>
                          <li>Hướng dẫn đăng ký khóa học phù hợp</li>
                          <li>Liên hệ nhân viên để được xếp lớp mong muốn</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/student/thi-xep-lop/get-class.png"
                          alt="Thi xếp lớp - Có kết quả - Đã có lớp"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi đã được xếp lớp học:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Lớp học được chọn tương ứng với điểm thi</li>
                          <li>Có thể xem thông tin chi tiết về lớp học</li>
                          <li>Liên hệ nhân viên để thay đổi lớp học phù hợp</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Đăng ký khóa học */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      🎓 Đăng ký khóa học
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/student/dang-ky-khoa-hoc/no-result.png"
                          alt="Đăng ký khóa học - Không có kết quả"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi không có khóa học phù hợp:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Thông báo chưa có khóa học phù hợp</li>
                          <li>Hướng dẫn liên hệ nhân viên để được tư vấn</li>
                          <li>Thông tin về lịch khai giảng khóa học</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/student/dang-ky-khoa-hoc/get-result.png"
                          alt="Đăng ký khóa học - Có kết quả"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi có khóa học phù hợp:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách khóa học phù hợp với level</li>
                          <li>Thông tin chi tiết về khóa học</li>
                          <li>Hướng dẫn đăng ký và thanh toán</li>
                          <li>Xuất hoá đơn hoặc liên hệ nhân viên để in hoá đơn</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Hướng dẫn sử dụng hệ thống trợ giúp */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      ❓ Hướng dẫn sử dụng hệ thống trợ giúp
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          🎯 Cách sử dụng trang trợ giúp:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
                          <li><strong>Xem hướng dẫn:</strong> Cuộn xuống để xem hướng dẫn chi tiết cho từng tính năng</li>
                          <li><strong>Hình ảnh minh họa:</strong> Mỗi tính năng đều có hình ảnh minh họa để dễ hiểu</li>
                          <li><strong>Gửi phản hồi:</strong> Nếu cần hỗ trợ thêm, nhấn nút &quot;Gửi phản hồi&quot; ở cuối trang</li>
                          <li><strong>Quay lại trang chủ:</strong> Nhấn &quot;Quay lại trang chủ&quot; để trở về dashboard</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          💡 Mẹo sử dụng hiệu quả:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300">
                          <li>Đọc kỹ hướng dẫn trước khi sử dụng tính năng mới</li>
                          <li>Lưu ý các biểu tượng và màu sắc để nhận biết trạng thái</li>
                          <li>Nếu gặp lỗi, hãy chụp màn hình và gửi phản hồi</li>
                          <li>Thường xuyên kiểm tra thông báo và nhắc nhở</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          ⚠️ Lưu ý quan trọng:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
                          <li>Đảm bảo đã đăng nhập trước khi sử dụng các tính năng</li>
                          <li>Lưu dữ liệu thường xuyên để tránh mất thông tin</li>
                          <li>Liên hệ nhân viên hỗ trợ nếu cần hỗ trợ khẩn cấp</li>
                          <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {userRole === "staff" && (
          <div className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span>Hướng dẫn cho Nhân viên</span>
                  </CardTitle>
                  <CardDescription>
                    Hướng dẫn sử dụng các tính năng quản lý dành cho nhân viên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dashboard */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📊 Dashboard - Trang chủ nhân viên
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/dashboard.png"
                          alt="Staff Dashboard"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Dashboard nhân viên</strong> hiển thị:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Tổng quan học viên và lớp học</li>
                          <li>Thống kê thanh toán và nhắc nhở</li>
                          <li>Nhiệm vụ cần thực hiện trong ngày</li>
                          <li>Thông báo quan trọng từ quản lý</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quản lý học viên */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      👥 Quản lý học viên
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-hoc-vien/view.png"
                          alt="Xem thông tin học viên"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Xem thông tin học viên:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem chi tiết thông tin cá nhân</li>
                          <li>Lịch sử học tập và thanh toán</li>
                          <li>Trạng thái thi và level hiện tại</li>
                          <li>Lớp học đang theo học</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-hoc-vien/edit.png"
                          alt="Chỉnh sửa thông tin học viên"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Chỉnh sửa thông tin:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Cập nhật thông tin cá nhân</li>
                          <li>Chỉnh sửa điểm thi và level</li>
                          <li>Thay đổi lớp học</li>
                          <li>Lưu thay đổi hoặc hủy bỏ</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Hẹn lịch nhắc */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      ⏰ Hẹn lịch nhắc
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/hen-lich-nhac/notice.png"
                          alt="Tạo nhắc nhở"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Tạo nhắc nhở mới:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Tìm kiếm học viên cần nhắc nhở</li>
                          <li>Chọn loại nhắc nhở (thanh toán/thi)</li>
                          <li>Chọn phương thức (gọi/email/SMS)</li>
                          <li>Nhập nội dung và lưu nhắc nhở</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/hen-lich-nhac/edit.png"
                          alt="Chỉnh sửa nhắc nhở"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Chỉnh sửa nhắc nhở:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách nhắc nhở đã tạo</li>
                          <li>Chỉnh sửa nội dung hoặc trạng thái</li>
                          <li>Cập nhật thời gian thực hiện</li>
                          <li>Đánh dấu hoàn thành</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/hen-lich-nhac/done.png"
                          alt="Nhắc nhở hoàn thành"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Nhắc nhở hoàn thành:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách nhắc nhở đã hoàn thành</li>
                          <li>Thống kê hiệu quả nhắc nhở</li>
                          <li>Theo dõi tỷ lệ thành công</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quản lý ghi danh */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📝 Quản lý ghi danh
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-ghi-danh/paid.png"
                          alt="Thanh toán đã hoàn thành"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Thanh toán đã hoàn thành:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách học viên đã thanh toán</li>
                          <li>Chi tiết khóa học và số tiền</li>
                          <li>Ngày thanh toán và phương thức</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-ghi-danh/unpaid.png"
                          alt="Thanh toán chưa hoàn thành"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Thanh toán chưa hoàn thành:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách học viên chưa thanh toán</li>
                          <li>Thông tin khóa học và số tiền cần thanh toán</li>
                          <li>Tạo nhắc nhở thanh toán</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quản lý lớp học */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      🎓 Quản lý lớp học
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-lop-hoc/add-class.png"
                          alt="Thêm lớp học mới"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Tạo lớp học mới:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Nhập thông tin chi tiết lớp học</li>
                          <li>Chọn giáo viên phụ trách</li>
                          <li>Thiết lập lịch học và sĩ số tối đa</li>
                          <li>Kích hoạt lớp học</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-lop-hoc/edit-class.png"
                          alt="Chỉnh sửa lớp học"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Chỉnh sửa lớp học:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Cập nhật thông tin lớp học</li>
                          <li>Thay đổi giáo viên phụ trách</li>
                          <li>Điều chỉnh lịch học và sĩ số</li>
                          <li>Vô hiệu hóa lớp học nếu cần</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/quan-ly-lop-hoc/edit-student.png"
                          alt="Chỉnh sửa học viên trong lớp"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Quản lý học viên trong lớp:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách học viên trong lớp</li>
                          <li>Thêm/xóa học viên khỏi lớp</li>
                          <li>Cập nhật thông tin học viên</li>
                          <li>Theo dõi trạng thái học tập</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Phản hồi khách hàng */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      💬 Phản hồi khách hàng
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/feedback-khach-hang/no-data.png"
                          alt="Không có phản hồi"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi không có phản hồi:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Hiển thị thông báo &quot;Không có phản hồi nào&quot;</li>
                          <li>Khuyến khích khách hàng gửi phản hồi</li>
                          <li>Kiểm tra lại sau hoặc tạo phản hồi mẫu</li>
                          <li>Đảm bảo hệ thống phản hồi hoạt động tốt</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/staff/feedback-khach-hang/obtain-feedback.png"
                          alt="Xem phản hồi khách hàng"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Xem và quản lý phản hồi:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách tất cả phản hồi từ khách hàng</li>
                          <li>Phân loại theo vai trò (học viên, nhân viên, quản lý)</li>
                          <li>Xem thời gian gửi phản hồi và nội dung chi tiết</li>
                          <li>Xem ảnh chụp màn hình nếu có</li>
                          <li>Xử lý và phản hồi kịp thời</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Hướng dẫn sử dụng hệ thống trợ giúp */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      ❓ Hướng dẫn sử dụng hệ thống trợ giúp
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          🎯 Cách sử dụng trang trợ giúp:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
                          <li><strong>Xem hướng dẫn:</strong> Cuộn xuống để xem hướng dẫn chi tiết cho từng tính năng</li>
                          <li><strong>Hình ảnh minh họa:</strong> Mỗi tính năng đều có hình ảnh minh họa để dễ hiểu</li>
                          <li><strong>Gửi phản hồi:</strong> Nếu cần hỗ trợ thêm, nhấn nút &quot;Gửi phản hồi&quot; ở cuối trang</li>
                          <li><strong>Quản lý phản hồi:</strong> Truy cập &quot;Phản hồi khách hàng&quot; từ navbar để xem và xử lý phản hồi</li>
                          <li><strong>Quay lại trang chủ:</strong> Nhấn &quot;Quay lại trang chủ&quot; để trở về dashboard</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          💡 Mẹo sử dụng hiệu quả:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300">
                          <li>Đọc kỹ hướng dẫn trước khi sử dụng tính năng mới</li>
                          <li>Lưu ý các biểu tượng và màu sắc để nhận biết trạng thái</li>
                          <li>Nếu gặp lỗi, hãy chụp màn hình và gửi phản hồi</li>
                          <li>Thường xuyên kiểm tra thông báo và nhắc nhở</li>
                          <li>Xử lý phản hồi khách hàng kịp thời để cải thiện dịch vụ</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          ⚠️ Lưu ý quan trọng:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
                          <li>Đảm bảo đã đăng nhập trước khi sử dụng các tính năng</li>
                          <li>Lưu dữ liệu thường xuyên để tránh mất thông tin</li>
                          <li>Liên hệ quản lý nếu cần hỗ trợ khẩn cấp</li>
                          <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                          <li>Xử lý phản hồi khách hàng một cách chuyên nghiệp</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {userRole === "manager" && (
          <div className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCog className="h-5 w-5 text-purple-600" />
                    <span>Hướng dẫn cho Quản lý</span>
                  </CardTitle>
                  <CardDescription>
                    Hướng dẫn sử dụng các tính năng quản lý tổng thể và báo cáo KPI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dashboard */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📊 Dashboard - Trang chủ quản lý
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/dashboard.png"
                          alt="Manager Dashboard"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Dashboard quản lý</strong> cung cấp:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Tổng quan toàn bộ trung tâm</li>
                          <li>Thống kê học viên, lớp học, nhân viên</li>
                          <li>Báo cáo KPI và hiệu suất</li>
                          <li>Thông báo quan trọng cần xử lý</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* KPI Dashboard */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📈 Bảng điều khiển KPI
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/kpi/payment-today.png"
                          alt="KPI Thanh toán hôm nay"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>KPI Thanh toán:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Biểu đồ thanh toán theo từng nhân viên</li>
                          <li>Thống kê theo ngày/tuần/tháng</li>
                          <li>So sánh hiệu suất giữa các nhân viên</li>
                          <li>Phân tích xu hướng thanh toán</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/kpi/reminder-month.png"
                          alt="KPI Nhắc nhở tháng"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>KPI Nhắc nhở:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Biểu đồ nhắc nhở theo từng nhân viên</li>
                          <li>Thống kê hiệu quả nhắc nhở</li>
                          <li>Phân tích tỷ lệ thành công</li>
                          <li>Đánh giá hiệu suất nhân viên</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quản lý ghi danh */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📝 Quản lý ghi danh
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/quan-ly-ghi-danh.png"
                          alt="Quản lý ghi danh"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Quản lý ghi danh tổng thể:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem toàn bộ quá trình ghi danh</li>
                          <li>Thống kê theo lớp học và nhân viên</li>
                          <li>Theo dõi trạng thái đăng ký</li>
                          <li>Phân tích hiệu quả ghi danh</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quản lý lớp học */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      🎓 Quản lý lớp học
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/quan-ly-lop-hoc/add-class.png"
                          alt="Thêm lớp học mới"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Tạo lớp học mới:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Nhập thông tin chi tiết lớp học</li>
                          <li>Chọn giáo viên phụ trách</li>
                          <li>Thiết lập lịch học và sĩ số tối đa</li>
                          <li>Kích hoạt lớp học</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/quan-ly-lop-hoc/edit-class.png"
                          alt="Chỉnh sửa lớp học"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Chỉnh sửa lớp học:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Cập nhật thông tin lớp học</li>
                          <li>Thay đổi giáo viên phụ trách</li>
                          <li>Điều chỉnh lịch học và sĩ số</li>
                          <li>Vô hiệu hóa lớp học nếu cần</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/helper/manager/quan-ly-lop-hoc/edit-student.png"
                          alt="Chỉnh sửa học viên trong lớp"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Quản lý học viên trong lớp:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem danh sách học viên trong lớp</li>
                          <li>Thêm/xóa học viên khỏi lớp</li>
                          <li>Cập nhật thông tin học viên</li>
                          <li>Theo dõi trạng thái học tập</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Hướng dẫn sử dụng hệ thống trợ giúp */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      ❓ Hướng dẫn sử dụng hệ thống trợ giúp
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          🎯 Cách sử dụng trang trợ giúp:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
                          <li><strong>Xem hướng dẫn:</strong> Cuộn xuống để xem hướng dẫn chi tiết cho từng tính năng</li>
                          <li><strong>Hình ảnh minh họa:</strong> Mỗi tính năng đều có hình ảnh minh họa để dễ hiểu</li>
                          <li><strong>Gửi phản hồi:</strong> Nếu cần hỗ trợ thêm, nhấn nút &quot;Gửi phản hồi&quot; ở cuối trang</li>
                          <li><strong>Quản lý phản hồi:</strong> Truy cập &quot;Phản hồi khách hàng&quot; từ navbar để xem và xử lý phản hồi</li>
                          <li><strong>Quay lại trang chủ:</strong> Nhấn &quot;Quay lại trang chủ&quot; để trở về dashboard</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          💡 Mẹo sử dụng hiệu quả:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300">
                          <li>Đọc kỹ hướng dẫn trước khi sử dụng tính năng mới</li>
                          <li>Lưu ý các biểu tượng và màu sắc để nhận biết trạng thái</li>
                          <li>Nếu gặp lỗi, hãy chụp màn hình và gửi phản hồi</li>
                          <li>Thường xuyên kiểm tra thông báo và nhắc nhở</li>
                          <li>Xử lý phản hồi khách hàng kịp thời để cải thiện dịch vụ</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          ⚠️ Lưu ý quan trọng:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
                          <li>Đảm bảo đã đăng nhập trước khi sử dụng các tính năng</li>
                          <li>Lưu dữ liệu thường xuyên để tránh mất thông tin</li>
                          <li>Liên hệ đội kỹ thuật nếu cần hỗ trợ khẩn cấp</li>
                          <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                          <li>Xử lý phản hồi khách hàng một cách chuyên nghiệp</li>
                          <li>Đảm bảo bảo mật thông tin nhân viên và học viên</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Cần hỗ trợ thêm?</span>
            </CardTitle>
            <CardDescription>
              Gửi phản hồi về hệ thống, báo lỗi hoặc đề xuất cải tiến
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn để cải thiện hệ thống.
              </p>
              <Button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Gửi phản hồi</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>
    </div>
  )
} 