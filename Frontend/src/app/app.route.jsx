import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { ProtectedRoute, PageLoader } from './route-utils'

// Lazy loaded pages
const LandingPage = React.lazy(() => import('../features/landing/pages/LandingPage'))
const Dashboard = React.lazy(() => import('../features/chat/pages/Dashboard'))
const Login = React.lazy(() => import('../features/auth/pages/Login'))
const Register = React.lazy(() => import('../features/auth/pages/Register'))

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LandingPage />
          </Suspense>
        )
    },
    {
        path: '/chat',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
                <Dashboard/>
            </ProtectedRoute>
          </Suspense>
        )
    },
    {
        path: '/dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
          </Suspense>
        )
    },
    {
        path: '/login',
        element: (
            <Suspense fallback={<PageLoader />}>
                <Login />
            </Suspense>
        )
    },
    {
        path: '/register',
        element: (
            <Suspense fallback={<PageLoader />}>
                <Register />
            </Suspense>
        )
    }
])

