import { useCallback, useEffect, useState } from 'react'
import { StudentsContext } from './studentsContextValue'
import { useAuthContext } from '../hooks/useAuthContext'
import { supabase } from '../lib/supabase'

function mapStudentRow(row) {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    phone: row.phone ?? '',
    createdAt: row.created_at,
  }
}

export function StudentsProvider({ children }) {
  const { user } = useAuthContext()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const loadStudents = useCallback(() => {
    if (!supabase || !user) {
      setStudents([])
      setLoading(false)
      return Promise.resolve([])
    }

    setLoading(true)

    return supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        const nextStudents = data.map(mapStudentRow)
        setStudents(nextStudents)
        return nextStudents
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  useEffect(() => {
    queueMicrotask(() => {
      loadStudents().catch((error) => {
        console.error('Failed to load students', error)
      })
    })
  }, [loadStudents])

  const addStudent = async (student) => {
    if (!supabase || !user) throw new Error('当前未登录')
    const payload = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      user_id: user.id,
      name: student.name,
      grade: student.grade,
      phone: student.phone || '',
    }
    const { data, error } = await supabase.from('students').insert(payload).select('*').single()
    if (error) throw error
    setStudents((current) => [mapStudentRow(data), ...current])
    return data
  }

  const updateStudent = async (id, updates) => {
    if (!supabase || !user) throw new Error('当前未登录')
    const payload = {
      name: updates.name,
      grade: updates.grade,
      phone: updates.phone || '',
    }
    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    const nextStudent = mapStudentRow(data)
    setStudents((current) => current.map((student) => (student.id === id ? nextStudent : student)))
    return data
  }

  const deleteStudent = async (id) => {
    if (!supabase || !user) throw new Error('当前未登录')
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw error
    setStudents((current) => current.filter((student) => student.id !== id))
  }

  const importStudents = async (localStudents) => {
    if (!supabase || !user) throw new Error('当前未登录')
    if (!localStudents.length) return 0

    const payload = localStudents.map((student) => ({
      id: student.id || crypto.randomUUID?.() || Date.now().toString(),
      user_id: user.id,
      name: student.name,
      grade: student.grade,
      phone: student.phone || '',
      created_at: student.createdAt || new Date().toISOString(),
    }))

    const { error } = await supabase.from('students').upsert(payload)
    if (error) throw error
    await loadStudents()
    return payload.length
  }

  return (
    <StudentsContext.Provider
      value={{ students, loading, addStudent, updateStudent, deleteStudent, importStudents, refresh: loadStudents }}
    >
      {children}
    </StudentsContext.Provider>
  )
}
