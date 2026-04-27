import { useContext } from 'react'
import { CoursesContext } from '../context/coursesContextValue'

export function useCoursesContext() {
  return useContext(CoursesContext)
}
