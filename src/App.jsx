import { useMemo, useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { StudentsProvider } from './context/StudentsContext'
import { CoursesProvider } from './context/CoursesContext'
import { useAuthContext } from './hooks/useAuthContext'
import { useStudentsContext } from './hooks/useStudentsContext'
import { useCoursesContext } from './hooks/useCoursesContext'
import Calendar from './components/Calendar'
import CourseModal from './components/CourseModal'
import StudentList from './components/StudentList'
import AuthGate from './components/AuthGate'
import SetupScreen from './components/SetupScreen'

function AppContent() {
  const [courseModal, setCourseModal] = useState(null)
  const [showStudentList, setShowStudentList] = useState(false)
  const [busy, setBusy] = useState(false)
  const [importing, setImporting] = useState(false)
  const [calendarView, setCalendarView] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'
  )
  const [calendarDate, setCalendarDate] = useState(new Date())
  const { user, signOut } = useAuthContext()
  const {
    courses,
    loading: coursesLoading,
    addCourse,
    updateCourse,
    deleteCourse,
    importCourses,
  } = useCoursesContext()
  const {
    students,
    loading: studentsLoading,
    refresh: refreshStudents,
    importStudents,
  } = useStudentsContext()

  const localBackup = useMemo(() => {
    try {
      const localStudents = JSON.parse(localStorage.getItem('pk_students') || '[]')
      const localCourses = JSON.parse(localStorage.getItem('pk_courses') || '[]')
      return {
        students: Array.isArray(localStudents) ? localStudents : [],
        courses: Array.isArray(localCourses) ? localCourses : [],
      }
    } catch {
      return { students: [], courses: [] }
    }
  }, [])

  const hasLocalBackup = localBackup.students.length > 0 || localBackup.courses.length > 0
  const isCloudEmpty = students.length === 0 && courses.length === 0
  const isLoading = coursesLoading || studentsLoading

  const handleCourseClick = (course) => {
    setCourseModal(course)
  }

  const handleAddCourse = () => {
    setCourseModal({})
  }

  const handleSaveCourse = async (data) => {
    setBusy(true)
    try {
      if (courseModal?.id) {
        await updateCourse(courseModal.id, data)
      } else {
        await addCourse(data)
      }
      setCourseModal(null)
    } catch (error) {
      alert(error.message || '保存课程失败')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (courseModal?.id && confirm('确定要删除这节课程吗？')) {
      setBusy(true)
      try {
        await deleteCourse(courseModal.id)
        setCourseModal(null)
      } catch (error) {
        alert(error.message || '删除课程失败')
      } finally {
        setBusy(false)
      }
    }
  }

  const handleStudentSaved = () => {
    refreshStudents().catch((error) => {
      alert(error.message || '刷新学生失败')
    })
  }

  const handleImportLocalData = async () => {
    if (!hasLocalBackup) return
    setImporting(true)

    try {
      const importedStudents = await importStudents(localBackup.students)
      const importedCourses = await importCourses(localBackup.courses)
      alert(`本地数据已导入云端：${importedStudents} 名学生，${importedCourses} 节课程。`)
    } catch (error) {
      alert(error.message || '导入本地数据失败')
    } finally {
      setImporting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      alert(error.message || '退出登录失败')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 sm:text-xl">排课工具</h1>
              <p className="truncate text-xs text-slate-500">
                {user?.email || user?.username || '轻松管理课程安排'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800"
            >
              退出登录
            </button>
            <button
              onClick={() => setShowStudentList(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              学生管理
            </button>
            <button
              onClick={handleAddCourse}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-600 hover:to-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增课程
            </button>
          </div>
        </div>
      </header>

      {hasLocalBackup && isCloudEmpty && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm text-amber-900 sm:max-w-3xl">
              检测到这台设备里还有旧的本地数据，可以一键导入到 CloudBase 云端，之后手机和电脑都会看到同一份内容。
            </p>
            <button
              onClick={handleImportLocalData}
              disabled={importing}
              className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300 sm:w-auto"
            >
              {importing ? '导入中...' : '导入本地数据'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
              正在同步云端数据...
            </div>
          </div>
        ) : (
          <Calendar
            onCourseClick={handleCourseClick}
            view={calendarView}
            currentDate={calendarDate}
            onViewChange={setCalendarView}
            onCurrentDateChange={setCalendarDate}
          />
        )}
      </main>

      {courseModal !== null && (
        <CourseModal
          course={courseModal}
          onSave={handleSaveCourse}
          onDelete={handleDeleteCourse}
          onClose={() => setCourseModal(null)}
          busy={busy}
        />
      )}

      {showStudentList && (
        <StudentList onClose={() => setShowStudentList(false)} onStudentSaved={handleStudentSaved} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

function AppShell() {
  const { isConfigured, session, loading } = useAuthContext()

  if (!isConfigured) {
    return <SetupScreen />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          正在检查登录状态...
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthGate />
  }

  return (
    <StudentsProvider>
      <CoursesProvider>
        <AppContent />
      </CoursesProvider>
    </StudentsProvider>
  )
}
