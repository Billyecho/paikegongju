import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useStudentsContext } from '../hooks/useStudentsContext'

const TIME_OPTIONS = Array.from({ length: 27 }, (_, index) => {
  const totalMinutes = (8 * 60) + (index * 30)
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  return {
    value,
    label: value,
  }
})

function getTimeValue(date, fallback) {
  if (!date) return fallback

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function CourseModal({ course, onSave, onDelete, onClose, busy = false }) {
  const { students, refresh: refreshStudents } = useStudentsContext()
  const isEdit = !!course?.id

  const defaultDate = course?.startTime ? new Date(course.startTime) : new Date()
  const defaultStartTime = getTimeValue(course?.startTime ? new Date(course.startTime) : null, '09:00')
  const defaultEndTime = getTimeValue(course?.endTime ? new Date(course.endTime) : null, '11:00')

  const [formData, setFormData] = useState({
    studentId: course?.studentId || '',
    subject: course?.subject || '',
    date: format(defaultDate, 'yyyy-MM-dd'),
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    notes: course?.notes || '',
    status: course?.status || 'scheduled',
  })

  useEffect(() => {
    refreshStudents()
  }, [refreshStudents])

  const endTimeOptions = useMemo(
    () => TIME_OPTIONS.filter((option) => option.value > formData.startTime),
    [formData.startTime]
  )

  const selectedEndTime = endTimeOptions.some((option) => option.value === formData.endTime)
    ? formData.endTime
    : (endTimeOptions[0]?.value || formData.endTime)

  const handleSubmit = (event) => {
    event.preventDefault()

    const [startHour, startMinute] = formData.startTime.split(':').map(Number)
    const [endHour, endMinute] = selectedEndTime.split(':').map(Number)

    const startTime = new Date(formData.date)
    startTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date(formData.date)
    endTime.setHours(endHour, endMinute, 0, 0)

    onSave({
      studentId: formData.studentId,
      subject: formData.subject,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes: formData.notes,
      status: formData.status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-none bg-slate-900/60 backdrop-blur-sm sm:items-center">
      <div className="flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:mx-4 sm:max-w-md sm:rounded-2xl">
        <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{isEdit ? '编辑课程' : '新增课程'}</h2>
            <button
              onClick={onClose}
              disabled={busy}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 touch-pan-y sm:p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">学生</label>
              <select
                value={formData.studentId}
                onChange={(event) => setFormData({ ...formData, studentId: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">选择学生</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.grade})
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">请先在“学生管理”里添加学生</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">科目</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：化学、物理、数学"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">开始时间</label>
                <select
                  value={formData.startTime}
                  onChange={(event) => {
                    const nextStartTime = event.target.value
                    const nextEndTimeOptions = TIME_OPTIONS.filter((option) => option.value > nextStartTime)
                    const nextEndTime = nextEndTimeOptions.some((option) => option.value === formData.endTime)
                      ? formData.endTime
                      : (nextEndTimeOptions[0]?.value || formData.endTime)

                    setFormData({
                      ...formData,
                      startTime: nextStartTime,
                      endTime: nextEndTime,
                    })
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_OPTIONS.slice(0, -1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">结束时间</label>
                <select
                  value={selectedEndTime}
                  onChange={(event) => setFormData({ ...formData, endTime: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {endTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">课程状态</label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                {[
                  { value: 'scheduled', label: '待上课' },
                  { value: 'completed', label: '已完成' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: option.value })}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      formData.status === option.value
                        ? option.value === 'completed'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">备注</label>
              <textarea
                value={formData.notes}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="可选，如：上课内容、特殊要求等"
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {isEdit && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={busy}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:mr-auto"
                >
                  删除课程
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-600 hover:to-indigo-700"
              >
                {busy ? '保存中...' : isEdit ? '保存修改' : '添加课程'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
