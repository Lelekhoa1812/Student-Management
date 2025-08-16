"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { BookOpen, Download, Clock, AlertCircle } from "lucide-react"
import React from "react"

interface ExamResult {
  id: string
  score: number
  levelEstimate: string
  examDate: string
  notes?: string
}

export default function ExamPlacementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

    fetchExamResult()
  }, [session, status, router])

  const fetchExamResult = async () => {
    try {
      const response = await fetch(`/api/exams?email=${session?.user?.email}`)
      if (response.ok) {
        const exams = await response.json()
        if (exams.length > 0) {
          // Get the most recent exam result
          const latestExam = exams[exams.length - 1]
          setExamResult(latestExam)
        }
      }
    } catch (error) {
      console.error("Error fetching exam result:", error)
      setError("Không thể tải kết quả thi")
    } finally {
      setIsLoading(false)
    }
  }

  const exportPDF = () => {
    if (!examResult) return

    const content = `
      KẾT QUẢ THI XẾP LỚP
      
      Điểm thi: ${examResult.score}/100
      Level được xếp: ${examResult.levelEstimate}
      Ngày thi: ${new Date(examResult.examDate).toLocaleDateString('vi-VN')}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ket-qua-thi-xep-lop-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
        <Card className="max-w-2xl mx-auto">
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

                {/* <div className="flex justify-center">
                  <Button onClick={exportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất kết quả
                  </Button>
                </div> */}
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
      </div>

      <CompanyImage position="bottom" />
    </div>
  )
} 