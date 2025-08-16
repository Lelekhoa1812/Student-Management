"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { ClassDetailsModal } from "@/components/ui/class-details-modal"
import { BookOpen, Clock, AlertCircle, Users, User, Calendar, Eye } from "lucide-react"
import React from "react"

interface ExamResult {
  id: string
  score: number
  levelEstimate: string
  examDate: string
  notes?: string
}

interface Student {
  id: string
  name: string
  gmail: string
  studentClasses: {
    id: string
    class: {
      id: string
      name: string
      level: string
      maxStudents: number
      teacherName: string
      isActive: boolean
      createdAt: string
      _count: {
        studentClasses: number
      }
    }
  }[]
}

interface ClassDetails {
  id: string
  name: string
  level: string
  maxStudents: number
  teacherName: string
  isActive: boolean
  createdAt: string
  students: {
    id: string
    name: string
    gmail: string
  }[]
}

export default function ExamPlacementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClassDetails, setSelectedClassDetails] = useState<ClassDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch exam result
      const examResponse = await fetch(`/api/exams?email=${session?.user?.email}`)
      if (examResponse.ok) {
        const exams = await examResponse.json()
        if (exams.length > 0) {
          const latestExam = exams[exams.length - 1]
          setExamResult(latestExam)
        }
      }

      // Fetch student data with class assignments
      const studentResponse = await fetch(`/api/students?email=${session?.user?.email}`)
      if (studentResponse.ok) {
        const students = await studentResponse.json()
        console.log("🔍 Debug - Student data received:", students)
        if (students.length > 0) {
          console.log("🔍 Debug - First student data:", students[0])
          console.log("🔍 Debug - Student classes:", students[0].studentClasses)
          setStudent(students[0])
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewClassDetails = async (classId: string) => {
    try {
      // Fetch detailed class information including all students
      const response = await fetch(`/api/classes/${classId}`)
      if (response.ok) {
        const classData = await response.json()
        setSelectedClassDetails(classData)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error("Error fetching class details:", error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedClassDetails(null)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Exam Result Section */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Kết quả thi xếp lớp
              </CardTitle>
            </div>
            <CardDescription>
              Xem kết quả thi và level được xếp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {examResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-green-600 mb-2">
                    Kết quả thi xếp lớp
                  </h3>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      {examResult.score}/100
                    </div>
                    <div className="text-lg text-green-600">
                      Level được xếp: <span className="font-semibold">{examResult.levelEstimate}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Ngày thi: {new Date(examResult.examDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Clock className="w-16 h-16 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-orange-600 mb-2">
                    Chưa có kết quả thi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Kết quả thi xếp lớp của bạn chưa được cập nhật.
                  </p>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-orange-800 text-sm">
                        <p className="font-medium mb-1">Lưu ý:</p>
                        <p>Nếu bạn chưa thực hiện bài thi xếp lớp, vui lòng liên hệ với nhân viên để được sắp xếp lịch thi phù hợp.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Assignment Section */}
        {examResult && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Thông tin lớp học được phân công
              </h2>
              <p className="text-lg text-gray-600">
                {student?.studentClasses && student.studentClasses.length > 0
                  ? `Bạn đã được phân công vào ${student.studentClasses.length} lớp học`
                  : "Xem trạng thái phân lớp của bạn"
                }
              </p>
            </div>

            {!student?.studentClasses || student.studentClasses.length === 0 ? (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                      Chưa được phân lớp
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      Bạn chưa được phân công vào lớp học nào sau khi thi xếp lớp.
                    </p>
                    <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                        <div className="text-yellow-800 text-sm text-left">
                          <p className="font-medium mb-1">Hướng dẫn:</p>
                          <ul className="list-disc list-inside space-y-1 text-left">
                            <li>Nhân viên sẽ xem xét kết quả thi và phân lớp phù hợp</li>
                            <li>Quá trình này thường mất 1-2 ngày làm việc</li>
                            <li>Nếu vẫn chưa được phân lớp sau 3 ngày, vui lòng liên hệ nhân viên</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {student.studentClasses
                  .map((studentClass) => {
                    // Safety check for class data
                    if (!studentClass?.class) {
                      console.warn("Missing class data for studentClass:", studentClass)
                      return null
                    }

                    const classData = studentClass.class
                    const studentCount = classData._count?.studentClasses || 0
                    const maxStudents = classData.maxStudents || 0
                    const teacherName = classData.teacherName || "Chưa phân công"
                    const createdAt = classData.createdAt ? new Date(classData.createdAt).toLocaleDateString('vi-VN') : "N/A"

                    return (
                      <Card
                        key={studentClass.id}
                        className="hover:shadow-lg transition-shadow duration-200 border-blue-200 bg-blue-50"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <CardTitle className="text-lg text-blue-900">
                                {classData.name || "Tên lớp không xác định"}
                              </CardTitle>
                            </div>
                          </div>
                          <CardDescription className="text-blue-700">
                            Level: {classData.level || "Không xác định"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Class Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="text-blue-800">
                                <strong>Giáo viên:</strong> {teacherName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span className="text-blue-800">
                                <strong>Sĩ số:</strong> {studentCount}/{maxStudents}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-orange-600" />
                              <span className="text-blue-800">
                                <strong>Ngày tạo:</strong> {createdAt}
                              </span>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <Button
                            onClick={() => handleViewClassDetails(classData.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết lớp
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })
                  .filter(Boolean)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Details Modal */}
      <ClassDetailsModal
        classDetails={selectedClassDetails}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <CompanyImage position="bottom" />
    </div>
  )
} 