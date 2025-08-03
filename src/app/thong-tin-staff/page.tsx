"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { ArrowLeft, Edit, Save, X, User, Mail, Phone, MapPin, Calendar, MessageSquare, Shield } from "lucide-react"
import Link from "next/link"

interface StaffData {
  id: string
  name: string
  email: string
  phoneNumber: string
  address: string
  role: string
  createdAt: string
}

export default function StaffInfoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [staffData, setStaffData] = useState<StaffData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [editedData, setEditedData] = useState<Partial<StaffData>>({})

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role !== "staff") {
      router.push("/")
      return
    }

    fetchStaffData()
  }, [session, status, router])

  const fetchStaffData = async () => {
    try {
      const response = await fetch(`/api/staff?email=${session?.user?.email}`)
      if (response.ok) {
        const staff = await response.json()
        if (staff) {
          setStaffData(staff)
          setEditedData({
            name: staff.name,
            email: staff.email,
            phoneNumber: staff.phoneNumber,
            address: staff.address,
            role: staff.role
          })
        }
      }
    } catch (error) {
      console.error("Error fetching staff data:", error)
      setError("Không thể tải thông tin nhân viên")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({
      name: staffData?.name || "",
      email: staffData?.email || "",
      phoneNumber: staffData?.phoneNumber || "",
      address: staffData?.address || "",
      role: staffData?.role || ""
    })
  }

  const handleSave = async () => {
    if (!staffData) return

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/staff/${staffData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      })

      if (response.ok) {
        const updatedStaff = await response.json()
        setStaffData(updatedStaff)
        setIsEditing(false)
        alert("Cập nhật thông tin thành công!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra khi cập nhật")
      }
    } catch (error) {
      console.error("Error updating staff:", error)
      setError("Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof StaffData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!staffData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy thông tin nhân viên</p>
            </CardContent>
          </Card>
        </div>

        {/* <CompanyImage position="bottom" /> */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Thông tin nhân viên
              </CardTitle>
            </div>
            <CardDescription>
              Xem và cập nhật thông tin cá nhân
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ và tên */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </Label>
                {isEditing ? (
                  <Input
                    value={editedData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {staffData.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {staffData.email}
                </div>
              </div>

              {/* Vai trò */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Vai trò
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {staffData.role === "staff" ? "Nhân viên" : staffData.role}
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </Label>
                {isEditing ? (
                  <Input
                    value={editedData.phoneNumber || ""}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {staffData.phoneNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="mt-6 space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa chỉ
              </Label>
              {isEditing ? (
                <Input
                  value={editedData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  {staffData.address}
                </div>
              )}
            </div>

            {/* Ngày tạo tài khoản */}
            <div className="mt-6 space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ngày tạo tài khoản
              </Label>
              <div className="p-3 bg-gray-50 rounded-md">
                {new Date(staffData.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>

            {/* Action buttons */}
            {isEditing ? (
              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end mt-6">
                <Button onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa thông tin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CompanyImage position="bottom" />
    </div>
  )
} 