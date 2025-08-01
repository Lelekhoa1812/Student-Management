"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StudentRegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
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

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/thong-tin-hoc-vien")
      } else {
        throw new Error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi tạo tài khoản")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
                  <Label htmlFor="phoneNumber">Số điện thoại ba mẹ *</Label>
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
                  <Label htmlFor="school">Trường học *</Label>
                  <Input
                    id="school"
                    name="school"
                    type="text"
                    required
                    value={formData.school}
                    onChange={handleChange}
                    placeholder="Nhập tên trường"
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
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformKnown">Biết qua platform *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm (không bắt buộc)"
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