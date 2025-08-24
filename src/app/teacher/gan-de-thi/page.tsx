"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/ui/navbar"
import { FileText, Users, Calendar, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Test {
  id: string
  title: string
  duration: number
  totalQuestions: number
  totalScore: number
}

interface Student {
  id: string
  name: string
  gmail: string
  school: string
  studentClasses: {
    class: {
      name: string
      level: string
    }
  }[]
}

export default function AssignTestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tests, setTests] = useState<Test[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedTest, setSelectedTest] = useState<string>("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<string>("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "teacher") {
      fetchTests()
      fetchStudents()
    }
  }, [session])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data.filter((test: Test) => test.isActive))
      } else {
        toast.error("Không thể tải danh sách đề thi")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách đề thi")
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      } else {
        toast.error("Không thể tải danh sách học viên")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách học viên")
    }
  }

  const assignTest = async () => {
    if (!selectedTest) {
      toast.error("Vui lòng chọn đề thi")
      return
    }

    if (selectedStudents.length === 0) {
      toast.error("Vui lòng chọn ít nhất một học viên")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tests/${selectedTest}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents,
          dueDate: dueDate || null
        })
      })

      if (response.ok) {
        toast.success("Giao đề thi thành công!")
        // Reset form
        setSelectedTest("")
        setSelectedStudents([])
        setDueDate("")
      } else {
        const error = await response.json()
        toast.error(error.error || "Có lỗi xảy ra khi giao đề thi")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi giao đề thi")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Giao đề thi</h1>
              <p className="text-gray-600">Chọn đề thi và giao cho học viên</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Chọn đề thi
                </CardTitle>
                <CardDescription>
                  Chọn đề thi bạn muốn giao cho học viên
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test">Đề thi *</Label>
                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đề thi" />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{test.title}</span>
                            <span className="text-sm text-gray-500">
                              {test.totalQuestions} câu hỏi • {test.duration} phút • {test.totalScore} điểm
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Hạn nộp (không bắt buộc)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Chọn học viên
                </CardTitle>
                <CardDescription>
                  Chọn học viên để giao đề thi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedStudents.length === students.length}
                      onCheckedChange={toggleAllStudents}
                    />
                    <Label htmlFor="selectAll" className="font-medium">
                      Chọn tất cả ({students.length})
                    </Label>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-sm text-gray-500">
                              {student.gmail} • {student.studentClasses[0]?.class.name} ({student.studentClasses[0]?.class.level})
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Summary */}
          {selectedTest && selectedStudents.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-green-600">Tóm tắt giao đề thi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Đề thi:</span>
                    <p className="text-gray-600">
                      {tests.find(t => t.id === selectedTest)?.title}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Số học viên:</span>
                    <p className="text-gray-600">{selectedStudents.length} học viên</p>
                  </div>
                  <div>
                    <span className="font-medium">Hạn nộp:</span>
                    <p className="text-gray-600">
                      {dueDate ? new Date(dueDate).toLocaleString('vi-VN') : 'Không có hạn'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={assignTest}
              disabled={!selectedTest || selectedStudents.length === 0 || isLoading}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Đang giao..." : "Giao đề thi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
