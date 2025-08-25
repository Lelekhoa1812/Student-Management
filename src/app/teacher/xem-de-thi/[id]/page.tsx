"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/ui/navbar"
import { FileText, ArrowLeft, Edit, Users, Clock, Target, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface QuestionOption {
  id: string
  optionText: string
  optionKey: string
  isCorrect: boolean
}

interface MappingColumn {
  id: string
  columnType: 'left' | 'right'
  itemText: string
}

interface Question {
  id: string
  questionText: string
  questionType: 'mcq' | 'constructed_response' | 'fill_blank' | 'mapping'
  score: number
  order: number
  options?: QuestionOption[]
  fillBlankContent?: string
  mappingColumns?: MappingColumn[]
  correctAnswers: string[]
}

interface Test {
  id: string
  title: string
  description?: string
  duration: number
  totalQuestions: number
  totalScore: number
  passingScore: number
  isActive: boolean
  createdAt: string
  questions: Question[]
  _count?: {
    assignments: number
  }
}

export default function ViewTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testId, setTestId] = useState<string>("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
  }, [session, status, router])

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setTestId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (session?.user?.role === "teacher" && testId) {
      fetchTest()
    }
  }, [session, testId])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data)
      } else {
        toast.error("Không thể tải thông tin đề thi")
        router.push('/teacher/danh-sach-de-thi')
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải thông tin đề thi")
      router.push('/teacher/danh-sach-de-thi')
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'Trắc nghiệm'
      case 'constructed_response': return 'Tự luận'
      case 'fill_blank': return 'Điền vào chỗ trống'
      case 'mapping': return 'Nối từ'
      default: return type
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Đang tải đề thi...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Không tìm thấy đề thi</h3>
          <Button onClick={() => router.push('/teacher/danh-sach-de-thi')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
                <p className="text-gray-600">{test.description || "Không có mô tả"}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/teacher/chinh-sua-de-thi/${test.id}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                onClick={() => router.push(`/teacher/giao-de-thi`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Giao đề thi
              </Button>
            </div>
          </div>

          {/* Test Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Thông tin tổng quan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{test.duration}</div>
                  <div className="text-sm text-gray-600">Phút</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{test.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Câu hỏi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{test.totalScore}</div>
                  <div className="text-sm text-gray-600">Điểm tối đa</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{test.passingScore}%</div>
                  <div className="text-sm text-gray-600">Điểm đạt</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Trạng thái: <Badge variant={test.isActive ? "default" : "secondary"}>{test.isActive ? "Hoạt động" : "Ẩn"}</Badge></span>
                  <span>Học viên được giao: {test._count?.assignments ?? 0}</span>
                  <span>Tạo ngày: {new Date(test.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi ({test.questions.length})</CardTitle>
              <CardDescription>
                Tổng điểm: {test.totalScore} | Điểm đạt: {test.passingScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {test.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-sm">
                          Câu {question.order}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {getQuestionTypeLabel(question.questionType)}
                        </Badge>
                        <Badge variant="default" className="text-sm">
                          {question.score} điểm
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-900 font-medium">{question.questionText}</p>
                    </div>

                    {/* MCQ Options */}
                    {question.questionType === 'mcq' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center text-sm font-medium ${
                              option.isCorrect 
                                ? 'border-green-500 bg-green-100 text-green-700' 
                                : 'border-gray-300 text-gray-500'
                            }`}>
                              {option.optionKey}
                            </div>
                            <span className={`${option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                              {option.optionText}
                            </span>
                            {option.isCorrect && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fill in the blank content */}
                    {question.questionType === 'fill_blank' && question.fillBlankContent && (
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-gray-700 text-sm">{question.fillBlankContent}</p>
                      </div>
                    )}

                    {/* Mapping columns */}
                    {question.questionType === 'mapping' && question.mappingColumns && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Cột trái:</h4>
                          <div className="space-y-2">
                            {question.mappingColumns
                              .filter(col => col.columnType === 'left')
                              .map((col, idx) => (
                                <div key={col.id} className="bg-blue-50 p-2 rounded border border-blue-200">
                                  <span className="text-sm font-medium text-blue-700">{String.fromCharCode(65 + idx)}.</span>
                                  <span className="text-sm text-blue-800 ml-2">{col.itemText}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Cột phải:</h4>
                          <div className="space-y-2">
                            {question.mappingColumns
                              .filter(col => col.columnType === 'right')
                              .map((col, idx) => (
                                <div key={col.id} className="bg-green-50 p-2 rounded border border-green-200">
                                  <span className="text-sm font-medium text-green-700">{idx + 1}.</span>
                                  <span className="text-sm text-green-800 ml-2">{col.itemText}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Constructed response */}
                    {question.questionType === 'constructed_response' && (
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-yellow-800 text-sm">
                          <strong>Lưu ý:</strong> Câu hỏi tự luận cần được chấm điểm thủ công bởi giáo viên.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
