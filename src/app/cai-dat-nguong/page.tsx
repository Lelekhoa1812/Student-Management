"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/ui/navbar"
import { Settings, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface LevelThreshold {
  id: string
  level: string
  minScore: number
  maxScore: number
}

export default function LevelThresholdPage() {
  const [thresholds, setThresholds] = useState<LevelThreshold[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    level: "",
    minScore: "",
    maxScore: ""
  })

  useEffect(() => {
    fetchThresholds()
  }, [])

  const fetchThresholds = async () => {
    try {
      const response = await fetch("/api/level-thresholds")
      if (response.ok) {
        const data = await response.json()
        setThresholds(data)
      }
    } catch (error) {
      console.error("Error fetching thresholds:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const minScore = parseFloat(formData.minScore)
      const maxScore = parseFloat(formData.maxScore)

      if (isNaN(minScore) || isNaN(maxScore) || minScore < 0 || maxScore > 100 || minScore >= maxScore) {
        alert("Điểm phải hợp lệ: min < max, 0-100")
        return
      }

      const response = await fetch("/api/level-thresholds", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          level: formData.level,
          minScore,
          maxScore,
        }),
      })

      if (response.ok) {
        setFormData({ level: "", minScore: "", maxScore: "" })
        setEditingId(null)
        fetchThresholds()
      } else {
        throw new Error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi lưu ngưỡng điểm")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (threshold: LevelThreshold) => {
    setEditingId(threshold.id)
    setFormData({
      level: threshold.level,
      minScore: threshold.minScore.toString(),
      maxScore: threshold.maxScore.toString(),
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ level: "", minScore: "", maxScore: "" })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa ngưỡng điểm này?")) return

    try {
      const response = await fetch(`/api/level-thresholds/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchThresholds()
      } else {
        throw new Error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi xóa ngưỡng điểm")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Navbar />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {editingId ? "Chỉnh sửa ngưỡng điểm" : "Thêm ngưỡng điểm mới"}
              </CardTitle>
              <CardDescription>
                Cấu hình ngưỡng điểm cho từng level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Tên level *</Label>
                  <Input
                    id="level"
                    type="text"
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="Ví dụ: A1, A2, B1, B2..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minScore">Điểm tối thiểu *</Label>
                    <Input
                      id="minScore"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={formData.minScore}
                      onChange={(e) => setFormData({ ...formData, minScore: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Điểm tối đa *</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách ngưỡng điểm</CardTitle>
              <CardDescription>
                Quản lý các ngưỡng điểm hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {thresholds.map((threshold) => (
                  <div
                    key={threshold.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{threshold.level}</div>
                      <div className="text-sm text-gray-600">
                        {threshold.minScore} - {threshold.maxScore} điểm
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(threshold)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(threshold.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {thresholds.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Chưa có ngưỡng điểm nào được cấu hình
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 