'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Users, FileText, BarChart3, Database, Shield } from 'lucide-react'
import UserManagement from '@/components/admin/UserManagement'
import ContentModeration from '@/components/admin/ContentModeration'
import Analytics from '@/components/admin/Analytics'
import DatabaseTools from '@/components/admin/DatabaseTools'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState('users')
    const router = useRouter()

    useEffect(() => {
        checkAdminAccess()
    }, [])

    const checkAdminAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            if (!profile?.is_admin) {
                alert('Access denied. Admin privileges required.')
                router.push('/')
                return
            }

            setIsAdmin(true)
        } catch (error) {
            console.error('Admin check error:', error)
            router.push('/')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (!isAdmin) return null

    const tabs = [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'database', label: 'Database', icon: Database },
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background p-6 lg:p-12 relative overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-surface border border-primary/20 rounded-2xl shadow-lg shadow-primary/5">
                                <Shield className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-foreground">
                                    Control <span className="text-primary">Center</span>
                                </h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                                    OPERATIONAL STATUS: <span className="text-cyan-600">OPTIMIZED</span> // AUTH_LEVEL: MASTER_ROOT
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-surface p-1.5 rounded-2xl border border-border-color shadow-sm">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative flex items-center gap-3 px-8 py-3.5 rounded-xl font-black transition-all duration-300 uppercase tracking-widest text-[10px]
                                        ${isActive ? 'text-primary' : 'text-slate-400 hover:text-foreground'}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="admin-tab-glow"
                                            className="absolute inset-0 bg-primary/5 border border-primary/10 rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative flex items-center gap-3">
                                        <Icon className="w-4 h-4" />
                                        {tab.id}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content Terminal Area */}
                <div className="grid grid-cols-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-surface border border-border-color rounded-[2.5rem] p-12 shadow-xl shadow-primary/5 relative overflow-hidden"
                    >
                        {/* Technical accents */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Database className="w-64 h-64 text-slate-200" />
                        </div>

                        <div className="relative z-10">
                            {activeTab === 'users' && <UserManagement />}
                            {activeTab === 'content' && <ContentModeration />}
                            {activeTab === 'analytics' && <Analytics />}
                            {activeTab === 'database' && <DatabaseTools />}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
