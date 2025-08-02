"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { CompanyImage } from "@/components/ui/company-image"
import { UserPlus, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function StudentRegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    phoneNumber: "",
    school: "",
    platformKnown: "",
    note: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    // Remove confirmPassword from the data to be sent
    const { confirmPassword, ...dataToSend } = formData

    try {
      console.log("Submitting registration data...")
      
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Registration successful:", result)
        alert("Tạo tài khoản thành công! Vui lòng đăng nhập.")
        router.push("/dang-nhap")
      } else {
        console.error("Registration failed:", result)
        setError(result.error || "Có lỗi xảy ra khi tạo tài khoản")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            {/* <CompanyImage position="top" /> */}
            <div className="mx-auto mb-4">
              <UserPlus className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-600">
              Tạo tài khoản học viên mới
            </CardTitle>
            <CardDescription>
              Vui lòng điền đầy đủ thông tin để tạo tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
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
                  <Label htmlFor="gmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="gmail"
                      name="gmail"
                      type="email"
                      required
                      value={formData.gmail}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ email của bạn"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
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
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Ngày sinh *</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại của bạn hoặc ba mẹ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">Trường học *</Label>
                  <Input
                    id="school"
                    name="school"
                    type="text"
                    required
                    value={formData.school}
                    onChange={handleChange}
                    placeholder="Nhập tên trường đang theo học"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformKnown">Bạn biết trung tâm qua kênh nào? *</Label>
                  <Input
                    id="platformKnown"
                    name="platformKnown"
                    type="text"
                    required
                    value={formData.platformKnown}
                    onChange={handleChange}
                    placeholder="Facebook, Google, Bạn bè, v.v."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ *</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ nhà"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm khi nhập học (không bắt buộc)"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  )
} 