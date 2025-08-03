"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { Users, BookOpen, CreditCard, Settings, UserPlus, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center w-full">
            <CompanyImage position="top" />
            <CardTitle className="text-2xl font-bold text-blue-600">
              Hệ thống Quản lý Học viên
            </CardTitle>
            <CardDescription>
              Vui lòng đăng nhập hoặc đăng ký để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dang-nhap">
              <Button className="w-full" size="lg">
                Đăng nhập
              </Button>
            </Link>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc
                </span>
              </div>
            </div>

            <Link href="/tao-tai-khoan">
              <Button className="w-full" variant="outline" size="lg">
                Đăng ký tài khoản
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isStaff = session.user?.role === "staff"

  // Redirect based on user role
  if (isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              Hệ thống Quản lý Học viên
            </h1>
            <p className="text-lg text-gray-600">
              Xin chào, {session.user?.name}! (Nhân viên)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Quản lý học viên
                </CardTitle>
                <CardDescription>
                  Xem danh sách và thông tin học viên
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
                  Quản lý lớp học
                </CardTitle>
                <CardDescription>
                  Tạo và quản lý các lớp học
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quan-ly-lop-hoc">
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
                  Quản lý đăng ký và thanh toán
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
                  Cài đặt level
                </CardTitle>
                <CardDescription>
                  Cấu hình ngưỡng điểm xếp lớp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/cai-dat-nguong">
                  <Button className="w-full">Cài đặt</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Xem và cập nhật thông tin nhân viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/thong-tin-staff">
                  <Button className="w-full">Xem thông tin</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <CompanyImage position="bottom" />
        </div>
      </div>
    )
  }

  // Student dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Hệ thống Quản lý Học viên
          </h1>
          <p className="text-lg text-gray-600">
            Xin chào, {session.user?.name}! (Học viên)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Kiểm tra kết quả xếp lớp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/thi-xep-lop">
                <Button className="w-full">Xem điểm thi</Button>
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
                Đăng ký và thanh toán khóa học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dang-ky">
                <Button className="w-full">Đăng ký ngay</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <CompanyImage position="bottom" />
    </div>
  )
} 