"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Scope = "all" | "my-classes"

interface AssignmentListItem {
  id: string
  test: { id: string; title: string; teacherId: string; totalScore: number }
  student: { id: string; name: string; gmail: string }
  score: number | null
  completedAt: string
}

interface Question {
  id: string
  questionText: string
  questionType: string
  order: number
  score: number
  options?: { id: string; optionText: string; optionKey: string; isCorrect: boolean; order: number }[]
  mappingColumns?: { id: string; columnType: string; itemText: string; order: number }[]
}

interface Answer {
  id: string
  assignmentId: string
  questionId: string
  answerText?: string | null
  selectedOptions?: string[]
  mappingAnswers?: string[]
  score?: number | null
  feedback?: string | null
}

interface AssignmentDetail {
  id: string
  score: number | null
  student: { id: string; name: string; gmail: string }
  test: { id: string; title: string; totalScore: number; teacherId: string; questions: Question[] }
  answers: Answer[]
}

const viQuestionType = (t: string) => {
  switch (t) {
    case "mcq":
      return "Trắc nghiệm"
    case "constructed_response":
      return "Tự luận"
    case "fill_blank":
      return "Điền vào chỗ trống"
    case "mapping":
      return "Ghép cặp"
    default:
      return t
  }
}

export default function TeacherGradingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [scope, setScope] = useState<Scope>("my-classes")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<AssignmentListItem[]>([])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<AssignmentDetail | null>(null)
  const [saving, setSaving] = useState(false)

  // local grading edits
  const [edits, setEdits] = useState<Record<string, { score?: number; feedback?: string }>>({})

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/dang-nhap"); return }
    if (session.user?.role !== "teacher") { router.push("/"); return }
    loadList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, scope])

  const loadList = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ scope })
      if (query.trim()) params.set("query", query.trim())
      const res = await fetch(`/api/teacher/grades?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const openDetail = async (id: string) => {
    try {
      setSelectedId(id)
      setDetail(null)
      setEdits({})
      const res = await fetch(`/api/teacher/grades/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDetail(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const changeEdit = (answerId: string, patch: { score?: number; feedback?: string }) => {
    setEdits(prev => ({ ...prev, [answerId]: { ...prev[answerId], ...patch } }))
  }

  const perAnswerPayload = useMemo(() => {
    if (!detail) return []
    return detail.answers.map(a => {
      const e = edits[a.id] || {}
      return {
        answerId: a.id,
        score: typeof e.score === "number" ? e.score : a.score ?? undefined,
        feedback: typeof e.feedback === "string" ? e.feedback : a.feedback ?? undefined
      }
    })
  }, [detail, edits])

  const saveGrading = async () => {
    if (!selectedId) return
    try {
      setSaving(true)
      const res = await fetch(`/api/teacher/grades/${selectedId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perAnswers: perAnswerPayload })
      })
      if (res.ok) {
        await openDetail(selectedId)
        await loadList()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
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
            <CardDescription>Chấm điểm bài làm theo học viên và bài kiểm tra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <div className="flex gap-2">
                <Button variant={scope === "my-classes" ? "default" : "outline"} onClick={() => setScope("my-classes")}>Lớp tôi quản lý</Button>
                <Button variant={scope === "all" ? "default" : "outline"} onClick={() => setScope("all")}>Toàn hệ thống</Button>
              </div>
              <div className="flex gap-2 md:ml-auto w-full md:w-auto">
                <Input placeholder="Tìm tên, email, bài kt" value={query} onChange={(e) => setQuery(e.target.value)} />
                <Button onClick={loadList}>Tìm</Button>
              </div>
            </div>

            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="p-3 border rounded bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold dark:text-gray-700">{item.student.name} <span className="text-gray-500 text-sm">({item.student.gmail})</span></div>
                    <div className="text-sm dark:text-gray-700">Bài: {item.test.title}</div>
                    <div className="text-sm dark:text-gray-700">Điểm tổng: {item.score ?? 0} / {item.test.totalScore}</div>
                  </div>
                  <Button onClick={() => openDetail(item.id)}>Chấm bài</Button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-sm text-gray-500">Không có bài cần xét</div>
              )}
            </div>

            {detail && (
              <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50">
                <div className="bg-white w-full md:max-w-4xl max-h-[90vh] overflow-auto rounded-t-lg md:rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold dark:text-gray-700">{detail.student.name} - {detail.student.gmail}</div>
                      <div className="text-sm dark:text-gray-700">Bài kiểm tra: {detail.test.title}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { setSelectedId(null); setDetail(null); setEdits({}) }}>Đóng</Button>
                      <Button onClick={saveGrading} disabled={saving}>{saving ? "Đang lưu..." : "Lưu chấm điểm"}</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {detail.test.questions.map(q => {
                      const ans = detail.answers.find(a => a.questionId === q.id)
                      const e = ans ? edits[ans.id] : undefined
                      return (
                        <div key={q.id} className="border rounded p-3">
                          <div className="font-medium dark:text-gray-700">Câu {q.order}. {q.questionText}</div>
                          <div className="text-xs text-gray-500 mb-2">Loại: {viQuestionType(q.questionType)} • Điểm tối đa: {q.score}</div>
                          <div className="bg-gray-50 rounded p-2 text-sm whitespace-pre-line">
                            {ans ? (
                              <>
                                {q.questionType === "constructed_response" || q.questionType === "fill_blank" ? (
                                  <div><span className="text-gray-600">Trả lời:</span> {ans.answerText || "(trống)"}</div>
                                ) : null}
                                {q.questionType === "mcq" ? (
                                  <div>
                                    <div className="text-gray-600">Chọn:</div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {(ans.selectedOptions || []).map(id => {
                                        const opt = q.options?.find(o => o.id === id)
                                        return <span key={id} className="px-2 py-0.5 bg-white border rounded dark:text-gray-700 text-xs">{opt?.optionKey || id}</span>
                                      })}
                                    </div>
                                  </div>
                                ) : null}
                                {q.questionType === "mapping" ? (
                                  <div>
                                    <div className="text-gray-600">Ghép cặp:</div>
                                    <div className="mt-1 space-y-1">
                                      {(ans.mappingAnswers || []).map((pair, idx) => {
                                        const [leftId, rightId] = (pair || "").split(":")
                                        const left = q.mappingColumns?.find(c => c.id === leftId && c.columnType === "left")
                                        const right = q.mappingColumns?.find(c => c.id === rightId && c.columnType === "right")
                                        const leftText = left?.itemText || leftId
                                        const rightText = right?.itemText || rightId
                                        return (
                                          <div key={idx} className="px-2 py-0.5 bg-white border rounded text-xs dark:text-gray-700">
                                            {leftText} ↔ {rightText}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <div className="text-gray-400">Chưa có trả lời</div>
                            )}
                          </div>

                          {ans && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                              <div>
                                <label className="text-sm text-gray-700">Điểm</label>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  value={e?.score ?? (ans.score ?? 0)}
                                  onChange={(ev) => changeEdit(ans.id, { score: Number(ev.target.value) })}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm text-gray-700">Nhận xét</label>
                                <Input
                                  value={e?.feedback ?? (ans.feedback ?? "")}
                                  onChange={(ev) => changeEdit(ans.id, { feedback: ev.target.value })}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div className="flex items-center justify-between">
                      <div className="text-sm">Điểm tổng hiện tại: {detail.score ?? 0} / {detail.test.totalScore}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setSelectedId(null); setDetail(null); setEdits({}) }}>Hủy</Button>
                        <Button onClick={saveGrading} disabled={saving}>{saving ? "Đang lưu..." : "Lưu chấm điểm"}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

