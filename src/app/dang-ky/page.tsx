"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/ui/navbar"
import { 
  BookOpen, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  AlertCircle
} from "lucide-react"

interface Payment {
  id: string
  class_id: string
  payment_amount: number
  user_id: string
  datetime: string
  payment_method: string
  staff_assigned: string
  have_paid: boolean
  createdAt: string
  class: {
    id: string
    name: string
    level: string
    isActive: boolean
  }
  student: {
    id: string
    name: string
    gmail: string
  }
  staff: {
    id: string
    name: string
  }
}

interface Student {
  id: string
  name: string
  gmail: string
  classId?: string
  class?: {
    id: string
    name: string
    level: string
    isActive: boolean
  }
}

export default function CourseRegistrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [error, setError] = useState("")

  const fetchStudentData = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Debug - Fetching student data for email:", session?.user?.email)
      
      // Fetch student data
      const studentResponse = await fetch(`/api/students?email=${session?.user?.email}`)
      console.log("🔍 Debug - Student API response status:", studentResponse.status)
      
      if (studentResponse.ok) {
        const studentData = await studentResponse.json()
        console.log("🔍 Debug - Student data received:", studentData)
        
        if (studentData.length > 0) {
          setStudent(studentData[0])
          console.log("🔍 Debug - Student found, fetching payments for ID:", studentData[0].id)
          
          // Fetch payments for this student
          const paymentsResponse = await fetch(`/api/payments?studentId=${studentData[0].id}`)
          console.log("🔍 Debug - Payments API response status:", paymentsResponse.status)
          
          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json()
            console.log("🔍 Debug - Payments data received:", paymentsData)
            setPayments(paymentsData)
          } else {
            console.error("Error fetching payments")
          }
        } else {
          console.log("🔍 Debug - No student found for email:", session?.user?.email)
          setError("Không tìm thấy thông tin học viên")
        }
      } else {
        console.log("🔍 Debug - Student API error:", studentResponse.status)
        setError("Không thể tải thông tin học viên")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (status === "loading") {
      console.log("🔍 Debug - Session is loading...")
      return
    }

    console.log("🔍 Debug - Session status:", status)
    console.log("🔍 Debug - Session data:", session)
    console.log("🔍 Debug - User role:", session?.user?.role)
    console.log("🔍 Debug - User email:", session?.user?.email)

    if (!session) {
      console.log("🔍 Debug - No session, redirecting to login")
      router.push("/dang-nhap")
      return
    }

    if (!session.user) {
      console.log("🔍 Debug - No user in session, redirecting to login")
      router.push("/dang-nhap")
      return
    }

    if (!session.user.role) {
      console.log("🔍 Debug - No role in session, redirecting to login")
      router.push("/dang-nhap")
      return
    }

    if (session.user.role !== "user") {
      console.log("🔍 Debug - User role is not student:", session.user.role, "but allowing access for testing")
      // Temporarily allow access for debugging
      // router.push("/")
      // return
    }

    console.log("🔍 Debug - User is student, fetching data")
    fetchStudentData()
  }, [session, status, router, fetchStudentData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "student") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Thông tin đăng ký khóa học
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Xem trạng thái thanh toán học phí của bạn
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {student && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Thông tin học viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Họ tên</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.gmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Status Cards */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Trạng thái thanh toán học phí
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {payments.length === 0 
                ? "Bạn chưa được phân lớp học nào" 
                : `Bạn có ${payments.length} lớp học được phân công`
              }
            </p>
          </div>

          {payments.length === 0 ? (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Chưa có lớp học
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Bạn chưa được phân công vào lớp học nào. Vui lòng liên hệ nhân viên để được tư vấn và phân lớp.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className={`transition-all duration-200 hover:shadow-lg ${
                    payment.have_paid
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                      : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                          {payment.class.name}
                        </CardTitle>
                      </div>
                      {payment.have_paid ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Level: {payment.class.level}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Payment Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.payment_amount)}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center gap-2">
                      {payment.have_paid ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Đã thanh toán
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Chưa thanh toán
                          </span>
                        </>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Phương thức:</span> {payment.payment_method}
                    </div>

                    {/* Payment Date */}
                    {payment.have_paid && payment.datetime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Thanh toán: {formatDate(payment.datetime)}</span>
                      </div>
                    )}

                    {/* Staff Info */}
                    {payment.have_paid && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Nhân viên:</span> {payment.staff.name}
                      </div>
                    )}

                    {/* Action Message */}
                    {!payment.have_paid && (
                      <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Vui lòng liên hệ nhân viên</strong> để thanh toán học phí và hoàn tất đăng ký khóa học.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {payments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {payments.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số lớp</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {payments.filter(p => p.have_paid).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Đã thanh toán</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {payments.filter(p => !p.have_paid).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chưa thanh toán</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* <CompanyImage position="bottom" /> */}
    </div>
  )
} 