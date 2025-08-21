"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { FileText, Plus, AlertCircle } from "lucide-react"

export default function CreateExamPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
  }, [session, status, router])

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
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-purple-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-purple-600">
                Tạo đề thi
              </CardTitle>
            </div>
            <CardDescription>
              Tạo và quản lý đề thi cho học viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-orange-600 mb-4">
                Tính năng đang phát triển
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Chức năng tạo đề thi sẽ được cập nhật trong phiên bản tiếp theo. 
                Bạn sẽ có thể tạo các đề thi với nhiều loại câu hỏi khác nhau.
              </p>
              <div className="space-y-4">
                <Button disabled className="w-full max-w-xs">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo đề thi mới
                </Button>
                <Button variant="outline" disabled className="w-full max-w-xs">
                  Xem danh sách đề thi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
