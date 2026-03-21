import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

export const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4">
        <div className="w-12 h-12 border-4 border-[#31b8c6] border-t-transparent rounded-full animate-spin"></div>
    </div>
)

export function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    const { user, loading } = useSelector(state => state.auth)
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    if (loading) {
        return <PageLoader />
    }

    if (!user) {
        return null // Redirect by useEffect
    }

    return children
}
