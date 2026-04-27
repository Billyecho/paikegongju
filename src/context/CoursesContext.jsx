import { useCallback, useEffect, useState } from 'react'
import { CoursesContext } from './coursesContextValue'
import { useAuthContext } from '../hooks/useAuthContext'
import { supabase } from '../lib/supabase'

function mapCourseRow(row) {
  return {
    id: row.id,
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

export function CoursesProvider({ children }) {
  const { user } = useAuthContext()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCourses = useCallback(() => {
    if (!supabase || !user) {
      setCourses([])
      setLoading(false)
      return Promise.resolve([])
    }

    setLoading(true)

    return supabase
      .from('courses')
      .select('*')
      .order('start_time', { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error
        const nextCourses = data.map(mapCourseRow)
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
    if (!supabase || !user) throw new Error('当前未登录')
    const now = new Date().toISOString()
    const payload = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      user_id: user.id,
      student_id: course.studentId,
      subject: course.subject,
      start_time: course.startTime,
      end_time: course.endTime,
      notes: course.notes || '',
      status: course.status || 'scheduled',
      created_at: now,
      updated_at: now,
    }
    const { data, error } = await supabase.from('courses').insert(payload).select('*').single()
    if (error) throw error
    setCourses((current) =>
      [...current, mapCourseRow(data)].sort((left, right) => new Date(left.startTime) - new Date(right.startTime))
    )
    return data
  }

  const updateCourse = async (id, updates) => {
    if (!supabase || !user) throw new Error('当前未登录')
    const payload = {
      updated_at: new Date().toISOString(),
    }
    if (updates.studentId !== undefined) payload.student_id = updates.studentId
    if (updates.subject !== undefined) payload.subject = updates.subject
    if (updates.startTime !== undefined) payload.start_time = updates.startTime
    if (updates.endTime !== undefined) payload.end_time = updates.endTime
    if (updates.notes !== undefined) payload.notes = updates.notes || ''
    if (updates.status !== undefined) payload.status = updates.status

    const { data, error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error

    const nextCourse = mapCourseRow(data)
    setCourses((current) =>
      current
        .map((course) => (course.id === id ? nextCourse : course))
        .sort((left, right) => new Date(left.startTime) - new Date(right.startTime))
    )
    return data
  }

  const deleteCourse = async (id) => {
    if (!supabase || !user) throw new Error('当前未登录')
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) throw error
    setCourses((current) => current.filter((course) => course.id !== id))
  }

  const importCourses = async (localCourses) => {
    if (!supabase || !user) throw new Error('当前未登录')
    if (!localCourses.length) return 0

    const payload = localCourses.map((course) => ({
      id: course.id || crypto.randomUUID?.() || Date.now().toString(),
      user_id: user.id,
      student_id: course.studentId,
      subject: course.subject,
      start_time: course.startTime,
      end_time: course.endTime,
      notes: course.notes || '',
      status: course.status || 'scheduled',
      created_at: course.createdAt || new Date().toISOString(),
      updated_at: course.updatedAt || course.createdAt || new Date().toISOString(),
    }))

    const { error } = await supabase.from('courses').upsert(payload)
    if (error) throw error
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
