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
import { QuestionOption, MappingColumn } from "@/lib/types"

interface ExamResult {
  id: string
  score: number
  levelEstimate: string
  examDate: string
  notes?: string
}

interface Question {
  id: string
  questionText: string
  questionType: string
  score: number
  options?: QuestionOption[]
  correctAnswers?: string[]
  mappingColumns?: MappingColumn[]
}

interface TestAssignment {
  id: string
  studentId: string
  testId: string
  assignedAt: string
  dueDate?: string
  completedAt?: string
  score?: number
  test: {
    id: string
    title: string
    description?: string
    duration: number
    questions: Question[]
  }
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
      numSessions?: number
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
  numSessions?: number
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
  const [testAssignment, setTestAssignment] = useState<TestAssignment | TestAssignment[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClassDetails, setSelectedClassDetails] = useState<ClassDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Type guard functions
  const isTestAssignmentArray = (assignment: TestAssignment | TestAssignment[] | null): assignment is TestAssignment[] => {
    return Array.isArray(assignment)
  }

  const isTestAssignmentSingle = (assignment: TestAssignment | TestAssignment[] | null): assignment is TestAssignment => {
    return assignment !== null && !Array.isArray(assignment)
  }

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
      
      console.log("🔍 === FETCH DATA START ===")
      console.log("🔍 Session object:", session)
      console.log("🔍 Session user:", session?.user)
      console.log("🔍 Session user email:", session?.user?.email)
      console.log("🔍 Session user ID:", session?.user?.id)
      console.log("🔍 Session user role:", session?.user?.role)
      console.log("🔍 === FETCH DATA START ===")
      
      // Fetch exam result
      console.log("🔍 Fetching exam result for email:", session?.user?.email)
      const examResponse = await fetch(`/api/exams?email=${session?.user?.email}`)
      console.log("🔍 Exam response status:", examResponse.status)
      if (examResponse.ok) {
        const exams = await examResponse.json()
        console.log("🔍 Exam data received:", exams)
        if (exams.length > 0) {
          const latestExam = exams[0]
          console.log("🔍 Setting exam result:", latestExam)
          setExamResult(latestExam)
        } else {
          console.log("🔍 No exam results found")
        }
      } else {
        console.log("🔍 Exam response not ok:", examResponse.status)
      }

      // Fetch student data with class assignments
      console.log("🔍 Fetching student data for email:", session?.user?.email)
      const studentResponse = await fetch(`/api/students?email=${session?.user?.email}`)
      console.log("🔍 Student response status:", studentResponse.status)
      if (studentResponse.ok) {
        const students = await studentResponse.json()
        console.log("🔍 Debug - Student data received:", students)
        if (students.length > 0) {
          console.log("🔍 Debug - First student data:", students[0])
          console.log("🔍 Debug - Student classes:", students[0].studentClasses)
          setStudent(students[0])
        } else {
          console.log("🔍 No student data found")
        }
      } else {
        console.log("🔍 Student response not ok:", studentResponse.status)
      }

      // Fetch test assignment for student
      if (session?.user?.role === "student") {
        console.log("🔍 Fetching test assignment for student role")
        console.log("🔍 Session user ID:", session.user.id)
        console.log("🔍 Session user email:", session.user.email)
        console.log("🔍 Session user role:", session.user.role)
        
        const testResponse = await fetch('/api/tests/student/assignment')
        console.log("🔍 Test response status:", testResponse.status)
        console.log("🔍 Test response headers:", Object.fromEntries(testResponse.headers.entries()))
        
        if (testResponse.ok) {
          const testData = await testResponse.json()
          console.log("🔍 Test data received:", testData)
          if (testData.assignment) {
            console.log("🔍 Setting test assignment:", testData.assignment)
            setTestAssignment(testData.assignment)
          } else {
            console.log("🔍 No assignment in test data")
          }
        } else {
          console.log("🔍 Test response not ok:", testResponse.status, testResponse.statusText)
          try {
            const errorData = await testResponse.json()
            console.log("🔍 Error response data:", errorData)
          } catch (e) {
            console.log("🔍 Could not parse error response")
          }
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
            {testAssignment ? (
              // SCENARIO 2: Student has been assigned a test (regardless of exam results)
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Clock className="w-16 h-16 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-2">
                    Bạn có đề thi cần làm
                  </h3>
                  
                  {/* Handle multiple test assignments */}
                  {Array.isArray(testAssignment) ? (
                    // Multiple test assignments
                    <div className="space-y-4">
                      {testAssignment.map((assignment, index) => (
                        <div key={assignment.id} className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                          <div className="text-lg font-semibold text-blue-700 mb-2">
                            {assignment.test.title}
                          </div>
                          <div className="text-blue-600 mb-3">
                            Thời gian làm bài: {assignment.test.duration} phút
                          </div>
                          {assignment.test.description && (
                            <div className="text-sm text-blue-500 mb-4">
                              {assignment.test.description}
                            </div>
                          )}
                          <Button
                            onClick={() => router.push(`/student/lam-bai-thi?testId=${assignment.test.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                          >
                            Làm bài thi: {assignment.test.title}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single test assignment
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="text-lg font-semibold text-blue-700 mb-2">
                        {testAssignment.test.title}
                      </div>
                      <div className="text-blue-600 mb-3">
                        Thời gian làm bài: {testAssignment.test.duration} phút
                      </div>
                      {testAssignment.test.description && (
                        <div className="text-sm text-blue-500 mb-4">
                          {testAssignment.test.description}
                        </div>
                      )}
                      <Button
                        onClick={() => router.push(`/student/lam-bai-thi?testId=${testAssignment.test.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                      >
                        Làm bài thi: {testAssignment.test.title}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : examResult ? (
              // SCENARIO 3: Student has completed exam and has results
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
              // SCENARIO 1: Student has no test assignment and no exam results
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Users className="w-16 h-16 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-orange-600 mb-2">
                    Chưa được giao đề thi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bạn chưa được giao đề thi nào để làm.
                  </p>
                  
                  {/* Debug Information */}
                  <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                    <p><strong>Debug:</strong> testAssignment: {testAssignment ? 'Yes' : 'No'}</p>
                    <p><strong>Debug:</strong> examResult: {examResult ? 'Yes' : 'No'}</p>
                    {testAssignment && (
                      <div>
                        <p>Type: {Array.isArray(testAssignment) ? 'Array' : 'Single'}</p>
                        {Array.isArray(testAssignment) ? (
                          <p>Count: {(testAssignment as TestAssignment[]).length}</p>
                        ) : (
                          <p>Test: {(testAssignment as TestAssignment).test?.title}, Duration: {(testAssignment as TestAssignment).test?.duration}min</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-orange-800 text-sm">
                        <p className="font-medium mb-1">Lưu ý:</p>
                        <p>Bạn chưa được giao đề thi nào. Vui lòng liên hệ với nhân viên để được sắp xếp lịch thi phù hợp.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Assignment Section */}
        {
        // SCENARIO 3 + 1: Student has completed exam and has results and a class assigned
        testAssignment && examResult && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Thông tin lớp học được phân công
              </h2>
              <p className="text-lg text-gray-600">
                {student?.studentClasses && student.studentClasses.length > 0
                  ? `Bạn đã được phân công vào ${student.studentClasses.length} lớp học`
                  : "Bạn chưa được phân công vào lớp học nào"
                }
              </p>
            </div>

            {
            // SCENARIO 3 + 2: Student has completed exam and has results but no class assigned
            (!student?.studentClasses || student.studentClasses.length === 0) && examResult ? (
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
                {student?.studentClasses
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
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-800">
                                <strong>Số buổi:</strong> {classData.numSessions ?? 24}
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