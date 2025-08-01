"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

interface LevelThreshold {
  id: string
  level: string
  minScore: number
  maxScore: number
}

export default function CourseRegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [levelThresholds, setLevelThresholds] = useState<LevelThreshold[]>([])
  const [selectedLevel, setSelectedLevel] = useState("")
  const [amountPaid, setAmountPaid] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  useEffect(() => {
    fetchLevelThresholds()
  }, [])

  const fetchLevelThresholds = async () => {
    try {
      const response = await fetch("/api/level-thresholds")
      if (response.ok) {
        const data = await response.json()
        setLevelThresholds(data)
      }
    } catch (error) {
      console.error("Error fetching level thresholds:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amount = parseFloat(amountPaid)
      if (isNaN(amount) || amount < 0) {
        alert("Số tiền phải là số dương")
        return
      }

      const registrationData = {
        levelName: selectedLevel,
        amountPaid: amount,
        paid: isPaid,
      }

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        setRegistrationSuccess(true)
        // Reset form
        setSelectedLevel("")
        setAmountPaid("")
        setIsPaid(false)
      } else {
        throw new Error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi đăng ký khóa học")
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                Đăng ký thành công!
              </CardTitle>
              <CardDescription className="text-green-600">
                Cảm ơn bạn đã đăng ký khóa học
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/">
                <Button className="w-full">
                  Quay lại trang chủ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CreditCard className="w-12 h-12 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              Đăng ký khóa học
            </CardTitle>
            <CardDescription>
              Chọn level và thanh toán học phí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="level">Chọn level *</Label>
                <select
                  id="level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  required
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Chọn level</option>
                  {levelThresholds.map((threshold) => (
                    <option key={threshold.id} value={threshold.level}>
                      {threshold.level} ({threshold.minScore}-{threshold.maxScore} điểm)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amountPaid">Học phí (VND) *</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Nhập số tiền học phí"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPaid">Đã thanh toán</Label>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang đăng ký..." : "Đăng ký khóa học"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 