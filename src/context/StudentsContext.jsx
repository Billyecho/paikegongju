import { useCallback, useEffect, useState } from 'react'
import { StudentsContext } from './studentsContextValue'
import { useAuthContext } from '../hooks/useAuthContext'
import { cloudbaseDb, getCloudbaseUserId } from '../lib/cloudbase'

function mapStudentRow(row) {
  return {
    id: row._id,
    name: row.name,
    grade: row.grade,
    phone: row.phone ?? '',
    createdAt: row.created_at,
  }
}

function unwrapSingleDocument(result) {
  if (Array.isArray(result?.data)) return result.data[0] ?? null
  return result?.data ?? null
}

function getInsertedDocumentId(result) {
  return result?.id || result?._id || result?.data?.id || result?.data?._id || ''
}

export function StudentsProvider({ children }) {
  const { user } = useAuthContext()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const loadStudents = useCallback(() => {
    const userId = getCloudbaseUserId(user)

    if (!cloudbaseDb || !userId) {
      setStudents([])
      setLoading(false)
      return Promise.resolve([])
    }

    setLoading(true)

    return cloudbaseDb
      .collection('students')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .get()
      .then((result) => {
        const nextStudents = (result.data || []).map(mapStudentRow)
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
    const userId = getCloudbaseUserId(user)
    if (!cloudbaseDb || !userId) throw new Error('当前未登录')

    const payload = {
      user_id: userId,
      name: student.name,
      grade: student.grade,
      phone: student.phone || '',
      created_at: new Date().toISOString(),
    }

    const createResult = await cloudbaseDb.collection('students').add(payload)
    const docId = getInsertedDocumentId(createResult)
    const detailResult = await cloudbaseDb.collection('students').doc(docId).get()
    const nextStudent = mapStudentRow(unwrapSingleDocument(detailResult))

    setStudents((current) => [nextStudent, ...current])
    return nextStudent
  }

  const updateStudent = async (id, updates) => {
    if (!cloudbaseDb || !getCloudbaseUserId(user)) throw new Error('当前未登录')

    const payload = {
      name: updates.name,
      grade: updates.grade,
      phone: updates.phone || '',
    }

    await cloudbaseDb.collection('students').doc(id).update(payload)
    const detailResult = await cloudbaseDb.collection('students').doc(id).get()
    const nextStudent = mapStudentRow(unwrapSingleDocument(detailResult))

    setStudents((current) => current.map((student) => (student.id === id ? nextStudent : student)))
    return nextStudent
  }

  const deleteStudent = async (id) => {
    if (!cloudbaseDb || !getCloudbaseUserId(user)) throw new Error('当前未登录')
    await cloudbaseDb.collection('students').doc(id).remove()
    setStudents((current) => current.filter((student) => student.id !== id))
  }

  const importStudents = async (localStudents) => {
    const userId = getCloudbaseUserId(user)
    if (!cloudbaseDb || !userId) throw new Error('当前未登录')
    if (!localStudents.length) return 0

    const payload = localStudents.map((student) => ({
      _id: student.id || crypto.randomUUID?.() || Date.now().toString(),
      user_id: userId,
      name: student.name,
      grade: student.grade,
      phone: student.phone || '',
      created_at: student.createdAt || new Date().toISOString(),
    }))

    await Promise.all(
      payload.map(({ _id, ...student }) => cloudbaseDb.collection('students').doc(_id).set(student))
    )

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
