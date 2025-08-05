"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyImage } from "@/components/ui/company-image"
import { Navbar } from "@/components/ui/navbar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, TrendingUp, Users, DollarSign } from "lucide-react"

interface KPIData {
  staffName: string
  todayCount: number
  weekCount: number
  monthCount: number
}

export default function KPIDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/dang-nhap")
      return
    }

    if (session.user?.role !== "manager") {
      router.push("/")
      return
    }

    fetchKPIData()
  }, [session, status, router])

  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/kpi')
      if (response.ok) {
        const data = await response.json()
        setKpiData(data)
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getChartData = () => {
    return kpiData.map(item => ({
      name: item.staffName,
      [timeFilter === 'today' ? 'Hôm nay' : timeFilter === 'week' ? 'Tuần này' : 'Tháng này']: 
        timeFilter === 'today' ? item.todayCount : 
        timeFilter === 'week' ? item.weekCount : item.monthCount
    }))
  }

  const getTotalCount = () => {
    return kpiData.reduce((total, item) => {
      const count = timeFilter === 'today' ? item.todayCount : 
                   timeFilter === 'week' ? item.weekCount : item.monthCount
      return total + count
    }, 0)
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            Bảng điều khiển KPI
          </h1>
          <p className="text-lg text-gray-600">
            Theo dõi hiệu suất của nhân viên
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <Button
              variant={timeFilter === 'today' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('today')}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Hôm nay
            </Button>
            <Button
              variant={timeFilter === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('week')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Tuần này (7 ngày)
            </Button>
            <Button
              variant={timeFilter === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('month')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Tháng này (30 ngày)
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số giao dịch</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalCount()}</div>
              <p className="text-xs text-muted-foreground">
                {timeFilter === 'today' ? 'Hôm nay' : 
                 timeFilter === 'week' ? '7 ngày qua' : '30 ngày qua'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số nhân viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.length}</div>
              <p className="text-xs text-muted-foreground">
                Nhân viên hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trung bình/NV</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiData.length > 0 ? Math.round(getTotalCount() / kpiData.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Giao dịch trung bình
              </p>
            </CardContent>
          </Card>
        </div>

        {/* KPI Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-purple-600" />
              Biểu đồ KPI theo nhân viên
            </CardTitle>
            <CardDescription>
              Số lượng giao dịch được xử lý bởi từng nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpiData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey={timeFilter === 'today' ? 'Hôm nay' : 
                             timeFilter === 'week' ? 'Tuần này' : 'Tháng này'} 
                    fill="#8b5cf6" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Không có dữ liệu KPI</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CompanyImage position="bottom" />
    </div>
  )
} 