"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

interface LevelThreshold {
  id: string
  level: string
  minScore: number
  maxScore: number
}

export default function ExamPlacementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [score, setScore] = useState("")
  const [levelThresholds, setLevelThresholds] = useState<LevelThreshold[]>([])
  const [result, setResult] = useState<{
    score: number
    level: string
    studentNote?: string
  } | null>(null)

  useEffect(() => {
    fetchLevelThresholds()
  }, [])

  const fetchLevelThresholds = async () => {
    try {
      const response = await fetch("/api/level-thresholds")
      if (response.ok) {
        const data = await response.json()
        setLevelThresholds(data)
      }
    } catch (error) {
      console.error("Error fetching level thresholds:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const scoreValue = parseFloat(score)
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        alert("Điểm phải từ 0 đến 100")
        return
      }

      // Find the appropriate level based on score
      const level = levelThresholds.find(
        threshold => scoreValue >= threshold.minScore && scoreValue <= threshold.maxScore
      )?.level || "Chưa xác định"

      const examData = {
        score: scoreValue,
        levelEstimate: level,
        notes: ""
      }

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      })

      if (response.ok) {
        setResult({
          score: scoreValue,
          level,
        })
      } else {
        throw new Error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi lưu kết quả thi")
    } finally {
      setIsLoading(false)
    }
  }

  const exportPDF = () => {
    if (!result) return

    const content = `
      KẾT QUẢ THI XẾP LỚP
      
      Điểm thi: ${result.score}/100
      Level được xếp: ${result.level}
      Ngày thi: ${new Date().toLocaleDateString('vi-VN')}
      
      ${result.studentNote ? `Ghi chú: ${result.studentNote}` : ''}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ket-qua-thi-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-600">
                Thi xếp lớp
              </CardTitle>
              <CardDescription>
                Nhập điểm thi để xem kết quả xếp lớp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="score">Điểm thi (0-100) *</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Nhập điểm thi"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Xem kết quả"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700">Kết quả thi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Điểm thi</Label>
                      <p className="text-2xl font-bold text-green-700">{result.score}/100</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Level</Label>
                      <p className="text-2xl font-bold text-green-700">{result.level}</p>
                    </div>
                  </div>
                  <Button onClick={exportPDF} className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất kết quả
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Bảng xếp level</CardTitle>
                <CardDescription>
                  Tham khảo ngưỡng điểm cho từng level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {levelThresholds.map((threshold) => (
                    <div
                      key={threshold.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{threshold.level}</span>
                      <span className="text-gray-600">
                        {threshold.minScore} - {threshold.maxScore} điểm
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 