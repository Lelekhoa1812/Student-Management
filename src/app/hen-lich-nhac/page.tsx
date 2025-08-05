"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/ui/navbar"
import { Search, Plus, Edit, Trash2, Phone, Mail, MessageSquare, Calendar, AlertCircle } from "lucide-react"

interface Student {
  id: string
  name: string
  gmail: string
  phoneNumber: string
  examinationStatus: 'completed' | 'pending'
  paymentStatus: 'completed' | 'pending'
  pendingPayments: number
  pendingRegistrations: number
}

interface Reminder {
  id: string
  type: string
  platform: string
  content: string
  createdAt: string
  student: {
    id: string
    name: string
    phoneNumber: string
    gmail: string
  }
}

export default function ReminderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingReminder, setIsCreatingReminder] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [reminderForm, setReminderForm] = useState({
    type: "",
    platform: "",
    content: ""
  })

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

    fetchReminders()
  }, [session, status, router])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
    }
  }

  const searchStudents = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchStudents()
  }

  const createReminder = async () => {
    if (!selectedStudent || !reminderForm.type || !reminderForm.platform || !reminderForm.content) {
      return
    }

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reminderForm,
          studentId: selectedStudent.id
        })
      })

      if (response.ok) {
        const newReminder = await response.json()
        setReminders([newReminder, ...reminders])
        setSelectedStudent(null)
        setReminderForm({ type: "", platform: "", content: "" })
        setIsCreatingReminder(false)
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
    }
  }

  const updateReminder = async () => {
    if (!editingReminder || !reminderForm.type || !reminderForm.platform || !reminderForm.content) {
      return
    }

    try {
      const response = await fetch(`/api/reminders/${editingReminder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderForm)
      })

      if (response.ok) {
        const updatedReminder = await response.json()
        setReminders(reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r))
        setEditingReminder(null)
        setReminderForm({ type: "", platform: "", content: "" })
      }
    } catch (error) {
      console.error("Error updating reminder:", error)
    }
  }

  const deleteReminder = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lời nhắc này?")) {
      return
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReminders(reminders.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'payment' ? 'text-red-600' : 'text-blue-600'
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Hẹn lịch nhắc
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý lời nhắc và theo dõi học viên
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Tìm kiếm học viên
            </CardTitle>
            <CardDescription>
              Tìm kiếm học viên để kiểm tra trạng thái và tạo lời nhắc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="Nhập tên, email hoặc số điện thoại học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tìm..." : "Tìm kiếm"}
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Kết quả tìm kiếm:</h3>
                <div className="grid gap-4">
                  {searchResults.map((student) => (
                    <Card key={student.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{student.name}</h4>
                          <p className="text-gray-600">{student.gmail}</p>
                          <p className="text-gray-600">{student.phoneNumber}</p>
                          <div className="flex gap-4 mt-2">
                            <span className={`flex items-center gap-1 text-sm ${
                              student.examinationStatus === 'completed' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <AlertCircle className="w-4 h-4" />
                              Thi xếp lớp: {student.examinationStatus === 'completed' ? 'Hoàn thành' : 'Chưa thi'}
                            </span>
                            <span className={`flex items-center gap-1 text-sm ${
                              student.paymentStatus === 'completed' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <AlertCircle className="w-4 h-4" />
                              Thanh toán: {student.paymentStatus === 'completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsCreatingReminder(true)
                            setEditingReminder(null)
                            setReminderForm({ type: "", platform: "", content: "" })
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Tạo lời nhắc
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Reminder Modal */}
        {(isCreatingReminder || editingReminder) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>
                  {isCreatingReminder ? "Tạo lời nhắc mới" : "Chỉnh sửa lời nhắc"}
                </CardTitle>
                <CardDescription>
                  {isCreatingReminder && selectedStudent && `Cho học viên: ${selectedStudent.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Loại lời nhắc</Label>
                  <Select
                    value={reminderForm.type}
                    onValueChange={(value) => setReminderForm({ ...reminderForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại lời nhắc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Nhắc thanh toán</SelectItem>
                      <SelectItem value="examination">Nhắc thi xếp lớp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform">Nền tảng</Label>
                  <Select
                    value={reminderForm.platform}
                    onValueChange={(value) => setReminderForm({ ...reminderForm, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nền tảng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Gọi điện</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Nội dung</Label>
                  <Textarea
                    placeholder="Nhập nội dung lời nhắc..."
                    value={reminderForm.content}
                    onChange={(e) => setReminderForm({ ...reminderForm, content: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={isCreatingReminder ? createReminder : updateReminder}
                    className="flex-1"
                  >
                    {isCreatingReminder ? "Tạo lời nhắc" : "Cập nhật"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatingReminder(false)
                      setEditingReminder(null)
                      setSelectedStudent(null)
                      setReminderForm({ type: "", platform: "", content: "" })
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reminders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Danh sách lời nhắc
            </CardTitle>
            <CardDescription>
              Quản lý các lời nhắc đã tạo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có lời nhắc nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPlatformIcon(reminder.platform)}
                          <span className={`font-semibold ${getTypeColor(reminder.type)}`}>
                            {reminder.type === 'payment' ? 'Nhắc thanh toán' : 'Nhắc thi xếp lớp'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(reminder.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Học viên: <span className="font-medium">{reminder.student.name}</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Liên hệ: {reminder.student.phoneNumber} | {reminder.student.gmail}
                        </p>
                        <p className="text-gray-800">{reminder.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingReminder(reminder)
                            setIsCreatingReminder(false)
                            setReminderForm({
                              type: reminder.type,
                              platform: reminder.platform,
                              content: reminder.content
                            })
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <CompanyImage position="bottom" /> */}
    </div>
  )
} 