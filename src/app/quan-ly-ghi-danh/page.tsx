"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { 
  Search, 
  Filter, 
  DollarSign, 
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  Edit
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

export default function RegistrationManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [editingPayment, setEditingPayment] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    have_paid: false,
    payment_method: ""
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role !== "staff") {
      router.push("/")
      return
    }

    fetchPayments()
  }, [session, status, router])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, paymentFilter])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      } else {
        setError("Không thể tải danh sách thanh toán")
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError("Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    // Filter by search term (student name or class name)
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.class.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by payment status
    if (paymentFilter === "paid") {
      filtered = filtered.filter(payment => payment.have_paid)
    } else if (paymentFilter === "unpaid") {
      filtered = filtered.filter(payment => !payment.have_paid)
    }

    setFilteredPayments(filtered)
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment.id)
    setEditForm({
      have_paid: payment.have_paid,
      payment_method: payment.payment_method
    })
  }

  const handleSavePayment = async () => {
    if (!editingPayment || !session?.user?.id) return

    try {
      const response = await fetch("/api/payments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingPayment,
          have_paid: editForm.have_paid,
          payment_method: editForm.payment_method,
          staff_assigned: session.user.id
        }),
      })

      if (response.ok) {
        setSuccess("Cập nhật thanh toán thành công!")
        await fetchPayments()
        setEditingPayment(null)
        setEditForm({ have_paid: false, payment_method: "" })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error updating payment:", error)
      setError("Có lỗi xảy ra khi cập nhật thanh toán")
    }
  }

  const handleCancelEdit = () => {
    setEditingPayment(null)
    setEditForm({ have_paid: false, payment_method: "" })
  }

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

  if (!session || session.user?.role !== "staff") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Quản lý Ghi danh
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý thanh toán học phí của học viên
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tên học viên hoặc lớp học"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filter">Trạng thái thanh toán</Label>
                <select
                  id="filter"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as "all" | "paid" | "unpaid")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Tất cả</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={fetchPayments}
                  className="w-full"
                >
                  Làm mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
            {success}
          </div>
        )}

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Danh sách thanh toán ({filteredPayments.length})
            </CardTitle>
            <CardDescription>
              Quản lý trạng thái thanh toán học phí của học viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy thanh toán nào
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      payment.have_paid 
                        ? "border-green-200 bg-green-50" 
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Student and Class Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{payment.student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span>{payment.class.name} ({payment.class.level})</span>
                        </div>
                      </div>

                      {/* Payment Amount */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold">{formatCurrency(payment.payment_amount)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Phương thức: {payment.payment_method}
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {payment.have_paid ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">Đã thanh toán</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-600 font-medium">Chưa thanh toán</span>
                            </>
                          )}
                        </div>
                        {payment.have_paid && (
                          <div className="text-sm text-gray-600">
                            Nhân viên: {payment.staff.name}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {editingPayment === payment.id ? (
                          <div className="space-y-2 w-full">
                            <div>
                              <Label className="text-sm">Phương thức thanh toán</Label>
                              <Input
                                value={editForm.payment_method}
                                onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                                placeholder="Nhập phương thức thanh toán"
                                className="text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`paid-${payment.id}`}
                                checked={editForm.have_paid}
                                onChange={(e) => setEditForm({ ...editForm, have_paid: e.target.checked })}
                                className="rounded"
                              />
                              <Label htmlFor={`paid-${payment.id}`} className="text-sm">
                                Đã thanh toán
                              </Label>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSavePayment}>
                                Lưu
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Payment Date */}
                    {payment.have_paid && payment.datetime && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Thanh toán lúc: {formatDate(payment.datetime)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <CompanyImage position="bottom" /> */}
    </div>
  )
} 