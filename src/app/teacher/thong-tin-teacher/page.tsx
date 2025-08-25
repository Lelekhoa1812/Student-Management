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

interface TeacherData {
  id: string
  name: string
  email: string
  phoneNumber: string
  role: string
  createdAt: string
}

export default function TeacherInfoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [editedData, setEditedData] = useState<Partial<TeacherData>>({})

  const fetchTeacherData = useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher?email=${session?.user?.email}`)
      if (response.ok) {
        const teacher = await response.json()
        if (teacher) {
          setTeacherData(teacher)
          setEditedData({
            name: teacher.name,
            email: teacher.email,
            phoneNumber: teacher.phoneNumber,
            role: teacher.role
          })
        }
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error)
      setError("Không thể tải thông tin giáo viên")
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

    if (session.user?.role !== "teacher") {
      router.push("/")
      return
    }

    fetchTeacherData()
  }, [session, status, router, fetchTeacherData])

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({
      name: teacherData?.name || "",
      email: teacherData?.email || "",
      phoneNumber: teacherData?.phoneNumber || "",
      role: teacherData?.role || ""
    })
  }

  const handleSave = async () => {
    if (!teacherData) return

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/teacher/${teacherData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      })

      if (response.ok) {
        const updatedTeacher = await response.json()
        setTeacherData(updatedTeacher)
        setIsEditing(false)
        alert("Cập nhật thông tin thành công!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra khi cập nhật")
      }
    } catch (error) {
      console.error("Error updating teacher:", error)
      setError("Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof TeacherData, value: string) => {
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

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy thông tin giáo viên</p>
            </CardContent>
          </Card>
        </div>
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
              <Users className="w-8 h-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Thông tin giáo viên
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={handleEdit} className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </Label>
                {isEditing ? (
                  <Input value={editedData.name || ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nhập họ và tên" />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{teacherData.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">{teacherData.email}</div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Vai trò
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">Giáo viên</div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </Label>
                {isEditing ? (
                  <Input value={editedData.phoneNumber || ""} onChange={(e) => handleChange("phoneNumber", e.target.value)} placeholder="Nhập số điện thoại" />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{teacherData.phoneNumber}</div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ngày tạo tài khoản
              </Label>
              <div className="p-3 bg-gray-50 rounded-md">
                {new Date(teacherData.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>

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
    </div>
  )
}

