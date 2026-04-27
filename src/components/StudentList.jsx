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
    if (confirm('确定要删除这个学生吗？相关的课程也会保留。')) {
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">学生管理</h2>
              <p className="text-xs text-slate-500">{students.length} 名学生</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-600 hover:to-indigo-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">新增学生</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {students.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-slate-500 mb-2">暂无学生</p>
              <p className="text-sm text-slate-400">点击"新增学生"添加第一位学生</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map(student => (
                <div
                  key={student.id}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:bg-slate-50"
                  onClick={() => handleEdit(student)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-600">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.grade}</div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm text-blue-500 font-medium">编辑</span>
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
