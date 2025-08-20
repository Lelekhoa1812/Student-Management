"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/ui/navbar"

interface StudentItem {
  id: string
  name: string
  gmail: string
  examResult?: { score: number, levelEstimate: string }
}

export default function TeacherGradingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<StudentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
    fetchStudents()
  }, [session, status, router])

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
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
        <Card>
          <CardHeader>
            <CardTitle>Xét điểm</CardTitle>
            <CardDescription>Xem điểm thi gần nhất của học viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map(st => (
                <div key={st.id} className="p-3 border rounded">
                  <div className="font-semibold">{st.name}</div>
                  <div className="text-sm text-gray-700">{st.gmail}</div>
                  {st.examResult ? (
                    <div className="text-sm">Điểm: {st.examResult.score} | Level: {st.examResult.levelEstimate}</div>
                  ) : (
                    <div className="text-sm text-gray-500">Chưa có kết quả</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

