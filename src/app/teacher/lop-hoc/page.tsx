"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Users, Play, StopCircle, ClipboardList, CheckSquare, Notebook } from "lucide-react"

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

export default function TeacherClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [students, setStudents] = useState<StudentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [classCount, setClassCount] = useState<number>(0)
  const [note, setNote] = useState("")
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({})
  const [examScores, setExamScores] = useState<Record<string, { score: number, levelEstimate: string } | null>>({})

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

  const openClass = async (cls: ClassItem) => {
    setSelectedClass(null)
    setIsStarting(true)
    try {
      const [classRes, classroomRes] = await Promise.all([
        fetch(`/api/classes?id=${cls.id}`),
        fetch(`/api/teacher/classroom?classId=${cls.id}`)
      ])
      if (classRes.ok) {
        const data = await classRes.json()
        setStudents(data.students)
        setAttendanceMap(data.attendanceByStudentId || {})

        // fetch exam scores per student
        const entries = await Promise.all(
          (data.students as StudentItem[]).map(async (st: StudentItem) => {
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
      setSelectedClass(cls)
    } finally {
      setIsStarting(false)
    }
  }

  const toggleStudent = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const saveAttendance = async () => {
    if (!selectedClass) return
    const presentStudentIds = Object.keys(attendance).filter(id => attendance[id])
    try {
      await fetch(`/api/teacher/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass.id, presentStudentIds })
      })
      alert("Đã lưu điểm danh")
    } catch (e) {
      console.error(e)
    }
  }

  const endClass = async () => {
    if (!selectedClass) return
    setIsEnding(true)
    try {
      await fetch(`/api/teacher/classroom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass.id, note })
      })
      setClassCount(prev => prev + 1)
      setAttendance({})
      setNote("")
      alert("Đã kết thúc buổi học")
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {classes.map((cls) => (
                  <div key={cls.id} className={`p-4 border rounded mb-3 ${selectedClass?.id === cls.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{cls.name}</div>
                        <div className="text-sm text-gray-600">Level: {cls.level}</div>
                        <div className="text-sm text-gray-600">Sỉ số: {cls._count?.studentClasses || 0}/{cls.maxStudents}</div>
                        <div className="text-sm text-gray-600">Số buổi: {cls.numSessions}</div>
                      </div>
                      <Button size="sm" onClick={() => openClass(cls)}>
                        <Play className="w-4 h-4 mr-1" /> Mở lớp
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {selectedClass && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{selectedClass.name}</div>
                      <div>Buổi hiện tại: {classCount + 1}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveAttendance} variant="outline">
                        <CheckSquare className="w-4 h-4 mr-1" /> Kết thúc điểm danh
                      </Button>
                      <Button onClick={endClass} disabled={isEnding}>
                        <StopCircle className="w-4 h-4 mr-1" /> {isEnding ? 'Đang kết thúc...' : 'Kết thúc lớp học'}
                      </Button>
                    </div>

                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-700"><ClipboardList className="w-4 h-4" /> Điểm danh lớp học</div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {students.map(st => {
                          const attended = attendanceMap[st.id] || 0
                          const total = selectedClass?.numSessions || 0
                          const exam = examScores[st.id]
                          return (
                            <div key={st.id} className="flex items-center justify-between gap-3">
                              <label className="flex items-center gap-2">
                                <input type="checkbox" checked={!!attendance[st.id]} onChange={() => toggleStudent(st.id)} />
                                <span>{st.name} - {st.gmail}</span>
                              </label>
                              <div className="text-xs text-gray-600 whitespace-nowrap">
                                <span className="mr-3">{attended}/{total}</span>
                                <span>{exam ? `Điểm: ${exam.score} (${exam.levelEstimate || 'N/A'})` : 'Điểm: N/A'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-700"><Notebook className="w-4 h-4" /> Ghi chú buổi học</div>
                      <textarea className="w-full border rounded p-2" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nội dung buổi học..." />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

