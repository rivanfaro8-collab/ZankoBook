import { getSavedSession } from '@/lib/authStorage'
import { useUserStore } from '@/store/userStore'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

export default function Index() {
  const [destination, setDestination] = useState<'login' | 'student' | 'lecturer' | null>(null)
  const setUser = useUserStore((state) => state.setUser)
  const setToken = useUserStore((state) => state.setToken)

  useEffect(() => {
    getSavedSession().then((session) => {
      if (!session) {
        setDestination('login')
        return
      }
      setToken(session.token)
      setUser(session.user)
      const role = session.user.roles?.[0]?.name
      setDestination(role === 'lecturer' ? 'lecturer' : role === 'student' ? 'student' : 'login')
    }).catch(() => setDestination('login'))
  }, [setToken, setUser])

  if (!destination) return null
  if (destination === 'lecturer') return <Redirect href='/(lecturer)/Dashboard' />
  if (destination === 'student') return <Redirect href='/(student)/Dashboard' />
  return <Redirect href='/(auth)/login' />
}
