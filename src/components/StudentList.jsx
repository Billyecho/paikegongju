import { useState } from 'react'
import { useStudentsContext } from '../hooks/useStudentsContext'
import StudentModal from './StudentModal'

export default function StudentList({ onClose, onStudentSaved }) {
  const { students, addStudent, updateStudent, deleteStudent } = useStudentsContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleAdd = () => {
    setEditingStudent(null)
    setModalOpen(true)
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setModalOpen(true)
  }

  const handleSave = async (data) => {
    setBusy(true)
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, data)
      } else {
        await addStudent(data)
      }
      setModalOpen(false)
      onStudentSaved?.()
    } catch (error) {
      alert(error.message || '保存学生失败')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个学生吗？相关的课程会保留。')) {
      setBusy(true)
      try {
        await deleteStudent(editingStudent.id)
        setModalOpen(false)
        onStudentSaved?.()
      } catch (error) {
        alert(error.message || '删除学生失败')
      } finally {
        setBusy(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">学生管理</h2>
              <p className="text-xs text-slate-500">{students.length} 名学生</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-600 hover:to-indigo-700"
            >
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">新增学生</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {students.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="mb-2 text-slate-500">暂无学生</p>
              <p className="text-sm text-slate-400">点击“新增学生”添加第一位学生</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:bg-slate-50"
                  onClick={() => handleEdit(student)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                      <span className="text-sm font-bold text-slate-600">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.grade}</div>
                    </div>
                  </div>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-sm font-medium text-blue-500">编辑</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalOpen && (
          <StudentModal
            student={editingStudent}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setModalOpen(false)}
            busy={busy}
          />
        )}
      </div>
    </div>
  )
}
