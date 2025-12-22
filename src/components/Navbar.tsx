'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Bell, Bookmark, User, TrendingUp, LogOut, PlusCircle, Shield, Clapperboard, Mail } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

export default function Navbar() {
    const pathname = usePathname()
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/messages', icon: Mail, label: 'Messages' },
        { href: '/reels', icon: Clapperboard, label: 'Reels' },
        { href: '/explore', icon: TrendingUp, label: 'Explore' },
        { href: '/search', icon: Search, label: 'Search' },
        { href: '/notifications', icon: Bell, label: 'Notifications' },
        { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
        {
            href: session ? `/u/${session.user?.user_metadata?.username}` : '/login',
            icon: User,
            label: 'Profile'
        },
        ...(session?.user?.user_metadata?.is_admin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : [])
    ]

    if (!session) return null

    return (
        <nav className="hidden md:flex flex-col h-screen w-64 border-r border-border-color bg-background sticky top-0 p-6">
            {/* Logo */}
            <div className="mb-12 px-2">
                <Link href="/" className="inline-block group">
                    <h1 className="text-3xl font-black tracking-tighter text-gradient group-hover:scale-105 transition-transform duration-300">
                        CRACOE
                    </h1>
                    <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" />
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 space-y-2.5 flex flex-col">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative group flex items-center gap-4 px-4 py-3 rounded-xl transition-snap border border-transparent ${isActive
                                ? 'text-primary bg-primary/5 border-primary/20 neon-glow'
                                : 'text-slate-500 hover:text-foreground hover:bg-surface-hover hover:border-border-color'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                            <span className={`text-[15px] font-bold tracking-tight ${isActive ? 'text-primary' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-primary/5 rounded-xl -z-10 blur-sm"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                        </Link>
                    )
                })}

                {/* Cyber Button */}
                <div className="mt-8">
                    <button
                        className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 shadow-xl shadow-primary/10 active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Transmission</span>
                    </button>
                </div>
            </div>

            {/* User Terminal */}
            {session && (
                <div className="mt-auto pt-6 border-t border-border-color">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border-color hover:border-primary/30 transition-all group cursor-pointer shadow-sm">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden border border-border-color group-hover:border-primary/50 transition-colors">
                                {session.user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={session.user.user_metadata.avatar_url}
                                        alt={session.user.user_metadata.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-primary font-bold">
                                        {session.user?.user_metadata?.username?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-foreground truncate uppercase tracking-wider">
                                    {session.user?.user_metadata?.full_name || session.user?.user_metadata?.username}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 truncate group-hover:text-primary transition-colors">
                                    @{session.user?.user_metadata?.username}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
