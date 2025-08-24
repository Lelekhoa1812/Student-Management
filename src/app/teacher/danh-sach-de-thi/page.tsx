"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/ui/navbar"
import { FileText, Plus, Eye, Edit, Trash2, Users, Clock, Target, Calendar } from "lucide-react"
import { toast } from "sonner"

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
  _count: {
    assignments: number
  }
}

export default function TestListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "teacher") {
      fetchTests()
    }
  }, [session])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data)
      } else {
        toast.error("Không thể tải danh sách đề thi")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách đề thi")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTest = async (testId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Xóa đề thi thành công")
        fetchTests()
      } else {
        toast.error("Không thể xóa đề thi")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa đề thi")
    }
  }

  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(currentStatus ? "Đã ẩn đề thi" : "Đã hiển thị đề thi")
        fetchTests()
      } else {
        toast.error("Không thể cập nhật trạng thái đề thi")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái đề thi")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách đề thi</h1>
            <p className="text-gray-600">Quản lý và xem các đề thi đã tạo</p>
          </div>
          <Button 
            onClick={() => router.push('/teacher/tao-de-thi')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đề thi mới
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách đề thi...</p>
          </div>
        ) : tests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có đề thi nào</h3>
              <p className="text-gray-500 mb-6">Bắt đầu tạo đề thi đầu tiên của bạn</p>
              <Button 
                onClick={() => router.push('/teacher/tao-de-thi')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo đề thi mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{test.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description || "Không có mô tả"}
                      </CardDescription>
                    </div>
                    <Badge variant={test.isActive ? "default" : "secondary"}>
                      {test.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{test.duration} phút</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{test.totalQuestions} câu hỏi</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2" />
                      <span>{test.totalScore} điểm</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{test._count.assignments} học viên được giao</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Tạo ngày {new Date(test.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/teacher/xem-de-thi/${test.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/teacher/chinh-sua-de-thi/${test.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/teacher/gan-de-thi?testId=${test.id}`)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTestStatus(test.id, test.isActive)}
                    >
                      {test.isActive ? "Ẩn" : "Hiện"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTest(test.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
