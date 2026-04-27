import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useStudentsContext } from '../hooks/useStudentsContext'

export default function CourseModal({ course, onSave, onDelete, onClose, busy = false }) {
  const { students, refresh: refreshStudents } = useStudentsContext()
  const isEdit = !!course?.id

  const defaultDate = course?.startTime ? new Date(course.startTime) : new Date()
  const defaultStartHour = course ? defaultDate.getHours() : 9
  const defaultEndHour = course ? (new Date(course.endTime)).getHours() : 11

  const [formData, setFormData] = useState({
    studentId: course?.studentId || '',
    subject: course?.subject || '',
    date: format(defaultDate, 'yyyy-MM-dd'),
    startHour: defaultStartHour,
    endHour: defaultEndHour,
    notes: course?.notes || ''
  })

  // Refresh students when modal opens to get latest
  useEffect(() => {
    refreshStudents()
  }, [refreshStudents])

  const handleSubmit = (e) => {
    e.preventDefault()

    const startTime = new Date(formData.date)
    startTime.setHours(formData.startHour, 0, 0, 0)

    const endTime = new Date(formData.date)
    endTime.setHours(formData.endHour, 0, 0, 0)

    onSave({
      studentId: formData.studentId,
      subject: formData.subject,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes: formData.notes
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? '编辑课程' : '新增课程'}
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              学生
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
              required
            >
              <option value="">选择学生</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">请先在"学生管理"中添加学生</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              科目
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
              placeholder="如：化学、物理、数学"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              日期
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
              required
            />
          </div>

          {/* Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                开始时间
              </label>
              <select
                value={formData.startHour}
                onChange={(e) => setFormData({
                  ...formData,
                  startHour: parseInt(e.target.value),
                  endHour: Math.max(formData.endHour, parseInt(e.target.value) + 1)
                })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
              >
                {Array.from({ length: 14 }, (_, i) => i + 8).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                结束时间
              </label>
              <select
                value={formData.endHour}
                onChange={(e) => setFormData({ ...formData, endHour: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
              >
                {Array.from({ length: 13 }, (_, i) => i + 9).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 resize-none"
              rows="2"
              placeholder="可选，如：上课内容、特殊要求等"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEdit && (
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除课程
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
            >
              {busy ? '保存中...' : isEdit ? '保存修改' : '添加课程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
