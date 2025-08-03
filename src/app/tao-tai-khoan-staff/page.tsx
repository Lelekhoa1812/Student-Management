"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { UserPlus, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function StaffRegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        }),
      })

      if (response.ok) {
        alert("Tạo tài khoản staff thành công! Vui lòng chờ xác minh từ quản trị viên.")
        router.push("/")
      } else {
        throw new Error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi tạo tài khoản staff")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* <Navbar /> */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CompanyImage position="top" />
            <div className="mx-auto mb-4">
              <UserPlus className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Tạo tài khoản staff mới
            </CardTitle>
            <CardDescription>
              Tạo tài khoản cho nhân viên mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <p>Tài khoản staff sẽ cần được xác minh bởi quản trị viên trước khi có thể sử dụng đầy đủ chức năng.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* <CompanyImage position="bottom" /> */}
    </div>
  )
} 