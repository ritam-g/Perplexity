import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { MotionConfig } from 'framer-motion'
import { router } from './app.route'
import { useAuth } from '../features/auth/hook/useAuth'


function App() {
  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}

export default App
