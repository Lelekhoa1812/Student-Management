"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Users, Play, StopCircle, ClipboardList, CheckSquare, Notebook, X, Loader2, RefreshCw, Wifi } from "lucide-react"

interface ClassItem {
  id: string
  name: string
  level: string
  maxStudents: number
  numSessions: number
  _count?: { studentClasses: number }
  teacher?: { id: string, name: string }
}

interface StudentItem {
  id: string
  name: string
  gmail: string
}

interface ClassNoteItem {
  sessionNumber: number
  createdAt: string
  content: string
}

interface ClassData {
  id: string
  name: string
  level: string
  maxStudents: number
  teacherName: string
  teacherId: string | null
  numSessions: number
  isActive: boolean
  createdAt: string
  students: StudentItem[]
  attendanceByStudentId: Record<string, number>
  classRegisteredByStudentId: Record<string, number>
}

export default function TeacherClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [students, setStudents] = useState<StudentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isClassStarted, setIsClassStarted] = useState(false)
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [savedPresent, setSavedPresent] = useState<Record<string, boolean>>({})
  const [isSavingAttendance, setIsSavingAttendance] = useState(false)
  const [classCount, setClassCount] = useState<number>(0)
  const [note, setNote] = useState("")
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({})
  const [classRegisteredMap, setClassRegisteredMap] = useState<Record<string, number>>({})
  const [examScores, setExamScores] = useState<Record<string, { score: number, levelEstimate: string } | null>>({})
  const [showClassModal, setShowClassModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyNotes, setHistoryNotes] = useState<ClassNoteItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
    fetchClasses()
  }, [session, status, router])

  const fetchClasses = async () => {
    try {
      const res = await fetch(`/api/classes?teacherId=${session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshClassData = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const classRes = await fetch(`/api/classes/${selectedClass.id}`);
      if (classRes.ok) {
        const data = await classRes.json() as ClassData; // Cast to ClassData
        setAttendanceMap(data?.attendanceByStudentId || {});
        setClassRegisteredMap(data?.classRegisteredByStudentId || {});
        console.log('✅ Class data refreshed successfully')
      } else {
        const errorData = await classRes.json()
        console.error('❌ Failed to refresh class data:', classRes.status, errorData)
        
        if (classRes.status === 503) {
          console.error('Database connection issue detected')
        }
      }
    } catch (e) {
      console.error('❌ Error refreshing class data:', e)
    }
  }, [selectedClass, attendanceMap, classRegisteredMap]);

  // Refresh class data when modal is shown
  useEffect(() => {
    if (showClassModal && selectedClass) {
      refreshClassData()
    }
  }, [showClassModal, selectedClass, refreshClassData])

  const openClassModal = async (cls: ClassItem) => {
    setSelectedClass(cls) // Set selectedClass first
    setIsClassStarted(false)
    setAttendance({})
    setSavedPresent({})
    setNote("")
    
    try {
      const [classRes, classroomRes] = await Promise.all([
        fetch(`/api/classes/${cls.id}`),
        fetch(`/api/teacher/classroom?classId=${cls.id}`)
      ])
      if (classRes.ok) {
        const data = await classRes.json()
        const studentsArr: StudentItem[] = Array.isArray(data?.students)
          ? data.students
          : Array.isArray(data?.studentClasses)
          ? (data.studentClasses as { student: StudentItem }[]).map((sc) => sc.student)
          : []
        setStudents(studentsArr)
        setAttendanceMap(data?.attendanceByStudentId || {})
        setClassRegisteredMap(data?.classRegisteredByStudentId || {})

        // fetch exam scores per student
        const entries = await Promise.all(
          studentsArr.map(async (st: StudentItem) => {
            try {
              const r = await fetch(`/api/exams?email=${encodeURIComponent(st.gmail)}`)
              if (r.ok) {
                const exams = await r.json()
                const latest = exams && exams.length > 0 ? exams[0] : null
                return [st.id, latest ? { score: latest.score || 0, levelEstimate: latest.levelEstimate || '' } : null] as const
              }
            } catch {}
            return [st.id, null] as const
          })
        )
        const map: Record<string, { score: number, levelEstimate: string } | null> = {}
        for (const [sid, val] of entries) map[sid] = val
        setExamScores(map)
      }
      if (classroomRes.ok) {
        const data = await classroomRes.json()
        setClassCount(data.classCount)
      }
      
      // Now open the modal after all data is loaded
      setShowClassModal(true)
    } catch (e) {
      console.error(e)
    }
  }

  const startClass = () => {
    setIsClassStarted(true)
  }

  const closeClassModal = () => {
    setShowClassModal(false)
    setSelectedClass(null)
    setIsClassStarted(false)
    setAttendance({})
    setSavedPresent({})
    setNote("")
    setClassRegisteredMap({})
  }

  const openHistory = async () => {
    if (!selectedClass) return
    setIsLoadingHistory(true)
    setShowHistoryModal(true)
    try {
      const r = await fetch(`/api/teacher/classroom?classId=${selectedClass.id}&history=true`)
      if (r.ok) {
        const data = await r.json() as { notes: { sessionNumber: number, createdAt: string, content: string }[] }
        setHistoryNotes(data.notes || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const closeHistory = () => {
    setShowHistoryModal(false)
  }

  const toggleStudent = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const saveAttendance = async () => {
    if (!selectedClass) return
    setIsSavingAttendance(true)
    
    const currentPresentIds = Object.keys(attendance).filter(id => attendance[id])
    const prevPresentIds = Object.keys(savedPresent).filter(id => savedPresent[id])

    const currentSet = new Set(currentPresentIds)
    const prevSet = new Set(prevPresentIds)

    const incrementIds = currentPresentIds.filter(id => !prevSet.has(id))
    const decrementIds = prevPresentIds.filter(id => !currentSet.has(id))

    console.log('🔄 Saving attendance...')
    console.log('📊 Current state:')
    console.log('   - Current present IDs:', currentPresentIds)
    console.log('   - Previous present IDs:', prevPresentIds)
    console.log('   - To increment:', incrementIds)
    console.log('   - To decrement:', decrementIds)
    console.log('   - Current attendance map:', attendanceMap)

    try {
      // Don't call the attendance API - just save the current session state
      // The attendance will only be incremented when the class ends
      
      // Update local attendance map for display purposes only
      const newAttendanceMap = { ...attendanceMap }
      incrementIds.forEach(id => {
        newAttendanceMap[id] = Math.max(0, (newAttendanceMap[id] || 0) + 1)
      })
      decrementIds.forEach(id => {
        newAttendanceMap[id] = Math.max(0, (newAttendanceMap[id] || 0) - 1)
      })
      
      console.log('📊 Updated local attendance map:', newAttendanceMap)
      setAttendanceMap(newAttendanceMap)
      
      // Persist the saved state so checkboxes remain
      const newSaved: Record<string, boolean> = {}
      currentPresentIds.forEach(id => { newSaved[id] = true })
      setSavedPresent(newSaved)
      
      console.log('✅ Attendance session state saved locally (not incremented in database)')
      alert("Đã lưu trạng thái điểm danh buổi học")
      
    } catch (e) {
      console.error('❌ Error saving attendance:', e)
      alert("Có lỗi khi lưu điểm danh")
    } finally {
      setIsSavingAttendance(false)
    }
  }

  const endClass = async () => {
    if (!selectedClass) return
    setIsEnding(true)
    
    try {
      // First, increment attendance for students who were present in this session
      const presentStudentIds = Object.keys(savedPresent).filter(id => savedPresent[id])
      
      if (presentStudentIds.length > 0) {
        console.log('🔄 Ending class - incrementing attendance for present students:', presentStudentIds)
        
        try {
          const attendanceResponse = await fetch(`/api/teacher/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              classId: selectedClass.id, 
              incrementIds: presentStudentIds, 
              decrementIds: [] 
            })
          })
          
          if (attendanceResponse.ok) {
            console.log('✅ Attendance incremented successfully for present students')
          } else {
            const errorData = await attendanceResponse.json()
            console.error('❌ Failed to increment attendance:', attendanceResponse.status, errorData)
            
            if (attendanceResponse.status === 503) {
              alert("Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại.")
              return
            }
          }
        } catch (error) {
          console.error('❌ Error incrementing attendance:', error)
          alert("Lỗi khi cập nhật điểm danh. Vui lòng thử lại.")
          return
        }
      }
      
      // Then, end the class session
      const response = await fetch(`/api/teacher/classroom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass.id, note })
      })
      
      if (response.ok) {
        setClassCount(prev => prev + 1)
        
        // Only reset the current session attendance, not the accumulated attendance
        setAttendance({})
        setSavedPresent({})
        setNote("")
        
        // Refresh class data to get latest attendance and classRegistered values
        // This will preserve the accumulated attendance from the database
        await refreshClassData()
        
        alert("Đã kết thúc buổi học và cập nhật điểm danh")
        // Don't close the modal immediately, let teacher see the updated attendance
        // closeClassModal()
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to end class:', response.status, errorData)
        
        if (response.status === 503) {
          alert("Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại.")
        } else {
          alert("Có lỗi khi kết thúc buổi học")
        }
      }
    } catch (error) {
      console.error('❌ Error in endClass:', error)
      alert("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsEnding(false)
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
            <CardTitle>Lớp học của tôi</CardTitle>
            <CardDescription>Danh sách các lớp bạn được phân công</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-w-2xl mx-auto">
                {classes.map((cls) => (
                  <div key={cls.id} className={`p-4 border rounded mb-3 ${selectedClass?.id === cls.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{cls.name}</div>
                        <div className="text-sm text-gray-600">Level: {cls.level}</div>
                        <div className="text-sm text-gray-600">Sỉ số: {cls._count?.studentClasses || 0}/{cls.maxStudents}</div>
                        <div className="text-sm text-gray-600">Số buổi: {cls.numSessions}</div>
                      </div>
                      <Button size="sm" onClick={() => openClassModal(cls)}>
                        <Play className="w-4 h-4 mr-1" /> Mở lớp
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Modal */}
        {showClassModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedClass.name}</h2>
                  <p className="text-gray-600">Level: {selectedClass.level} | Buổi hiện tại: {classCount + 1}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeClassModal} className="group hover:bg-red-100">
                  <X className="w-5 h-5 text-black group-hover:text-red-600" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {!isClassStarted ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-black mb-4">Sẵn sàng bắt đầu buổi học?</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={startClass} size="lg">
                        <Play className="w-4 h-4 mr-2" /> Bắt đầu lớp học
                      </Button>
                      <Button variant="outline" onClick={openHistory}>
                        Xem lịch sử lớp học
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Button onClick={saveAttendance} variant="outline" disabled={isSavingAttendance}>
                        {isSavingAttendance ? (
                          <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</span>
                        ) : (
                          <span className="inline-flex items-center"><CheckSquare className="w-4 h-4 mr-1" /> Lưu điểm danh</span>
                        )}
                      </Button>
                      <Button onClick={endClass} disabled={isEnding}>
                        <StopCircle className="w-4 h-4 mr-1" /> {isEnding ? 'Đang kết thúc...' : 'Kết thúc lớp học'}
                      </Button>
                      {classCount > 0 && (
                        <Button onClick={closeClassModal} variant="outline">
                          <X className="w-4 h-4 mr-1" /> Đóng lớp học
                        </Button>
                      )}
                    </div>

                    {/* Student List */}
                    <div className="border rounded p-3 text-black">
                      {/* Debug Section */}
                      {/* <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
                        <div className="font-semibold">Debug Info:</div>
                        <div>attendanceMap: {JSON.stringify(attendanceMap)}</div>
                        <div>classRegisteredMap: {JSON.stringify(classRegisteredMap)}</div>
                        <div>selectedClass?.numSessions: {selectedClass?.numSessions}</div>
                      </div> */}
                      
                      {/* System Explanation */}
                      <div className="mb-3 p-2 bg-gray-300 rounded text-xs text-blue-800">
                        <div className="font-semibold">ℹ️ Hệ thống điểm danh:</div>
                        <div>• <strong>Danh sách  điểm danh:</strong> Chọn ô điểm danh, và huỷ chọn để hoàn tác.</div>
                        <div>• <strong>Lưu trạng thái điểm danh:</strong> Lưu trạng thái điểm danh trong lớp học.</div>
                        <div>• <strong>Kết thúc lớp học:</strong> Lưu tổng điểm danh cuối cùng và ghi chú buổi học</div>
                        <div>• <strong>Điểm danh hiển thị:</strong> Tổng số buổi đã tham gia / Số buổi đã đăng ký</div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-black">
                          <ClipboardList className="w-4 h-4 text-black" /> Điểm danh lớp học
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={refreshClassData}
                            className="text-xs text-black bg-blue-500 hover:bg-blue-900 hover:text-white"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Làm mới
                          </Button>
                          
                          {/* Retry button for connection issues */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              alert("Đang thử kết nối lại cơ sở dữ liệu...")
                              refreshClassData()
                            }}
                            className="text-xs text-black bg-yellow-500 hover:bg-yellow-900 hover:text-white"
                          >
                            <Wifi className="w-3 h-3 mr-1" />
                            Thử lại
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto text-black">
                        {students.map(st => {
                          const attended = attendanceMap[st.id] || 0
                          const classRegistered = classRegisteredMap[st.id] || selectedClass?.numSessions || 0
                          const exam = examScores[st.id]
                          const hasReachedLimit = attended >= classRegistered
                          
                          return (
                            <div 
                              key={st.id} 
                              className={`flex items-center justify-between gap-3 p-2 rounded ${
                                hasReachedLimit ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : ''
                              }`}
                            >
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={!!attendance[st.id]} 
                                  onChange={() => toggleStudent(st.id)}
                                  disabled={hasReachedLimit}
                                  className={hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}
                                />
                                <span className={hasReachedLimit ? 'text-red-700 dark:text-red-700' : ''}>
                                  {st.name} - {st.gmail}
                                  {hasReachedLimit && <span className="ml-2 text-xs font-medium">(Đã hết buổi học)</span>}
                                </span>
                              </label>
                              <div className="text-xs text-gray-600 whitespace-nowrap">
                                <span className={`mr-3 ${hasReachedLimit ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                  {attended}/{classRegistered}
                                </span>
                                <span>{exam ? `Điểm: ${exam.score} (${exam.levelEstimate || 'N/A'})` : 'Điểm: N/A'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2 text-sm text-black">
                        <Notebook className="w-4 h-4" /> Ghi chú buổi học
                      </div>
                      <textarea 
                        className="w-full border rounded p-2" 
                        rows={4} 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)} 
                        placeholder="Nội dung buổi học..." 
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* History Modal */}
            {showHistoryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-60 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-black">Lịch sử lớp học</h3>
                    <Button variant="ghost" size="sm" onClick={closeHistory} className="group hover:bg-red-100">
                      <X className="w-5 h-5 text-black group-hover:text-red-600" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : historyNotes.length === 0 ? (
                      <div className="text-sm text-gray-600">Chưa có lịch sử ghi chú.</div>
                    ) : (
                      historyNotes.map((n) => (
                        <div key={`${n.sessionNumber}-${n.createdAt}`} className="border rounded p-3 bg-gray-50">
                          <div className="text-sm font-medium">Buổi {n.sessionNumber}</div>
                          <div className="text-xs text-gray-500 mb-1">{new Date(n.createdAt).toLocaleString()}</div>
                          <div className="text-sm">{n.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

