'use client'

import Link from 'next/link'
import { Home, Search, Bell, User, LogOut, PlusSquare, Shield } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Sidebar() {
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, [])

    return (
        <aside className="fixed left-0 h-screen w-20 xl:w-64 border-r border-gray-100 bg-white p-4 hidden md:flex flex-col justify-between">
            <div className="space-y-6">
                <Link href="/" className="flex items-center gap-4 text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors">
                    <div className="w-8 h-8 font-black text-2xl flex items-center justify-center">S</div>
                    <span className="hidden xl:block font-bold text-xl">SocialApp</span>
                </Link>

                <nav className="space-y-2">
                    <SidebarLink href="/" icon={<Home />} label="Home" />
                    <SidebarLink href="/search" icon={<Search />} label="Search" />
                    <SidebarLink href="/notifications" icon={<Bell />} label="Notifications" />
                    {session && (
                        <>
                            <SidebarLink
                                href={`/u/${session.user.user_metadata.username}`}
                                icon={<User />}
                                label="Profile"
                            />
                            <SidebarLink
                                href="/admin"
                                icon={<Shield />}
                                label="Admin"
                            />
                        </>
                    )}
                </nav>

                <button className="xl:w-full bg-blue-500 text-white p-3 xl:px-6 xl:py-3 rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                    <PlusSquare className="w-6 h-6" />
                    <span className="hidden xl:block">Post</span>
                </button>
            </div>

            {session && (
                <button
                    onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
                    className="flex items-center gap-4 p-3 hover:bg-red-50 text-gray-700 hover:text-red-500 rounded-full transition-colors w-full"
                >
                    <LogOut className="w-6 h-6" />
                    <span className="hidden xl:block font-bold">Logout</span>
                </button>
            )}
        </aside>
    )
}

function SidebarLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link href={href} className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
            {icon}
            <span className="hidden xl:block font-bold text-lg">{label}</span>
        </Link>
    )
}
