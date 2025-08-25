"use client"

import { useState, useEffect } from "react"
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
  description?: string
  duration: number
  totalQuestions: number
  totalScore: number
}

interface Student {
  id: string
  name: string
  gmail: string
  school?: string
  class: {
    name: string
  }
}

export default function GiaoDeThiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedTest, setSelectedTest] = useState<string>("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [assignmentType, setAssignmentType] = useState<'class' | 'individual'>('class')
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [classes, setClasses] = useState<{ id: string; name: string; level: string }[]>([])

  useEffect(() => {
    if (session?.user?.role === "teacher") {
      fetchTests()
      fetchClasses()
      
      // Check for testId in URL query params
      const urlParams = new URLSearchParams(window.location.search)
      const testId = urlParams.get('testId')
      if (testId) {
        setSelectedTest(testId)
      }
    }
  }, [session])

  useEffect(() => {
    if (assignmentType === 'class' && selectedClass) {
      fetchStudentsByClass()
    } else if (assignmentType === 'individual') {
      fetchAllStudents()
    }
  }, [assignmentType, selectedClass])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data)
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      toast.error('Không thể tải danh sách đề thi')
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Không thể tải danh sách lớp học')
    }
  }

  const fetchStudentsByClass = async () => {
    try {
      setIsFetching(true)
      const response = await fetch(`/api/classes/${selectedClass}/students`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students by class:', error)
      toast.error('Không thể tải danh sách học viên trong lớp')
    } finally {
      setIsFetching(false)
    }
  }

  const fetchAllStudents = async () => {
    try {
      setIsFetching(true)
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching all students:', error)
      toast.error('Không thể tải danh sách học viên')
    } finally {
      setIsFetching(false)
    }
  }

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  const handleAssignTest = async () => {
    if (!selectedTest) {
      toast.error('Vui lòng chọn đề thi')
      return
    }

    if (selectedStudents.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học viên')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tests/${selectedTest}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          dueDate: dueDate || undefined
        }),
      })

      if (response.ok) {
        toast.success(`Đã giao đề thi cho ${selectedStudents.length} học viên`)
        setSelectedTest("")
        setSelectedStudents([])
        setDueDate("")
        router.push('/teacher/danh-sach-de-thi')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Không thể giao đề thi')
      }
    } catch (error) {
      console.error('Error assigning test:', error)
      toast.error('Không thể giao đề thi')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    router.push('/dang-nhap')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/danh-sach-de-thi')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giao đề thi</h1>
          <p className="text-gray-600">Chọn đề thi và giao cho học viên</p>
        </div>

        {/* Assignment Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Loại giao đề thi
            </CardTitle>
            <CardDescription>
              Chọn cách giao đề thi cho học viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="class-assignment"
                  checked={assignmentType === 'class'}
                  onCheckedChange={() => {
                    setAssignmentType('class')
                    setSelectedStudents([])
                    setSelectedClass("")
                  }}
                />
                <Label htmlFor="class-assignment">Giao cho cả lớp</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="individual-assignment"
                  checked={assignmentType === 'individual'}
                  onCheckedChange={() => {
                    setAssignmentType('individual')
                    setSelectedStudents([])
                    setSelectedClass("")
                  }}
                />
                <Label htmlFor="individual-assignment">Giao cho từng học viên cụ thể</Label>
              </div>

              {assignmentType === 'class' && (
                <div>
                  <Label htmlFor="class">Chọn lớp</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Chọn đề thi
              </CardTitle>
              <CardDescription>
                Chọn đề thi bạn muốn giao cho học viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test">Đề thi</Label>
                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đề thi" />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTest && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {tests.find(t => t.id === selectedTest)?.title}
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Thời gian: {tests.find(t => t.id === selectedTest)?.duration} phút</p>
                      <p>Số câu hỏi: {tests.find(t => t.id === selectedTest)?.totalQuestions}</p>
                      <p>Điểm tối đa: {tests.find(t => t.id === selectedTest)?.totalScore}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {assignmentType === 'class' ? 'Học viên trong lớp' : 'Chọn học viên'}
              </CardTitle>
              <CardDescription>
                {assignmentType === 'class' 
                  ? `Học viên trong lớp ${classes.find(c => c.id === selectedClass)?.name || ''}`
                  : 'Chọn học viên cụ thể để giao đề thi'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignmentType === 'class' ? (
                  // Class assignment - show all students in class
                  <div>
                    {selectedClass ? (
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {students.map((student) => (
                          <div key={student.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                            <Checkbox
                              id={student.id}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleStudentToggle(student.id)}
                            />
                            <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                              <div>
                                <span className="font-medium">{student.name}</span>
                                <span className="text-sm text-gray-500 ml-2">({student.gmail})</span>
                              </div>
                              {student.school && (
                                <div className="text-xs text-gray-400">
                                  Trường: {student.school}
                                </div>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Vui lòng chọn lớp trước
                      </p>
                    )}
                  </div>
                ) : (
                  // Individual assignment - show all available students
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all">Chọn tất cả</Label>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => handleStudentToggle(student.id)}
                          />
                          <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                            <div>
                              <span className="font-medium">{student.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({student.gmail})</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Lớp: {student.class?.name || 'Chưa phân lớp'}
                              {student.school && ` • ${student.school}`}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {students.length === 0 && assignmentType === 'class' && selectedClass && (
                  <p className="text-gray-500 text-center py-4">
                    Không có học viên nào trong lớp này
                  </p>
                )}

                {students.length === 0 && assignmentType === 'individual' && (
                  <p className="text-gray-500 text-center py-4">
                    Không có học viên nào để chọn
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Due Date and Submit */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Cài đặt thời hạn
            </CardTitle>
            <CardDescription>
              Đặt thời hạn nộp bài (tùy chọn)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="due-date">Hạn nộp bài</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu không có thời hạn cụ thể
                </p>
              </div>

              <Button
                onClick={handleAssignTest}
                disabled={
                  !selectedTest || 
                  selectedStudents.length === 0 || 
                  (assignmentType === 'class' && !selectedClass) ||
                  isLoading
                }
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang giao đề thi...' : 'Giao đề thi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
