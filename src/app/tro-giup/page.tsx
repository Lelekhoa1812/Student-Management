"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { ArrowLeft, HelpCircle, Users, UserCheck, UserCog } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HelpPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "student"

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

        {/* Role-based Tabs */}
        <Tabs defaultValue={userRole} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Học viên</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Nhân viên</span>
            </TabsTrigger>
            <TabsTrigger value="manager" className="flex items-center space-x-2">
              <UserCog className="h-4 w-4" />
              <span>Quản lý</span>
            </TabsTrigger>
          </TabsList>

          {/* Student Help Content */}
          <TabsContent value="student" className="space-y-6">
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
                          src="/imgsrc/student/dashboard.png"
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
                          src="/imgsrc/student/thi-xep-lop/get-result.png"
                          alt="Thi xếp lớp - Có kết quả"
                          width={600}
                          height={400}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Khi có kết quả thi:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Xem điểm thi và level được xếp</li>
                          <li>Thông tin chi tiết về kỳ thi</li>
                          <li>Hướng dẫn đăng ký khóa học phù hợp</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/imgsrc/student/thi-xep-lop/no-result.png"
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
                  </div>

                  {/* Đăng ký khóa học */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      🎓 Đăng ký khóa học
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/imgsrc/student/dang-ky-khoa-hoc/get-result.png"
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
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/imgsrc/student/dang-ky-khoa-hoc/no-result.png"
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Help Content */}
          <TabsContent value="staff" className="space-y-6">
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
                          src="/imgsrc/staff/dashboard.png"
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
                          src="/imgsrc/staff/quan-ly-hoc-vien/view.png"
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
                          src="/imgsrc/staff/quan-ly-hoc-vien/edit.png"
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
                          src="/imgsrc/staff/hen-lich-nhac/notice.png"
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
                          src="/imgsrc/staff/hen-lich-nhac/edit.png"
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
                          src="/imgsrc/staff/hen-lich-nhac/done.png"
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
                          src="/imgsrc/staff/quan-ly-ghi-danh/paid.png"
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
                          src="/imgsrc/staff/quan-ly-ghi-danh/unpaid.png"
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manager Help Content */}
          <TabsContent value="manager" className="space-y-6">
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
                          src="/imgsrc/manager/dashboard.png"
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
                          src="/imgsrc/manager/kpi/payment-today.png"
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
                          src="/imgsrc/manager/kpi/reminder-month.png"
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
                          src="/imgsrc/manager/quan-ly-ghi-danh.png"
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📞 Cần hỗ trợ thêm?</CardTitle>
            <CardDescription>
              Nếu bạn cần hỗ trợ thêm hoặc gặp vấn đề khi sử dụng hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Vui lòng liên hệ:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong>Email:</strong> support@haiauacademy.com</li>
                <li><strong>Điện thoại:</strong> 0123-456-789</li>
                <li><strong>Giờ làm việc:</strong> 8:00 - 17:00 (Thứ 2 - Thứ 6)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 