import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const loaderDots = [
    { id: 'loader-dot-1', delay: '0ms' },
    { id: 'loader-dot-2', delay: '140ms' },
    { id: 'loader-dot-3', delay: '280ms' },
]
const MotionDiv = motion.div

export const PageLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-on-background">
        <MotionDiv
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_32px_90px_rgba(4,10,24,0.36)]"
        >
            <div className="animate-loader-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_12%,rgba(255,255,255,0.14)_42%,transparent_72%)] opacity-70" />

            <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(34,211,238,0.96),rgba(67,97,238,0.92))] shadow-[0_18px_45px_rgba(34,211,238,0.22)]">
                    <span className="material-symbols-outlined text-xl text-slate-950">auto_awesome</span>
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-black tracking-tight text-primary">Preparing Doraemon</p>
                    <p className="mt-1 text-sm text-slate-400">Syncing workspace and loading your session.</p>
                </div>
            </div>

            <div className="relative mt-6 flex items-center gap-2">
                {loaderDots.map((dot) => (
                    <span
                        key={dot.id}
                        className="h-2.5 w-2.5 rounded-full bg-primary/90 animate-bounce shadow-[0_0_18px_rgba(138,235,255,0.35)]"
                        style={{
                            animationDelay: dot.delay,
                            animationDuration: '0.9s',
                        }}
                    />
                ))}
            </div>
        </MotionDiv>
    </div>
)

export function PageTransition({ children }) {
    return (
        <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[100dvh] will-change-transform-opacity"
        >
            {children}
        </MotionDiv>
    )
}

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
