import { useContext } from 'react'
import { AuthContext } from '../context/authContextValue'

export function useAuthContext() {
  return useContext(AuthContext)
}
