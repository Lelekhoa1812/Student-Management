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
import { ArrowLeft, Edit, Save, X, User, Mail, Phone, MapPin, GraduationCap, Calendar, MessageSquare, Lock, Eye, EyeOff, FileText } from "lucide-react"
import Link from "next/link"
import { exportStudentsToPDF, StudentData as PDFStudentData } from "@/lib/pdf-utils"

interface StudentData {
  id: string
  name: string
  gmail: string
  dob: string
  address: string
  phoneNumber: string
  school: string
  platformKnown: string
  note?: string
  createdAt: string
}

export default function StudentInfoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editedData, setEditedData] = useState<Partial<StudentData>>({})
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role === "staff") {
      router.push("/")
      return
    }

    fetchStudentData()
  }, [session, status, router])

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/students?email=${session?.user?.email}`)
      if (response.ok) {
        const students = await response.json()
        if (students.length > 0) {
          const student = students[0]
          setStudentData(student)
          setEditedData({
            name: student.name,
            gmail: student.gmail,
            dob: new Date(student.dob).toISOString().split('T')[0],
            address: student.address,
            phoneNumber: student.phoneNumber,
            school: student.school,
            platformKnown: student.platformKnown,
            note: student.note || ""
          })
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Không thể tải thông tin học viên")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({
      name: studentData?.name || "",
      gmail: studentData?.gmail || "",
      dob: studentData?.dob ? new Date(studentData.dob).toISOString().split('T')[0] : "",
      address: studentData?.address || "",
      phoneNumber: studentData?.phoneNumber || "",
      school: studentData?.school || "",
      platformKnown: studentData?.platformKnown || "",
      note: studentData?.note || ""
    })
    setError("")
    setSuccess("")
  }

  const handleSave = async () => {
    if (!studentData) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/students/${studentData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      })

      if (response.ok) {
        const updatedStudent = await response.json()
        setStudentData(updatedStudent)
        setIsEditing(false)
        setSuccess("Cập nhật thông tin thành công!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra khi cập nhật")
      }
    } catch (error) {
      console.error("Error updating student:", error)
      setError("Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof StudentData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordToggle = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordSave = async () => {
    if (!studentData) return

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/students/${studentData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
          currentPassword: passwordData.currentPassword
        }),
      })

      if (response.ok) {
        setSuccess("Đổi mật khẩu thành công!")
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra khi đổi mật khẩu")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      setError("Có lỗi xảy ra khi đổi mật khẩu")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordCancel = () => {
    setIsChangingPassword(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setError("")
    setSuccess("")
  }

  // Export student info to PDF
  const handleExportToPDF = async () => {
    if (!studentData) return
    
    setIsExportingPDF(true)
    try {
      const studentDataForPDF: PDFStudentData[] = [{
        name: studentData.name,
        email: studentData.gmail,
        phone: studentData.phoneNumber,
        school: studentData.school,
        platform: studentData.platformKnown,
        note: studentData.note || '',
        classes: 'Không có lớp học', // Students can't see their classes on this page
        examScore: 'Chưa có',
        examDate: 'Chưa có',
        level: 'Chưa có'
      }]

      exportStudentsToPDF(studentDataForPDF, 'Thông tin cá nhân học viên')
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setIsExportingPDF(false)
    }
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

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy thông tin học viên</p>
            </CardContent>
          </Card>
        </div>

        <CompanyImage position="bottom" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <Card>
          <CardHeader className="text-center">
            {/* <CompanyImage position="top" /> */}
            <div className="flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Thông tin học viên
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
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
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
                    {studentData.name}
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
                  {studentData.gmail}
                </div>
              </div>

              {/* Ngày sinh */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày sinh
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedData.dob || ""}
                    onChange={(e) => handleChange("dob", e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {new Date(studentData.dob).toLocaleDateString('vi-VN')}
                  </div>
                )}
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
                    {studentData.phoneNumber}
                  </div>
                )}
              </div>

              {/* Trường học */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Trường học
                </Label>
                {isEditing ? (
                  <Input
                    value={editedData.school || ""}
                    onChange={(e) => handleChange("school", e.target.value)}
                    placeholder="Nhập tên trường"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {studentData.school}
                  </div>
                )}
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Biết qua kênh
                </Label>
                {isEditing ? (
                  <Input
                    value={editedData.platformKnown || ""}
                    onChange={(e) => handleChange("platformKnown", e.target.value)}
                    placeholder="Facebook, Google, Bạn bè, v.v."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {studentData.platformKnown}
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
                  {studentData.address}
                </div>
              )}
            </div>

            {/* Ghi chú */}
            <div className="mt-6 space-y-2">
              <Label>Ghi chú</Label>
              {isEditing ? (
                <textarea
                  value={editedData.note || ""}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="Ghi chú thêm"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {studentData.note || "Không có ghi chú"}
                </div>
              )}
            </div>

            {/* Password Change Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
                </div>
                {!isChangingPassword && (
                  <Button
                    variant="outline"
                    onClick={() => setIsChangingPassword(true)}
                    disabled={isEditing}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                )}
              </div>

              {isChangingPassword && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => handlePasswordToggle("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => handlePasswordToggle("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => handlePasswordToggle("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Change Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-2">
                    <Button variant="outline" onClick={handlePasswordCancel} disabled={isSaving}>
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                    <Button onClick={handlePasswordSave} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Đang lưu..." : "Lưu mật khẩu"}
                    </Button>
                  </div>
                </div>
              )}
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
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={handleExportToPDF}
                  disabled={isExportingPDF}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExportingPDF ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang xuất PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Xuất PDF thông tin
                    </>
                  )}
                </Button>
                <Button onClick={handleEdit} disabled={isChangingPassword}>
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