'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Search, Loader2, User as UserIcon, FileText } from 'lucide-react'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users')
    const [users, setUsers] = useState<any[]>([])
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Debounce search
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        if (query.trim().length > 0) {
            const timeout = setTimeout(() => {
                performSearch()
            }, 300)
            setSearchTimeout(timeout)
        } else {
            setUsers([])
            setPosts([])
        }

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout)
        }
    }, [query, activeTab])

    const performSearch = async () => {
        setLoading(true)

        if (activeTab === 'users') {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                .limit(20)

            if (!error) {
                setUsers(data || [])
            }
        } else {
            const { data, error } = await supabase
                .from('posts')
                .select('*, profiles(*)')
                .ilike('content', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(20)

            if (!error) {
                setPosts(data || [])
            }
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl bg-white min-h-screen border-x border-gray-100 shadow-sm">
                {/* Header with Search */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search users and posts..."
                                    className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-t border-gray-100">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'users'
                                    ? 'text-gray-900 border-b-4 border-blue-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <UserIcon className="w-4 h-4" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 py-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'posts'
                                    ? 'text-gray-900 border-b-4 border-blue-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Posts
                        </button>
                    </div>
                </header>

                {/* Results */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : query.trim().length === 0 ? (
                        <div className="p-20 text-center text-gray-500">
                            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold">Search for people and posts</p>
                            <p className="text-sm mt-2">
                                Start typing to find users or posts
                            </p>
                        </div>
                    ) : activeTab === 'users' ? (
                        users.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">
                                <p className="text-lg">No users found</p>
                                <p className="text-sm mt-2">Try searching for something else</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link href={`/u/${user.username}`} className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-blue-500 font-bold">{user.username[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{user.full_name || user.username}</p>
                                                <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                                                {user.bio && (
                                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{user.bio}</p>
                                                )}
                                            </div>
                                        </Link>
                                        <FollowButton profileId={user.id} variant="small" />
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        posts.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">
                                <p className="text-lg">No posts found</p>
                                <p className="text-sm mt-2">Try searching for something else</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
