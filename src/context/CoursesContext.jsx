import { useCallback, useEffect, useState } from 'react'
import { CoursesContext } from './coursesContextValue'
import { useAuthContext } from '../hooks/useAuthContext'
import { cloudbaseDb, getCloudbaseUserId } from '../lib/cloudbase'

function mapCourseRow(row) {
  return {
    id: row._id,
    studentId: row.student_id,
    subject: row.subject,
    startTime: row.start_time,
    endTime: row.end_time,
    notes: row.notes ?? '',
    status: row.status ?? 'scheduled',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function unwrapSingleDocument(result) {
  if (Array.isArray(result?.data)) return result.data[0] ?? null
  return result?.data ?? null
}

function getInsertedDocumentId(result) {
  return result?.id || result?._id || result?.data?.id || result?.data?._id || ''
}

export function CoursesProvider({ children }) {
  const { user } = useAuthContext()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCourses = useCallback(() => {
    const userId = getCloudbaseUserId(user)

    if (!cloudbaseDb || !userId) {
      setCourses([])
      setLoading(false)
      return Promise.resolve([])
    }

    setLoading(true)

    return cloudbaseDb
      .collection('courses')
      .where({ user_id: userId })
      .orderBy('start_time', 'asc')
      .get()
      .then((result) => {
        const nextCourses = (result.data || []).map(mapCourseRow)
        setCourses(nextCourses)
        return nextCourses
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  useEffect(() => {
    queueMicrotask(() => {
      loadCourses().catch((error) => {
        console.error('Failed to load courses', error)
      })
    })
  }, [loadCourses])

  const addCourse = async (course) => {
    const userId = getCloudbaseUserId(user)
    if (!cloudbaseDb || !userId) throw new Error('当前未登录')

    const now = new Date().toISOString()
    const payload = {
      user_id: userId,
      student_id: course.studentId,
      subject: course.subject,
      start_time: course.startTime,
      end_time: course.endTime,
      notes: course.notes || '',
      status: course.status || 'scheduled',
      created_at: now,
      updated_at: now,
    }

    const createResult = await cloudbaseDb.collection('courses').add(payload)
    const docId = getInsertedDocumentId(createResult)
    const detailResult = await cloudbaseDb.collection('courses').doc(docId).get()
    const nextCourse = mapCourseRow(unwrapSingleDocument(detailResult))

    setCourses((current) =>
      [...current, nextCourse].sort((left, right) => new Date(left.startTime) - new Date(right.startTime))
    )
    return nextCourse
  }

  const updateCourse = async (id, updates) => {
    if (!cloudbaseDb || !getCloudbaseUserId(user)) throw new Error('当前未登录')

    const payload = {
      updated_at: new Date().toISOString(),
    }

    if (updates.studentId !== undefined) payload.student_id = updates.studentId
    if (updates.subject !== undefined) payload.subject = updates.subject
    if (updates.startTime !== undefined) payload.start_time = updates.startTime
    if (updates.endTime !== undefined) payload.end_time = updates.endTime
    if (updates.notes !== undefined) payload.notes = updates.notes || ''
    if (updates.status !== undefined) payload.status = updates.status

    await cloudbaseDb.collection('courses').doc(id).update(payload)
    const detailResult = await cloudbaseDb.collection('courses').doc(id).get()
    const nextCourse = mapCourseRow(unwrapSingleDocument(detailResult))

    setCourses((current) =>
      current
        .map((course) => (course.id === id ? nextCourse : course))
        .sort((left, right) => new Date(left.startTime) - new Date(right.startTime))
    )
    return nextCourse
  }

  const deleteCourse = async (id) => {
    if (!cloudbaseDb || !getCloudbaseUserId(user)) throw new Error('当前未登录')
    await cloudbaseDb.collection('courses').doc(id).remove()
    setCourses((current) => current.filter((course) => course.id !== id))
  }

  const importCourses = async (localCourses) => {
    const userId = getCloudbaseUserId(user)
    if (!cloudbaseDb || !userId) throw new Error('当前未登录')
    if (!localCourses.length) return 0

    const payload = localCourses.map((course) => ({
      _id: course.id || crypto.randomUUID?.() || Date.now().toString(),
      user_id: userId,
      student_id: course.studentId,
      subject: course.subject,
      start_time: course.startTime,
      end_time: course.endTime,
      notes: course.notes || '',
      status: course.status || 'scheduled',
      created_at: course.createdAt || new Date().toISOString(),
      updated_at: course.updatedAt || course.createdAt || new Date().toISOString(),
    }))

    await Promise.all(
      payload.map(({ _id, ...course }) => cloudbaseDb.collection('courses').doc(_id).set(course))
    )

    await loadCourses()
    return payload.length
  }

  return (
    <CoursesContext.Provider
      value={{ courses, loading, addCourse, updateCourse, deleteCourse, importCourses, refresh: loadCourses }}
    >
      {children}
    </CoursesContext.Provider>
  )
}
