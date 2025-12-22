'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, Bell, User, TrendingUp, Clapperboard } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

export default function BottomNav() {
    const pathname = usePathname()
    const [session, setSession] = useState<any>(null)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) {
                fetchUnreadCount(session.user.id)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) {
                fetchUnreadCount(session.user.id)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUnreadCount = async (userId: string) => {
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        setUnreadCount(count || 0)
    }

    if (!session) return null

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/reels', icon: Clapperboard, label: 'Reels' },
        { href: '/explore', icon: TrendingUp, label: 'Explore' },
        { href: '/search', icon: Search, label: 'Search' },
        { href: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
        { href: `/u/${session?.user?.user_metadata?.username}`, icon: User, label: 'Profile' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-2xl border-t border-border-color flex items-center justify-around md:hidden z-50 px-6 pb-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="relative flex items-center justify-center p-3 transition-all group"
                    >
                        <div className={`
                            relative transition-all duration-300 p-2 rounded-xl
                            ${isActive ? 'bg-primary/5 text-primary border border-primary/20 shadow-sm' : 'text-slate-500 hover:text-foreground hover:bg-surface'}
                        `}>
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-glow"
                                    className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                            <Icon className={`w-5.5 h-5.5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                            {item.badge && item.badge > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black rounded-md min-w-[14px] h-[14px] flex items-center justify-center border border-background shadow-lg">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </div>
                        {isActive && (
                            <motion.div
                                layoutId="bottom-active-line"
                                className="absolute -top-[1.5px] inset-x-4 h-[1px] bg-primary"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
