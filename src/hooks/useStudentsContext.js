import { useContext } from 'react'
import { StudentsContext } from '../context/studentsContextValue'

export function useStudentsContext() {
  return useContext(StudentsContext)
}
