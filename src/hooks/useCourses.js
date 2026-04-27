import { useState } from 'react'

const STORAGE_KEY = 'pk_courses'

function readCourses() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function useCourses() {
  const [courses, setCourses] = useState(readCourses)

  const sync = (newList) => {
    setCourses(newList)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
  }

  const addCourse = async (course) => {
    const newCourse = {
      id: Date.now().toString(),
      ...course,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const newList = [...courses, newCourse]
    sync(newList)
  }

  const updateCourse = async (id, updates) => {
    const newList = courses.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    )
    sync(newList)
  }

  const deleteCourse = async (id) => {
    const newList = courses.filter(c => c.id !== id)
    sync(newList)
  }

  return { courses, loading: false, addCourse, updateCourse, deleteCourse }
}
