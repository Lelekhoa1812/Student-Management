"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, MessageSquare, Bug, Lightbulb, AlertTriangle, HelpCircle } from "lucide-react"

interface Feedback {
  id: string
  userId: string
  userRole: string
  type: string
  title: string
  description: string
  screenshot?: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function FeedbackManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  // Redirect if not staff or cashier
  useEffect(() => {
    if (session && session.user?.role !== "staff" && session.user?.role !== "cashier") {
      router.push("/")
    }
  }, [session, router])

  // Fetch feedback data
  useEffect(() => {
    if (session?.user?.role === "staff" || session?.user?.role === "cashier") {
      fetchFeedback()
    }
  }, [session])

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback")
      if (response.ok) {
        const data = await response.json()
        setFeedback(data)
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFeedback = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFeedback(prev => prev.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4" />
      case "feature":
        return <Lightbulb className="h-4 w-4" />
      case "complaint":
        return <AlertTriangle className="h-4 w-4" />
      case "suggestion":
        return <HelpCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug":
        return "Báo lỗi"
      case "feature":
        return "Đề xuất tính năng"
      case "complaint":
        return "Khiếu nại"
      case "suggestion":
        return "Góp ý"
      default:
        return "Khác"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "user":
        return "Học viên"
      case "staff":
        return "Nhân viên"
      case "manager":
        return "Quản lý"
      default:
        return role
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case "in_progress":
        return <Badge variant="default">Đang xử lý</Badge>
      case "resolved":
        return <Badge variant="default" className="bg-green-500">Đã giải quyết</Badge>
      case "closed":
        return <Badge variant="outline">Đã đóng</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  if (session?.user?.role !== "staff" && session?.user?.role !== "cashier") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý phản hồi khách hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Xem và quản lý tất cả phản hồi từ người dùng hệ thống
          </p>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Chưa có phản hồi nào
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Hiện tại chưa có phản hồi nào từ người dùng.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                          <Badge variant="outline">{getRoleLabel(item.userRole)}</Badge>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFeedback(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <span>Gửi lúc: {formatDate(item.createdAt)}</span>
                    {item.screenshot && (
                      <span className="text-blue-600">📷 Có hình ảnh</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chi tiết phản hồi
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFeedback(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedFeedback.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant="outline">{getTypeLabel(selectedFeedback.type)}</Badge>
                    <Badge variant="outline">{getRoleLabel(selectedFeedback.userRole)}</Badge>
                    {getStatusBadge(selectedFeedback.status)}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Mô tả:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedFeedback.description}
                  </p>
                </div>

                {selectedFeedback.screenshot && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Hình ảnh:
                    </h4>
                    <img
                      src={selectedFeedback.screenshot}
                      alt="Screenshot"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>Gửi lúc: {formatDate(selectedFeedback.createdAt)}</p>
                  <p>Cập nhật lúc: {formatDate(selectedFeedback.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 