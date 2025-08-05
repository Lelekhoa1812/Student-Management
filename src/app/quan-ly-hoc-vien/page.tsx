// src/app/quan-ly-hoc-vien/page.tsx
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
import { GraduationCap, Edit, Save, X, Filter, CheckCircle, AlertCircle, Trash2, AlertTriangle, Undo } from "lucide-react"
import React from "react"

interface Student {
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
  studentClasses?: {
    class: Class
  }[]
  examResult?: {
    score: number
    levelEstimate: string
    examDate: string
  }
}

interface Class {
  id: string
  name: string
  level: string
  maxStudents: number
  teacherName?: string
  isActive: boolean
}

interface LevelThreshold {
  id: string
  level: string
  minScore: number
  maxScore: number
}

export default function StudentManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [levelThresholds, setLevelThresholds] = useState<LevelThreshold[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<Partial<Student> & { classIds?: string[] }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    show: boolean;
  } | null>(null)

  // Delete modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [deletedStudent, setDeletedStudent] = useState<Student | null>(null)
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false)

  // Filter states
  const [examStatusFilter, setExamStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role !== "staff" && session.user?.role !== "manager") {
      router.push("/")
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      // Fetch students with class information
      const studentsResponse = await fetch("/api/students")
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        
        // Fetch exam results for each student
        const studentsWithExams = await Promise.all(
          studentsData.map(async (student: Student) => {
            const examResponse = await fetch(`/api/exams?email=${student.gmail}`)
            if (examResponse.ok) {
              const exams = await examResponse.json()
              return {
                ...student,
                examResult: exams.length > 0 ? exams[0] : null
              }
            }
            return student
          })
        )
        
        setStudents(studentsWithExams)
      }

      // Fetch classes
      const classesResponse = await fetch("/api/classes?active=true")
      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        setClasses(classesData)
      }

      // Fetch level thresholds
      const thresholdsResponse = await fetch("/api/level-thresholds")
      if (thresholdsResponse.ok) {
        const thresholdsData = await thresholdsResponse.json()
        setLevelThresholds(thresholdsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    if (student) {
      setEditingStudent(studentId)
      setEditedData({
        name: student.name,
        phoneNumber: student.phoneNumber,
        school: student.school,
        platformKnown: student.platformKnown,
        note: student.note,
        classIds: student.studentClasses?.map(sc => sc.class.id) || [],
        examResult: student.examResult ? {
          score: student.examResult.score,
          levelEstimate: student.examResult.levelEstimate || "",
          examDate: student.examResult.examDate ? 
            new Date(student.examResult.examDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0]
        } : {
          score: 0,
          levelEstimate: "",
          examDate: new Date().toISOString().split('T')[0]
        }
      })
    }
  }

  const handleCancel = () => {
    setEditingStudent(null)
    setEditedData({})
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const handleDelete = (student: Student) => {
    setStudentToDelete(student)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return

    try {
      const response = await fetch(`/api/students/${studentToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Store the deleted student for potential undo
        setDeletedStudent(studentToDelete)
        
        // Remove from current list
        setStudents(students.filter(s => s.id !== studentToDelete.id))
        
        // Show undo snackbar
        setShowUndoSnackbar(true)
        
        // Auto-hide snackbar after 5 seconds
        setTimeout(() => {
          setShowUndoSnackbar(false)
          setDeletedStudent(null)
        }, 5000)
        
        showNotification('success', 'Xóa học viên thành công!')
      } else {
        const errorData = await response.json()
        showNotification('error', errorData.error || 'Có lỗi xảy ra khi xóa học viên')
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      showNotification('error', 'Có lỗi xảy ra khi xóa học viên')
    } finally {
      setShowDeleteConfirm(false)
      setStudentToDelete(null)
    }
  }

  const handleUndoDelete = async () => {
    if (!deletedStudent) return

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: deletedStudent.name,
          gmail: deletedStudent.gmail,
          password: "tempPassword123", // Will need to be changed by student
          dob: deletedStudent.dob,
          address: deletedStudent.address,
          phoneNumber: deletedStudent.phoneNumber,
          school: deletedStudent.school,
          platformKnown: deletedStudent.platformKnown,
          note: deletedStudent.note
        }),
      })

      if (response.ok) {
        // Re-add to list
        const restoredStudent = await response.json()
        setStudents([...students, { ...deletedStudent, ...restoredStudent.student }])
        showNotification('success', 'Khôi phục học viên thành công!')
      } else {
        const errorData = await response.json()
        showNotification('error', errorData.error || 'Có lỗi xảy ra khi khôi phục học viên')
      }
    } catch (error) {
      console.error("Error restoring student:", error)
      showNotification('error', 'Có lỗi xảy ra khi khôi phục học viên')
    } finally {
      setShowUndoSnackbar(false)
      setDeletedStudent(null)
    }
  }

  const handleSave = async (studentId: string) => {
    setIsSaving(true)
    try {
      const student = students.find(s => s.id === studentId)
      if (!student) return

      console.log("Saving student:", studentId)
      console.log("Edited data:", editedData)

      let hasChanges = false

      // Update student data if there are changes
      const hasStudentChanges = editedData.name !== student.name ||
        editedData.phoneNumber !== student.phoneNumber ||
        editedData.school !== student.school ||
        editedData.platformKnown !== student.platformKnown ||
        editedData.note !== student.note ||
        JSON.stringify(editedData.classIds) !== JSON.stringify(student.studentClasses?.map(sc => sc.class.id) || [])

      console.log("Has student changes:", hasStudentChanges)

      if (hasStudentChanges) {
        
        const studentUpdateData = {
          name: editedData.name || student.name,
          dob: student.dob,
          address: editedData.address || student.address,
          phoneNumber: editedData.phoneNumber || student.phoneNumber,
          school: editedData.school || student.school,
          platformKnown: editedData.platformKnown || student.platformKnown,
          note: editedData.note !== undefined ? editedData.note : student.note,
          classIds: editedData.classIds || (student.studentClasses?.map(sc => sc.class.id) || [])
        }

        console.log("Sending student update data:", studentUpdateData)

        const studentResponse = await fetch(`/api/students/${studentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentUpdateData),
        })

        if (studentResponse.ok) {
          hasChanges = true
          console.log("Student data updated successfully")
        } else {
          const errorData = await studentResponse.json()
          showNotification('error', `Lỗi khi cập nhật thông tin học viên: ${errorData.error || 'Có lỗi xảy ra'}`)
          return
        }
      }

      // Update exam result
      const hasExamChanges = editedData.examResult && (
        editedData.examResult.score !== (student.examResult?.score || 0) ||
        editedData.examResult.examDate !== (student.examResult?.examDate || "") ||
        editedData.examResult.levelEstimate !== (student.examResult?.levelEstimate || "")
      )

      console.log("Has exam changes:", hasExamChanges)

      if (editedData.examResult && hasExamChanges) {
        let levelEstimate = editedData.examResult.levelEstimate

        // Only auto-calculate if level is completely empty and score exists
        if (!levelEstimate || levelEstimate.trim() === "") {
          if (editedData.examResult.score > 0) {
            levelEstimate = getLevelFromScore(editedData.examResult.score)
          } else {
            levelEstimate = "Chưa xác định"
          }
        }

        const examData = {
          score: editedData.examResult.score,
          levelEstimate: levelEstimate,
          examDate: editedData.examResult.examDate,
          studentEmail: student.gmail
        }

        console.log("Sending exam data:", examData)

        const examResponse = await fetch("/api/exams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(examData),
        })

        if (examResponse.ok) {
          hasChanges = true
          console.log("Exam data updated successfully")
        } else {
          const errorData = await examResponse.json()
          showNotification('error', `Lỗi khi lưu điểm thi: ${errorData.error || 'Có lỗi xảy ra'}`)
          return
        }
      }

      if (hasChanges) {
        // Refresh data
        await fetchData()
        setEditingStudent(null)
        setEditedData({})
        showNotification('success', "Dữ liệu đã được lưu thành công!")
      } else {
        showNotification('info', "Không có thay đổi nào để lưu")
      }
    } catch (error) {
      console.error("Error updating data:", error)
      showNotification('error', "Có lỗi xảy ra khi lưu dữ liệu")
    } finally {
      setIsSaving(false)
    }
  }

  const getLevelFromScore = (score: number) => {
    const threshold = levelThresholds.find(
      t => score >= t.minScore && score <= t.maxScore
    )
    return threshold ? threshold.level : "Chưa xác định"
  }

  const getExamStatus = (student: Student) => {
    if (!student.examResult) return "Chưa đăng ký thi"
    if (student.examResult.score > 0) return "Đã đăng ký thi"
    return "Chưa có điểm"
  }

  const getStatusColor = (student: Student) => {
    const status = getExamStatus(student)
    if (status === "Chưa đăng ký thi" || status === "Chưa có điểm") {
      return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
    }
    return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
  }

  const getLevelDisplay = (student: Student) => {
    if (!student.examResult?.levelEstimate || student.examResult.levelEstimate === "Chưa xác định") {
      return "Chưa có"
    }
    
    // Check if this level matches the auto-calculated level based on score
    if (student.examResult.score > 0) {
      const autoLevel = getLevelFromScore(student.examResult.score)
      if (autoLevel === student.examResult.levelEstimate) {
        return `${student.examResult.levelEstimate} (tự động)`
      }
    }
    
    return `${student.examResult.levelEstimate} (thủ công)`
  }

  const filteredStudents = students.filter(student => {
    const examStatus = getExamStatus(student)
    const level = student.examResult?.levelEstimate || ""
    const registrationDate = new Date(student.createdAt)
    
    // Exam status filter
    if (examStatusFilter !== "all" && examStatus !== examStatusFilter) {
      return false
    }
    
    // Level filter
    if (levelFilter !== "all" && level !== levelFilter) {
      return false
    }
    
    // Date range filter
    if (startDate && registrationDate < new Date(startDate)) {
      return false
    }
    if (endDate && registrationDate > new Date(endDate)) {
      return false
    }
    
    return true
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            : 'bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            {/* <CompanyImage position="top" /> */}
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Quản lý học viên
              </CardTitle>
            </div>
            <CardDescription>
              Xem và quản lý thông tin học viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Bộ lọc</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Trạng thái thi</Label>
                  <select
                    value={examStatusFilter}
                    onChange={(e) => setExamStatusFilter(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">Tất cả</option>
                    <option value="Đã đăng ký thi">Đã đăng ký thi</option>
                    <option value="Chưa đăng ký thi">Chưa đăng ký thi</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Level</Label>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">Tất cả</option>
                    {levelThresholds.map((threshold) => (
                      <option key={threshold.id} value={threshold.level}>
                        {threshold.level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Từ ngày</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Đến ngày</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">Họ tên</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">Email</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">SĐT</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100 w-40">Trường học</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100 w-32">Nền tảng</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100 w-40">Ghi chú</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100 w-56">Lớp học</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100 w-24">Điểm thi</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">Ngày thi</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">Level</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className={getStatusColor(student)}>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {editingStudent === student.id ? (
                          <Input
                            type="text"
                            value={editedData.name || student.name}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              name: e.target.value
                            })}
                            className="w-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">{student.name}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-gray-100">{student.gmail}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {editingStudent === student.id ? (
                          <Input
                            type="text"
                            value={editedData.phoneNumber || student.phoneNumber}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              phoneNumber: e.target.value
                            })}
                            className="w-28 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">{student.phoneNumber}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 w-40">
                        {editingStudent === student.id ? (
                          <Input
                            type="text"
                            value={editedData.school || student.school}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              school: e.target.value
                            })}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">{student.school}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 w-32">
                        {editingStudent === student.id ? (
                          <Input
                            type="text"
                            value={editedData.platformKnown || student.platformKnown}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              platformKnown: e.target.value
                            })}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">{student.platformKnown}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 w-40">
                        {editingStudent === student.id ? (
                          <Input
                            type="text"
                            value={editedData.note || student.note || ""}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              note: e.target.value
                            })}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">{student.note || "Không có"}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 w-56">
                        {editingStudent === student.id ? (
                          <div className="space-y-2">
                            <select
                              multiple
                              value={editedData.classIds || (student.studentClasses?.map(sc => sc.class.id) || [])}
                              onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                                setEditedData({
                                  ...editedData,
                                  classIds: selectedOptions
                                })
                              }}
                              className="w-full p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 min-h-[80px]"
                            >
                              {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.name} ({cls.level})
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500">Giữ Ctrl (Cmd trên Mac) để chọn nhiều lớp</p>
                          </div>
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {student.studentClasses && student.studentClasses.length > 0 
                              ? student.studentClasses.map(sc => `${sc.class.name} (${sc.class.level})`).join(', ')
                              : "Không có lớp"
                            }
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 w-24">
                        {editingStudent === student.id ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editedData.examResult?.score || 0}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              examResult: {
                                ...editedData.examResult!,
                                score: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {student.examResult?.score || "Chưa có"}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {editingStudent === student.id ? (
                          <Input
                            type="date"
                            value={editedData.examResult?.examDate || ""}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              examResult: {
                                ...editedData.examResult!,
                                examDate: e.target.value
                              }
                            })}
                            className="w-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {student.examResult?.examDate 
                              ? new Date(student.examResult.examDate).toLocaleDateString('vi-VN')
                              : "Chưa có"
                            }
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {editingStudent === student.id ? (
                          <select
                            value={editedData.examResult?.levelEstimate || ""}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              examResult: {
                                ...editedData.examResult!,
                                levelEstimate: e.target.value
                              }
                            })}
                            className="w-32 p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          >
                            <option value="">Tự động tính</option>
                            {levelThresholds.map((threshold) => (
                              <option key={threshold.id} value={threshold.level}>
                                {threshold.level}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {getLevelDisplay(student)}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {editingStudent === student.id ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(student.id)}
                              disabled={isSaving}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(student.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(student)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Tổng số học viên: {filteredStudents.length}
            </div>
          </CardContent>
        </Card>
        {/* <CompanyImage position="bottom" /> */}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && studentToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa học viên</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa học viên <strong>{studentToDelete.name}</strong>? 
                Hành động này không thể hoàn tác sau khi hoàn thành.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setStudentToDelete(null)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Undo Snackbar */}
        {showUndoSnackbar && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Học viên đã được xóa</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndoDelete}
                className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                <Undo className="w-4 h-4 mr-1" />
                Hoàn tác
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 