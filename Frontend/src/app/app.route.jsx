import { createBrowserRouter, useNavigate } from 'react-router'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import Dashboard from '../features/chat/pages/Dashboard'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

/** ProtectedRoute - Fixed async handling */
function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    const { user, loading } = useSelector(state => state.auth)
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4">
                <div className="w-12 h-12 border-4 border-[#31b8c6] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-400 font-medium tracking-wider animate-pulse transition-all">Authenticating...</p>
            </div>
        )
    }

    if (!user) {
        return null // Redirect by useEffect
    }

    return children
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Dashboard/>
            </ProtectedRoute>
        )
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        )
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    }
])

