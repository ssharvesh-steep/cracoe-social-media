'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import PostCard from '@/components/PostCard'
import { Loader2, Bookmark } from 'lucide-react'
import Link from 'next/link'

export default function BookmarksPage() {
    const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookmarks()
    }, [])

    const fetchBookmarks = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('bookmarks')
                .select(`
                    *,
                    post:posts!post_id (
                        *,
                        profiles (*)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Full bookmarks error:', error)
                throw error
            }

            // Extract posts from bookmarks
            const posts = data?.map(bookmark => bookmark.post).filter(Boolean) || []
            setBookmarkedPosts(posts)
        } catch (error: any) {
            console.error('Error fetching bookmarks:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl bg-white min-h-screen border-x border-gray-100 shadow-sm">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
                            <p className="text-xs text-gray-500">@{bookmarkedPosts[0]?.profiles?.username || 'user'}</p>
                        </div>
                    </div>
                </header>

                {/* Bookmarked Posts */}
                <div className="flex flex-col">
                    {bookmarkedPosts.length === 0 ? (
                        <div className="p-20 text-center text-gray-500">
                            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold">Save posts for later</p>
                            <p className="text-sm mt-2">
                                Bookmark posts to easily find them again in the future.
                            </p>
                        </div>
                    ) : (
                        bookmarkedPosts.map((post) => (
                            <PostCard key={post.id} post={post} onBookmarkRemoved={fetchBookmarks} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
