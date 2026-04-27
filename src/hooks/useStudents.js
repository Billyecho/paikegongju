import { useState, useCallback } from 'react'

function readStudents() {
  const stored = localStorage.getItem('pk_students')
  return stored ? JSON.parse(stored) : []
}

export function useStudents() {
  const [students, setStudents] = useState(readStudents)
  const loading = false

  const loadStudents = useCallback(() => {
    setStudents(readStudents())
  }, [])

  const sync = (newList) => {
    setStudents(newList)
    localStorage.setItem('pk_students', JSON.stringify(newList))
  }

  const addStudent = async (student) => {
    const newStudent = {
      id: Date.now().toString(),
      ...student,
      createdAt: new Date().toISOString()
    }
    sync([newStudent, ...students])
  }

  const updateStudent = async (id, updates) => {
    sync(students.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteStudent = async (id) => {
    sync(students.filter(s => s.id !== id))
  }

  return { students, loading, addStudent, updateStudent, deleteStudent, refresh: loadStudents }
}
