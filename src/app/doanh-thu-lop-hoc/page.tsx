"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { CompanyImage } from "@/components/ui/company-image"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, Users, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"

interface ClassEarnings {
  classId: string
  className: string
  level: string
  totalEarnings: number
  pendingAmount: number
  paidStudents: number
  unpaidStudents: number
  totalStudents: number
}

export default function DoanhThuLopHocPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classEarnings, setClassEarnings] = useState<ClassEarnings[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

    fetchClassEarnings()
  }, [session, status, router])

  const fetchClassEarnings = async () => {
    try {
      const response = await fetch('/api/class-earnings')
      if (response.ok) {
        const data = await response.json()
        setClassEarnings(data)
      }
    } catch (error) {
      console.error("Error fetching class earnings:", error)
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

  const getBarChartData = () => {
    return classEarnings.map(classData => ({
      name: classData.className,
      earnings: classData.totalEarnings,
      pending: classData.pendingAmount
    }))
  }

  const getPieChartData = () => {
    const totalEarnings = classEarnings.reduce((sum, classData) => sum + classData.totalEarnings, 0)
    const totalPending = classEarnings.reduce((sum, classData) => sum + classData.pendingAmount, 0)
    
    return [
      { name: 'Đã thu', value: totalEarnings, color: '#10b981' },
      { name: 'Chưa thu', value: totalPending, color: '#ef4444' }
    ]
  }

  const totalEarnings = classEarnings.reduce((sum, classData) => sum + classData.totalEarnings, 0)
  const totalPending = classEarnings.reduce((sum, classData) => sum + classData.pendingAmount, 0)
  const totalPaidStudents = classEarnings.reduce((sum, classData) => sum + classData.paidStudents, 0)
  const totalUnpaidStudents = classEarnings.reduce((sum, classData) => sum + classData.unpaidStudents, 0)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Doanh Thu Lớp Học
          </h1>
          <p className="text-lg text-gray-600">
            Tổng quan doanh thu và thanh toán theo lớp học
          </p>
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
                {formatCurrency(totalEarnings)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chưa thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPending)}
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
                {totalPaidStudents} học viên
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
                {totalUnpaidStudents} học viên
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo lớp học</CardTitle>
              <CardDescription>
                So sánh doanh thu đã thu và chưa thu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'earnings' ? 'Đã thu' : 'Chưa thu'
                    ]}
                  />
                  <Bar dataKey="earnings" fill="#10b981" name="Đã thu" />
                  <Bar dataKey="pending" fill="#ef4444" name="Chưa thu" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tỷ lệ thu/chi</CardTitle>
              <CardDescription>
                Phân bố tổng doanh thu và số tiền chưa thu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Class List */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết từng lớp học</CardTitle>
            <CardDescription>
              Danh sách tất cả lớp học với thông tin doanh thu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classEarnings.map((classData) => (
                <div key={classData.classId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {classData.className}
                      </h3>
                      <p className="text-sm text-gray-600">Level: {classData.level}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Đã thu</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(classData.totalEarnings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Chưa thu</p>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(classData.pendingAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Đã thanh toán</p>
                          <p className="font-semibold text-blue-600">
                            {classData.paidStudents}/{classData.totalStudents}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Chưa thanh toán</p>
                          <p className="font-semibold text-orange-600">
                            {classData.unpaidStudents}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href={`/doanh-thu-lop-hoc/${classData.classId}`}>
                        <Button className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CompanyImage position="bottom" />
    </div>
  )
}
