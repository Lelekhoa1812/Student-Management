"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/ui/navbar"
import { Edit, Save, X, User, Mail, Phone, Calendar, Users } from "lucide-react"

interface CashierData {
  id: string
  name: string
  email: string
  phoneNumber: string
  role: string
  createdAt: string
}

export default function CashierInfoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cashierData, setCashierData] = useState<CashierData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [editedData, setEditedData] = useState<Partial<CashierData>>({})

  const fetchCashierData = useCallback(async () => {
    try {
      const response = await fetch(`/api/cashier?email=${session?.user?.email}`)
      if (response.ok) {
        const cashier = await response.json()
        if (cashier) {
          setCashierData(cashier)
          setEditedData({
            name: cashier.name,
            email: cashier.email,
            phoneNumber: cashier.phoneNumber,
            role: cashier.role
          })
        }
      }
    } catch (error) {
      console.error("Error fetching cashier data:", error)
      setError("Không thể tải thông tin thu ngân")
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role !== "cashier") {
      router.push("/")
      return
    }

    fetchCashierData()
  }, [session, status, router, fetchCashierData])

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({
      name: cashierData?.name || "",
      email: cashierData?.email || "",
      phoneNumber: cashierData?.phoneNumber || "",
      role: cashierData?.role || ""
    })
  }

  const handleSave = async () => {
    if (!cashierData) return

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/cashier/${cashierData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      })

      if (response.ok) {
        const updatedCashier = await response.json()
        setCashierData(updatedCashier)
        setIsEditing(false)
        alert("Cập nhật thông tin thành công!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra khi cập nhật")
      }
    } catch (error) {
      console.error("Error updating cashier:", error)
      setError("Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof CashierData, value: string) => {
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

  if (!cashierData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy thông tin thu ngân</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Thông tin Thu ngân
          </h1>
          <p className="text-lg text-gray-600">
            Xem và cập nhật thông tin tài khoản
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Quản lý thông tin tài khoản thu ngân
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    size="sm"
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900">{cashierData.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-gray-900">{cashierData.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    value={editedData.phoneNumber || ""}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900">{cashierData.phoneNumber}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Vai trò
                </Label>
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-green-800 font-medium">Thu ngân</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ngày tạo tài khoản
              </Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-gray-900">
                  {new Date(cashierData.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
