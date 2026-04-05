import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { ProtectedRoute, PageLoader, PageTransition } from './route-utils'

// Lazy loaded pages
const LandingPage = React.lazy(() => import('../features/landing/pages/LandingPage'))
const Dashboard = React.lazy(() => import('../features/chat/pages/Dashboard'))
const ProfilePage = React.lazy(() => import('../features/profile/pages/ProfilePage'))
const Login = React.lazy(() => import('../features/auth/pages/Login'))
const Register = React.lazy(() => import('../features/auth/pages/Register'))

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PageTransition>
              <LandingPage />
            </PageTransition>
          </Suspense>
        )
    },
    {
        path: '/chat',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
            </ProtectedRoute>
          </Suspense>
        )
    },
    {
        path: '/dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
            </ProtectedRoute>
          </Suspense>
        )
    },
    {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
            </ProtectedRoute>
          </Suspense>
        )
    },
    {
        path: '/login',
        element: (
            <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Login />
                </PageTransition>
            </Suspense>
        )
    },
    {
        path: '/register',
        element: (
            <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Register />
                </PageTransition>
            </Suspense>
        )
    }
])

