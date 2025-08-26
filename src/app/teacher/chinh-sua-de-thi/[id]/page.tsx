"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/ui/navbar"
import { FileText, Plus, Trash2, Save, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface QuestionOption {
  id?: string
  optionText: string
  optionKey: string
  isCorrect: boolean
}

interface MappingColumn {
  id?: string
  columnType: 'left' | 'right'
  itemText: string
}

interface Question {
  id?: string
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
}

export default function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [testId, setTestId] = useState<string>("")
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 60,
    totalQuestions: 0,
    totalScore: 0,
    passingScore: 70
  })
  const [questions, setQuestions] = useState<Question[]>([])

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

  useEffect(() => {
    setTestData(prev => ({
      ...prev,
      totalQuestions: questions.length,
      totalScore: questions.reduce((sum, q) => sum + q.score, 0)
    }))
  }, [questions])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        setTestData({
          title: data.title,
          description: data.description || '',
          duration: data.duration,
          totalQuestions: data.totalQuestions,
          totalScore: data.totalScore,
          passingScore: data.passingScore
        })
        setQuestions(data.questions.map((q: Question) => ({
          ...q,
          options: q.options?.map((opt: QuestionOption) => ({
            ...opt,
            id: opt.id || undefined
          })),
          mappingColumns: q.mappingColumns?.map((col: MappingColumn) => ({
            ...col,
            id: col.id || undefined
          }))
        })))
      } else {
        toast.error("Không thể tải thông tin đề thi")
        router.push('/teacher/danh-sach-de-thi')
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải thông tin đề thi")
      router.push('/teacher/danh-sach-de-thi')
    } finally {
      setIsFetching(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      questionText: '',
      questionType: 'mcq',
      score: 1,
      order: questions.length + 1,
      options: [
        { optionText: '', optionKey: 'A', isCorrect: false },
        { optionText: '', optionKey: 'B', isCorrect: false },
        { optionText: '', optionKey: 'C', isCorrect: false },
        { optionText: '', optionKey: 'D', isCorrect: false }
      ],
      correctAnswers: []
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const updateQuestionOption = (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: string | boolean) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question.options) {
      question.options[optionIndex] = { ...question.options[optionIndex], [field]: value }
      // Update correct answers if this is a correct option
      if (field === 'isCorrect') {
        if (value) {
          question.correctAnswers = [...(question.correctAnswers || []), question.options?.[optionIndex]?.id || optionIndex.toString()]
        } else {
          question.correctAnswers = question.correctAnswers.filter(id => id !== (question.options?.[optionIndex]?.id || optionIndex.toString()))
        }
      }
    }
    setQuestions(updatedQuestions)
  }

  const addQuestionOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question.options && question.options.length < 6) {
      const newKey = String.fromCharCode(65 + question.options.length) // A, B, C, D, E, F
      question.options.push({
        optionText: '',
        optionKey: newKey,
        isCorrect: false
      })
      setQuestions(updatedQuestions)
    }
  }

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question.options && question.options.length > 2) {
      question.options.splice(optionIndex, 1)
      // Reorder option keys
      question.options.forEach((opt, idx) => {
        opt.optionKey = String.fromCharCode(65 + idx)
      })
      setQuestions(updatedQuestions)
    }
  }

  const addMappingColumn = (questionIndex: number, columnType: 'left' | 'right') => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (!question.mappingColumns) {
      question.mappingColumns = []
    }
    
    // Add new column with proper order
    const newColumn = {
      columnType,
      itemText: '',
      order: question.mappingColumns.length
    }
    
    question.mappingColumns.push(newColumn)
    setQuestions(updatedQuestions)
  }

  const updateMappingColumn = (questionIndex: number, columnIndex: number, field: keyof MappingColumn, value: string) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question.mappingColumns) {
      // Find the actual index in the original array
      const actualIndex = question.mappingColumns.findIndex((col, idx) => idx === columnIndex)
      if (actualIndex !== -1) {
        question.mappingColumns[actualIndex] = { ...question.mappingColumns[actualIndex], [field]: value }
        setQuestions(updatedQuestions)
      }
    }
  }

  const removeMappingColumn = (questionIndex: number, columnIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    if (question.mappingColumns && question.mappingColumns.length > 1) {
      // Find the actual index in the original array
      const actualIndex = question.mappingColumns.findIndex((col, idx) => idx === columnIndex)
      if (actualIndex !== -1) {
        question.mappingColumns.splice(actualIndex, 1)
        setQuestions(updatedQuestions)
      }
    }
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const saveTest = async () => {
    if (!testData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề đề thi")
      return
    }

    if (questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất một câu hỏi")
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`)
        return
      }

      if (q.questionType === 'mcq') {
        if (!q.options || q.options.length < 2) {
          toast.error(`Câu hỏi ${i + 1}: MCQ cần ít nhất 2 lựa chọn`)
          return
        }
        if (q.options.some(opt => !opt.optionText.trim())) {
          toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập đầy đủ các lựa chọn`)
          return
        }
        if (q.correctAnswers.length === 0) {
          toast.error(`Câu hỏi ${i + 1}: Vui lòng chọn đáp án đúng`)
          return
        }
      }

      if (q.questionType === 'fill_blank' && !q.fillBlankContent?.trim()) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung điền vào chỗ trống`)
        return
      }

      if (q.questionType === 'mapping') {
        if (!q.mappingColumns || q.mappingColumns.length < 2) {
          toast.error(`Câu hỏi ${i + 1}: Mapping cần ít nhất 2 cột`)
          return
        }
        if (q.mappingColumns.some(col => !col.itemText.trim())) {
          toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập đầy đủ nội dung các cột`)
          return
        }
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testData,
          questions: questions.map((q, index) => ({
            ...q,
            order: index + 1,
            // Derive fillBlankContent from questionText by preserving text with <> markers
            fillBlankContent: q.questionType === 'fill_blank' ? q.questionText : undefined,
            options: q.questionType === 'mcq' ? q.options : undefined,
            mappingColumns: q.questionType === 'mapping' ? q.mappingColumns : undefined
          }))
        })
      })

      if (response.ok) {
        toast.success("Cập nhật đề thi thành công!")
        router.push('/teacher/danh-sach-de-thi')
      } else {
        const error = await response.json()
        toast.error(error.error || "Có lỗi xảy ra khi cập nhật đề thi")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật đề thi")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isFetching) {
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
        <Card className="max-w-6xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Chỉnh sửa đề thi
              </CardTitle>
            </div>
            <CardDescription>
              Cập nhật thông tin và câu hỏi của đề thi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Button
                onClick={saveTest}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>

            {/* Test Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Tiêu đề đề thi *</Label>
                <Input
                  id="title"
                  value={testData.title}
                  onChange={(e) => setTestData({...testData, title: e.target.value})}
                  placeholder="Nhập tiêu đề đề thi"
                />
              </div>
              <div>
                <Label htmlFor="duration">Thời gian làm bài (phút) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={testData.duration}
                  onChange={(e) => setTestData({...testData, duration: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="passingScore">Điểm đạt (%) *</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={testData.passingScore}
                  onChange={(e) => setTestData({...testData, passingScore: parseFloat(e.target.value) || 0})}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="totalScore">Tổng điểm: {testData.totalScore}</Label>
                <Input
                  id="totalScore"
                  type="number"
                  value={testData.totalScore}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={testData.description}
                onChange={(e) => setTestData({...testData, description: e.target.value})}
                placeholder="Mô tả đề thi (không bắt buộc)"
                rows={3}
              />
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Câu hỏi ({questions.length})</h3>
                <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </div>

              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Câu hỏi {questionIndex + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Loại câu hỏi</Label>
                        <Select
                          value={question.questionType}
                          onValueChange={(value: 'mcq' | 'constructed_response' | 'fill_blank' | 'mapping') => updateQuestion(questionIndex, 'questionType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Trắc nghiệm (MCQ)</SelectItem>
                            <SelectItem value="constructed_response">Tự luận</SelectItem>
                            <SelectItem value="fill_blank">Điền vào chỗ trống</SelectItem>
                            <SelectItem value="mapping">Nối từ (Mapping)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Điểm</Label>
                        <Input
                          type="number"
                          value={question.score}
                          onChange={(e) => updateQuestion(questionIndex, 'score', parseFloat(e.target.value) || 0)}
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Nội dung câu hỏi *</Label>
                      <Textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                        placeholder={
                          question.questionType === 'fill_blank'
                            ? 'Nhập nội dung câu hỏi. Dùng ký hiệu <> để tạo chỗ trống.'
                            : 'Nhập nội dung câu hỏi'
                        }
                        rows={3}
                      />
                      {question.questionType === 'fill_blank' && (
                        <div className="mt-2 text-sm text-gray-700">
                          <div>
                            {(() => {
                              const parts = (question.questionText || '').split(/<>/g)
                              const blanks = Math.max(0, parts.length - 1)
                              return (
                                <span>
                                  {parts.map((p, i) => (
                                    <span key={i}>
                                      {p}
                                      {i < blanks && (
                                        <span className="inline-block align-baseline mx-1">
                                          <span className="inline-block w-28 border-b border-dashed border-gray-400" />
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </span>
                              )
                            })()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Xem trước (&lt;&gt; sẽ là ô nhập liệu của học viên)</div>
                        </div>
                      )}
                    </div>

                    {/* MCQ Options */}
                    {question.questionType === 'mcq' && (
                      <div className="space-y-3">
                        <Label>Lựa chọn</Label>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <Input
                              value={option.optionText}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, 'optionText', e.target.value)}
                              placeholder={`Lựa chọn ${option.optionKey}`}
                              className="flex-1"
                            />
                            <Button
                              variant={option.isCorrect ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestionOption(questionIndex, optionIndex, 'isCorrect', !option.isCorrect)}
                              className={option.isCorrect ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {option.isCorrect ? <CheckCircle className="w-4 h-4" /> : "Đúng"}
                            </Button>
                            {question.options && question.options.length > 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeQuestionOption(questionIndex, optionIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {question.options && question.options.length < 6 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestionOption(questionIndex)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm lựa chọn
                          </Button>
                        )}
                      </div>
                    )}

                    {/* No separate form for fill-blank; use questionText with <> markers */}

                    {/* Mapping columns */}
                    {question.questionType === 'mapping' && (
                      <div className="space-y-3">
                        <Label>Các cột để nối</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Cột trái</Label>
                            {question.mappingColumns?.filter(col => col.columnType === 'left').map((col, colIndex) => {
                              // Find the actual index in the original array
                              const actualIndex = question.mappingColumns!.findIndex(c => c === col)
                              return (
                                <div key={`left-${actualIndex}`} className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                                    L
                                  </div>
                                  <Input
                                    value={col.itemText}
                                    onChange={(e) => updateMappingColumn(questionIndex, colIndex, 'itemText', e.target.value)}
                                    placeholder="Nội dung cột trái"
                                  />
                                  {question.mappingColumns && question.mappingColumns.length > 2 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeMappingColumn(questionIndex, colIndex)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addMappingColumn(questionIndex, 'left')}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Thêm cột trái
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Cột phải</Label>
                            {question.mappingColumns?.filter(col => col.columnType === 'right').map((col, colIndex) => {
                              // Find the actual index in the original array
                              const actualIndex = question.mappingColumns!.findIndex(c => c === col)
                              return (
                                <div key={`right-${actualIndex}`} className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center">
                                    R
                                  </div>
                                  <Input
                                    value={col.itemText}
                                    onChange={(e) => updateMappingColumn(questionIndex, colIndex, 'itemText', e.target.value)}
                                    placeholder="Nội dung cột phải"
                                  />
                                  {question.mappingColumns && question.mappingColumns.length > 2 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeMappingColumn(questionIndex, colIndex)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addMappingColumn(questionIndex, 'right')}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Thêm cột phải
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi để bắt đầu chỉnh sửa đề thi.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
