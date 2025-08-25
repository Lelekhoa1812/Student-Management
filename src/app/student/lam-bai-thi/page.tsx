"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/ui/navbar"
import { Clock, AlertTriangle, CheckCircle, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

interface TestAssignment {
  id: string
  test: {
    id: string
    title: string
    description?: string
    duration: number
    totalQuestions: number
    totalScore: number
    questions: Question[]
  }
  dueDate?: string
  assignedAt: string
}

interface Question {
  id: string
  questionText: string
  questionType: 'mcq' | 'constructed_response' | 'fill_blank' | 'mapping'
  score: number
  options?: QuestionOption[]
  fillBlankContent?: string
  mappingColumns?: MappingColumn[]
  correctAnswers?: string[]
}

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

interface StudentAnswer {
  questionId: string
  answerText?: string
  selectedOptions?: string[]
  mappingAnswers?: { leftId: string; rightId: string }[]
}

export default function LamBaiThiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignment, setAssignment] = useState<TestAssignment | null>(null)
  const [answers, setAnswers] = useState<StudentAnswer[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (session?.user?.role === "student") {
      fetchTestAssignment()
    }
  }, [session])

  useEffect(() => {
    if (assignment && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [assignment, timeLeft])

  const fetchTestAssignment = async () => {
    try {
      const response = await fetch('/api/tests/student/assignment')
      if (response.ok) {
        const data = await response.json()
        if (data.assignment) {
          setAssignment(data.assignment)
          setTimeLeft(data.assignment.test.duration * 60) // Convert minutes to seconds
          
          // Initialize answers array
          const initialAnswers = data.assignment.test.questions.map((q: Question) => ({
            questionId: q.id,
            answerText: '',
            selectedOptions: [],
            mappingAnswers: []
          }))
          setAnswers(initialAnswers)
        }
      }
    } catch (error) {
      console.error('Error fetching test assignment:', error)
      toast.error('Không thể tải đề thi')
    } finally {
      setIsFetching(false)
    }
  }

  const updateAnswer = (questionId: string, field: keyof StudentAnswer, value: any) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { ...answer, [field]: value }
        : answer
    ))
  }

  const handleSubmitTest = async () => {
    if (timeLeft > 0 && !showSubmitModal) {
      setShowSubmitModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tests/student/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: assignment?.id,
          answers: answers
        }),
      })

      if (response.ok) {
        toast.success('Nộp bài thành công!')
        router.push('/thi-xep-lop')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Không thể nộp bài')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error('Không thể nộp bài')
    } finally {
      setIsSubmitting(false)
      setShowSubmitModal(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes <= 1) {
      return (
        <span className="text-red-600 font-bold">
          {minutes}:{remainingSeconds.toString().padStart(2, '0')}
        </span>
      )
    }
    
    return (
      <span className="text-green-600 font-bold">
        {minutes}:{remainingSeconds.toString().padStart(2, '0')}
      </span>
    )
  }

  if (status === "loading" || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đề thi...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "student") {
    router.push('/dang-nhap')
    return null
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/thi-xep-lop')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-orange-800 text-sm">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <p>Bạn chưa được giao đề thi nào. Vui lòng liên hệ với giáo viên để được sắp xếp lịch thi phù hợp.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header with Timer */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/thi-xep-lop')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.test.title}</h1>
              <p className="text-gray-600">{assignment.test.description}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm text-gray-600">Thời gian còn lại:</span>
              </div>
              <div className="text-2xl font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Test Questions */}
        <div className="space-y-6">
          {assignment.test.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Câu {index + 1}</span>
                  <span className="text-sm text-gray-500">({question.score} điểm)</span>
                </CardTitle>
                <CardDescription>{question.questionText}</CardDescription>
              </CardHeader>
              <CardContent>
                {question.questionType === 'mcq' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={answers.find(a => a.questionId === question.id)?.selectedOptions?.includes(option.id) || false}
                          onCheckedChange={(checked) => {
                            const currentAnswers = answers.find(a => a.questionId === question.id)?.selectedOptions || []
                            const newAnswers = checked
                              ? [...currentAnswers, option.id]
                              : currentAnswers.filter(id => id !== option.id)
                            updateAnswer(question.id, 'selectedOptions', newAnswers)
                          }}
                        />
                        <Label htmlFor={option.id} className="cursor-pointer">
                          {option.optionKey}. {option.optionText}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.questionType === 'constructed_response' && (
                  <Textarea
                    placeholder="Nhập câu trả lời của bạn..."
                    value={answers.find(a => a.questionId === question.id)?.answerText || ''}
                    onChange={(e) => updateAnswer(question.id, 'answerText', e.target.value)}
                    rows={4}
                  />
                )}

                {question.questionType === 'fill_blank' && question.fillBlankContent && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-3">
                      {question.fillBlankContent.split('___').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <Input
                              className="inline-block w-32 mx-2"
                              placeholder="Điền từ..."
                              value={answers.find(a => a.questionId === question.id)?.answerText?.split('|')[i] || ''}
                              onChange={(e) => {
                                const currentAnswers = answers.find(a => a.questionId === question.id)?.answerText?.split('|') || []
                                currentAnswers[i] = e.target.value
                                updateAnswer(question.id, 'answerText', currentAnswers.join('|'))
                              }}
                            />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {question.questionType === 'mapping' && question.mappingColumns && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Cột trái:</h4>
                      <div className="space-y-2">
                        {question.mappingColumns
                          .filter(col => col.columnType === 'left')
                          .map((col) => (
                            <div key={col.id} className="p-2 border rounded bg-gray-50">
                              {col.itemText}
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Cột phải:</h4>
                      <div className="space-y-2">
                        {question.mappingColumns
                          .filter(col => col.columnType === 'right')
                          .map((col) => (
                            <div key={col.id} className="p-2 border rounded bg-gray-50">
                              {col.itemText}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmitTest}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
          </Button>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
                <h3 className="text-lg font-medium">Xác nhận nộp bài</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Thời gian làm bài chưa hết. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
