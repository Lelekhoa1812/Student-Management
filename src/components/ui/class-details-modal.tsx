"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Users, BookOpen, User, Calendar } from "lucide-react"

interface Student {
  id: string
  name: string
  gmail: string
}

interface ClassDetails {
  id: string
  name: string
  level: string
  maxStudents: number
  numSessions?: number
  teacherName: string
  isActive: boolean
  createdAt: string
  students: Student[]
}

interface ClassDetailsModalProps {
  classDetails: ClassDetails | null
  isOpen: boolean
  onClose: () => void
}

export function ClassDetailsModal({ classDetails, isOpen, onClose }: ClassDetailsModalProps) {
  if (!isOpen || !classDetails) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Chi tiết lớp học
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Class Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {classDetails.name}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Thông tin chung về lớp học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {classDetails.level}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Giáo viên:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {classDetails.teacherName || "Chưa phân công"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sĩ số:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {classDetails.students.length}/{classDetails.maxStudents}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Số buổi:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {classDetails.numSessions ?? 24}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ngày tạo:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(classDetails.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Danh sách học viên ({classDetails.students.length})
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Danh sách học viên đang theo học lớp này
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classDetails.students.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>Chưa có học viên nào trong lớp</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classDetails.students.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.gmail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
