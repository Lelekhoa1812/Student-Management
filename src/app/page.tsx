"use client"

import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, BookOpen, CreditCard, Settings, UserPlus } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">
              Hệ thống Quản lý Học viên MPA
            </CardTitle>
            <CardDescription>
              Vui lòng đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full" size="lg">
                Đăng nhập
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isStaff = session.user?.role === "staff"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Hệ thống Quản lý Học viên MPA
          </h1>
          <p className="text-lg text-gray-600">
            Xin chào, {session.user?.name}!
          </p>
        </div>

        <Tabs defaultValue={isStaff ? "staff" : "student"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Học viên
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nhân viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-600" />
                    Tạo tài khoản mới
                  </CardTitle>
                  <CardDescription>
                    Đăng ký tài khoản học viên mới
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/tao-tai-khoan">
                    <Button className="w-full">Bắt đầu</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Thông tin học viên
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/thong-tin-hoc-vien">
                    <Button className="w-full">Xem thông tin</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Thi xếp lớp
                  </CardTitle>
                  <CardDescription>
                    Làm bài thi và xem kết quả xếp lớp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/thi-xep-lop">
                    <Button className="w-full">Bắt đầu thi</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Đăng ký khóa học
                  </CardTitle>
                  <CardDescription>
                    Đăng ký khóa học và thanh toán học phí
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dang-ky">
                    <Button className="w-full">Đăng ký ngay</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-600" />
                    Tạo tài khoản staff
                  </CardTitle>
                  <CardDescription>
                    Tạo tài khoản cho nhân viên mới
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/tao-tai-khoan-staff">
                    <Button className="w-full">Tạo tài khoản</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Quản lý học viên
                  </CardTitle>
                  <CardDescription>
                    Xem và quản lý danh sách học viên
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/quan-ly-hoc-vien">
                    <Button className="w-full">Quản lý</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Quản lý level và lớp
                  </CardTitle>
                  <CardDescription>
                    Xem kết quả thi và xuất báo cáo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/quan-ly-level">
                    <Button className="w-full">Quản lý</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Quản lý ghi danh
                  </CardTitle>
                  <CardDescription>
                    Theo dõi thanh toán và thống kê
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/quan-ly-ghi-danh">
                    <Button className="w-full">Quản lý</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    Cài đặt ngưỡng điểm
                  </CardTitle>
                  <CardDescription>
                    Cấu hình ngưỡng điểm cho từng level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/cai-dat-nguong">
                    <Button className="w-full">Cài đặt</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 