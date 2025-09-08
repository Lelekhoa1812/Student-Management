"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { CompanyImage } from "@/components/ui/company-image"
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Users } from "lucide-react"
import Link from "next/link"

interface StudentPayment {
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  paymentAmount: number
  hasPaid: boolean
  paymentDate?: string
  paymentMethod?: string
  discountPercentage?: number
  discountReason?: string
}

interface ClassDetails {
  classId: string
  className: string
  level: string
  totalEarnings: number
  pendingAmount: number
  paidStudents: StudentPayment[]
  unpaidStudents: StudentPayment[]
}

export default function ClassEarningsDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [classId, setClassId] = useState<string | null>(null)

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setClassId(resolvedParams.classId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role !== "cashier") {
      router.push("/")
      return
    }

    if (classId) {
      fetchClassDetails()
    }
  }, [session, status, router, classId])

  const fetchClassDetails = async () => {
    if (!classId) return
    try {
      const response = await fetch(`/api/class-earnings/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setClassDetails(data)
      }
    } catch (error) {
      console.error("Error fetching class details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy lớp học</h1>
            <Link href="/doanh-thu-lop-hoc">
              <Button>Quay lại danh sách</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/doanh-thu-lop-hoc">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              {classDetails.className}
            </h1>
            <p className="text-lg text-gray-600">
              Level: {classDetails.level} - Chi tiết doanh thu
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(classDetails.totalEarnings)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chưa thu</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(classDetails.pendingAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {classDetails.paidStudents.length} học viên
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {classDetails.unpaidStudents.length} học viên
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Paid Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Học viên đã thanh toán ({classDetails.paidStudents.length})
              </CardTitle>
              <CardDescription>
                Tổng: {formatCurrency(classDetails.totalEarnings)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {classDetails.paidStudents.map((student) => (
                  <div key={student.studentId} className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(student.paymentAmount)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {student.studentEmail}</p>
                      <p>SĐT: {student.studentPhone}</p>
                      {student.paymentDate && (
                        <p>Ngày thanh toán: {formatDate(student.paymentDate)}</p>
                      )}
                      {student.paymentMethod && (
                        <p>Phương thức: {student.paymentMethod}</p>
                      )}
                      {student.discountPercentage && student.discountPercentage > 0 && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded">
                          <p className="text-xs text-yellow-800">
                            Giảm giá: {student.discountPercentage}%
                          </p>
                          {student.discountReason && (
                            <p className="text-xs text-yellow-800">
                              Lý do: {student.discountReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {classDetails.paidStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có học viên nào thanh toán</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Unpaid Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Học viên chưa thanh toán ({classDetails.unpaidStudents.length})
              </CardTitle>
              <CardDescription>
                Tổng: {formatCurrency(classDetails.pendingAmount)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {classDetails.unpaidStudents.map((student) => (
                  <div key={student.studentId} className="border rounded-lg p-4 bg-red-50 border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(student.paymentAmount)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {student.studentEmail}</p>
                      <p>SĐT: {student.studentPhone}</p>
                      {student.discountPercentage && student.discountPercentage > 0 && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded">
                          <p className="text-xs text-yellow-800">
                            Giảm giá: {student.discountPercentage}%
                          </p>
                          {student.discountReason && (
                            <p className="text-xs text-yellow-800">
                              Lý do: {student.discountReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {classDetails.unpaidStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Tất cả học viên đã thanh toán</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* <CompanyImage position="bottom" /> */}
    </div>
  )
}
