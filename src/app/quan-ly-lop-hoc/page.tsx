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
import { 
  Plus, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Users, 
  BookOpen, 
  UserPlus, 
  UserMinus,
  Search,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface Class {
  id: string
  name: string
  level: string
  maxStudents: number
  teacherName?: string
  payment_amount?: number
  isActive: boolean
  createdAt: string
  _count?: {
    studentClasses: number
  }
  students?: Student[]
  studentClasses?: {
    student: Student
  }[]
}

interface Student {
  id: string
  name: string
  gmail: string
  dob: string
  phoneNumber: string
  classId?: string
  examResult?: {
    score: number
    levelEstimate: string
  }
}

interface LevelThreshold {
  id: string
  level: string
  minScore: number
  maxScore: number
}

export default function ClassManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [levels, setLevels] = useState<LevelThreshold[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingClass, setEditingClass] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

  // Modal states
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null)
  const [showGradeCheck, setShowGradeCheck] = useState(false)
  const [studentToAdd, setStudentToAdd] = useState<Student | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    maxStudents: "",
    teacherName: "",
    payment_amount: ""
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

    fetchData()
  }, [session, status, router])

  useEffect(() => {
    if (studentSearchTerm) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        student.gmail.toLowerCase().includes(studentSearchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents([])
    }
  }, [studentSearchTerm, students])

  const fetchData = async () => {
    try {
      const [classesResponse, levelsResponse, studentsResponse] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/level-thresholds"),
        fetch("/api/students")
      ])

      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        setClasses(classesData)
      }

      if (levelsResponse.ok) {
        const levelsData = await levelsResponse.json()
        setLevels(levelsData)
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Không thể tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingClass(null)
    setSelectedClass(null)
    setFormData({
      name: "",
      level: "",
      maxStudents: "",
      teacherName: "",
      payment_amount: ""
    })
    setError("")
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingClass(null)
    setSelectedClass(null)
    setShowAddStudent(false)
    setFormData({
      name: "",
      level: "",
      maxStudents: "",
      teacherName: "",
      payment_amount: ""
    })
    setError("")
  }

  const handleSave = async () => {
    if (!formData.name || !formData.level || !formData.maxStudents) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const url = editingClass ? `/api/classes` : `/api/classes`
      const method = editingClass ? "PUT" : "POST"
      const body = editingClass 
        ? { 
            id: editingClass, 
            ...formData,
            payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : null
          }
        : {
            ...formData,
            payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : null
          }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setSuccess(editingClass ? "Cập nhật lớp học thành công!" : "Tạo lớp học thành công!")
        await fetchData()
        handleCancel()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error saving class:", error)
      setError("Có lỗi xảy ra khi lưu lớp học")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (classData: Class) => {
    setEditingClass(classData.id)
    setFormData({
      name: classData.name,
      level: classData.level,
      maxStudents: classData.maxStudents.toString(),
      teacherName: classData.teacherName || "",
      payment_amount: classData.payment_amount?.toString() || ""
    })
    setError("")
  }

  const handleDelete = async (classId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lớp học này?")) return

    try {
      const response = await fetch(`/api/classes?id=${classId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Xóa lớp học thành công!")
        await fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra khi xóa")
      }
    } catch (error) {
      console.error("Error deleting class:", error)
      setError("Có lỗi xảy ra khi xóa lớp học")
    }
  }

  const handleViewStudents = async (classData: Class) => {
    try {
      const response = await fetch(`/api/classes?id=${classData.id}`)
      if (response.ok) {
        const classWithStudents = await response.json()
        setSelectedClass(classWithStudents)
      }
    } catch (error) {
      console.error("Error fetching class students:", error)
      setError("Không thể tải danh sách học viên")
    }
  }

  const handleAddStudent = async (studentId: string) => {
    if (!selectedClass) return

    // Find the student to check their grade
    const student = students.find(s => s.id === studentId)
    if (!student) return

    // Fetch exam data for this specific student
    try {
      const examResponse = await fetch(`/api/exams?email=${student.gmail}`)
      if (examResponse.ok) {
        const exams = await examResponse.json()
        const latestExam = exams[0] // Get the most recent exam
        
        // Check if student has a grade/score
        if (!latestExam || latestExam.score === 0) {
          setStudentToAdd(student)
          setShowGradeCheck(true)
          return
        }
      } else {
        // If we can't fetch exam data, assume they don't have grades
        setStudentToAdd(student)
        setShowGradeCheck(true)
        return
      }
    } catch (error) {
      console.error("Error fetching exam data:", error)
      // If there's an error fetching exam data, assume they don't have grades
      setStudentToAdd(student)
      setShowGradeCheck(true)
      return
    }

    // Proceed with adding student
    await addStudentToClass(studentId)
  }

  const addStudentToClass = async (studentId: string) => {
    if (!selectedClass) return

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          classId: selectedClass.id,
          action: "add"
        }),
      })

      if (response.ok) {
        setSuccess("Thêm học viên vào lớp thành công!")
        await fetchData()
        handleViewStudents(selectedClass)
        setShowAddStudent(false)
        setStudentSearchTerm("")
        setShowGradeCheck(false)
        setStudentToAdd(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error adding student to class:", error)
      setError("Có lỗi xảy ra khi thêm học viên")
    }
  }

  const handleRemoveStudent = async (student: Student) => {
    setStudentToRemove(student)
    setShowRemoveConfirm(true)
  }

  const confirmRemoveStudent = async () => {
    if (!selectedClass || !studentToRemove) return

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentToRemove.id,
          action: "remove"
        }),
      })

      if (response.ok) {
        setSuccess("Xóa học viên khỏi lớp thành công!")
        await fetchData()
        handleViewStudents(selectedClass)
        setShowRemoveConfirm(false)
        setStudentToRemove(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error removing student from class:", error)
      setError("Có lỗi xảy ra khi xóa học viên")
    }
  }

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.level.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className={`py-8 ${(isCreating || editingClass || selectedClass) ? 'container mx-auto px-4' : 'container mx-auto px-4 max-w-4xl'}`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Quản lý lớp học
          </h1>
          <p className="text-lg text-gray-600">
            Tạo và quản lý các lớp học
          </p>
        </div>

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

        <div className={`${(isCreating || editingClass || selectedClass) ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'flex justify-center'}`}>
          {/* Left side - Class list */}
          <div className={`${(isCreating || editingClass || selectedClass) ? 'lg:col-span-2' : 'w-full max-w-2xl'}`}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Danh sách lớp học
                    </CardTitle>
                    <CardDescription>
                      Quản lý các lớp học hiện có
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo lớp mới
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm lớp học..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Class list */}
                <div className="space-y-3">
                  {filteredClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedClass?.id === classItem.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleViewStudents(classItem)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{classItem.name}</h3>
                          <p className="text-gray-600">Level: {classItem.level}</p>
                          <p className="text-gray-600">
                            Sỉ số: {classItem._count?.studentClasses || 0}/{classItem.maxStudents}
                          </p>
                          {classItem.teacherName && (
                            <p className="text-gray-600">GV: {classItem.teacherName}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(classItem)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(classItem.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Class details and form */}
          <div className={`${(isCreating || editingClass || selectedClass) ? 'space-y-6' : 'hidden'}`}>
            {/* Create/Edit form */}
            {(isCreating || editingClass) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingClass ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tên lớp</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập tên lớp"
                    />
                  </div>

                  <div>
                    <Label>Level</Label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Chọn level</option>
                      {levels.map((level) => (
                        <option key={level.id} value={level.level}>
                          {level.level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Sỉ số tối đa</Label>
                    <Input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                      placeholder="Nhập sỉ số"
                    />
                  </div>

                  <div>
                    <Label>Tên giáo viên (tùy chọn)</Label>
                    <Input
                      value={formData.teacherName}
                      onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                      placeholder="Nhập tên giáo viên"
                    />
                  </div>

                  <div>
                    <Label>Số tiền thanh toán (tùy chọn)</Label>
                    <Input
                      type="number"
                      value={formData.payment_amount}
                      onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                      placeholder="Nhập số tiền"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Class details */}
            {selectedClass && !isCreating && !editingClass && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {selectedClass.name}
                  </CardTitle>
                  <CardDescription>
                    Level: {selectedClass.level} | Sỉ số: {selectedClass.studentClasses?.length || 0}/{selectedClass.maxStudents}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add student button */}
                    <Button
                      onClick={() => setShowAddStudent(true)}
                      className="w-full"
                      disabled={(selectedClass.studentClasses?.length || 0) >= selectedClass.maxStudents}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Thêm học viên
                    </Button>

                    {/* Student search */}
                    {showAddStudent && (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Tìm kiếm học viên..."
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        {filteredStudents.length > 0 && (
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {filteredStudents.map((student) => (
                              <div
                                key={student.id}
                                className="p-2 border rounded flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-gray-600">{student.gmail}</p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddStudent(student.id)}
                                  disabled={selectedClass.studentClasses?.some(sc => sc.student.id === student.id)}
                                >
                                  {selectedClass.studentClasses?.some(sc => sc.student.id === student.id) ? "Đã có" : "Thêm"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Student list */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Danh sách học viên:</h4>
                      {selectedClass.studentClasses && selectedClass.studentClasses.length > 0 ? (
                        selectedClass.studentClasses.map((studentClass) => (
                          <div
                            key={studentClass.student.id}
                            className="p-3 border rounded flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{studentClass.student.name}</p>
                              <p className="text-sm text-gray-600">{studentClass.student.gmail}</p>
                              <p className="text-sm text-gray-600">{studentClass.student.phoneNumber}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStudent(studentClass.student)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có học viên nào</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* <CompanyImage position="bottom" /> */}

        {/* Remove Student Confirmation Modal */}
        {showRemoveConfirm && studentToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa học viên</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa học viên <strong>{studentToRemove.name}</strong> khỏi lớp <strong>{selectedClass?.name}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRemoveConfirm(false)
                    setStudentToRemove(null)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmRemoveStudent}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Grade Check Modal */}
        {showGradeCheck && studentToAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Học viên chưa có điểm thi</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Học viên <strong>{studentToAdd.name}</strong> chưa có điểm thi hoặc điểm thi chưa được cập nhật. 
                Vui lòng kiểm tra thông tin học viên trước khi thêm vào lớp.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGradeCheck(false)
                    setStudentToAdd(null)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    setShowGradeCheck(false)
                    setStudentToAdd(null)
                    router.push("/quan-ly-hoc-vien")
                  }}
                >
                  Đi đến quản lý học viên
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 