'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'
import { TrendingUp, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ExplorePage() {
    const [trendingPosts, setTrendingPosts] = useState<any[]>([])
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')

    useEffect(() => {
        fetchExploreData()
    }, [])

    const fetchExploreData = async () => {
        setLoading(true)

        // Fetch trending posts (posts with most likes in last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: postsData } = await supabase
            .from('posts')
            .select(`
        *,
        profiles (*),
        likes (count)
      `)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(20)

        if (postsData) {
            // Sort by like count
            const sorted = postsData.sort((a: any, b: any) => {
                const aLikes = a.likes?.length || 0
                const bLikes = b.likes?.length || 0
                return bLikes - aLikes
            })
            setTrendingPosts(sorted)
        }

        // Fetch suggested users (users with most followers)
        const { data: { user } } = await supabase.auth.getUser()

        let query = supabase
            .from('profiles')
            .select('*')
            .limit(10)

        // Exclude current user if logged in
        if (user) {
            query = query.neq('id', user.id)
        }

        const { data: usersData } = await query

        if (usersData) {
            // Fetch follower counts for each user
            const usersWithCounts = await Promise.all(
                usersData.map(async (profile) => {
                    const { count } = await supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profile.id)

                    return { ...profile, followerCount: count || 0 }
                })
            )

            // Sort by follower count
            usersWithCounts.sort((a, b) => b.followerCount - a.followerCount)
            setSuggestedUsers(usersWithCounts)
        }

        setLoading(false)
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
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="p-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Explore</h1>
                        <Link href="/search" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-t border-gray-100">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 py-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'posts'
                                    ? 'text-gray-900 border-b-4 border-blue-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Trending
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'users'
                                    ? 'text-gray-900 border-b-4 border-blue-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Suggested
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-col">
                    {activeTab === 'posts' ? (
                        trendingPosts.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">
                                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold">No trending posts yet</p>
                                <p className="text-sm mt-2">Check back later for popular content</p>
                            </div>
                        ) : (
                            trendingPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )
                    ) : (
                        suggestedUsers.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">
                                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold">No suggestions yet</p>
                                <p className="text-sm mt-2">Check back later for user recommendations</p>
                            </div>
                        ) : (
                            <div className="p-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Who to follow</h2>
                                <div className="space-y-4">
                                    {suggestedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <Link href={`/u/${user.username}`} className="flex items-center gap-3 flex-1">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-blue-500 font-bold">{user.username[0].toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{user.full_name || user.username}</p>
                                                    <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                                                    <p className="text-gray-600 text-xs mt-1">
                                                        {user.followerCount} {user.followerCount === 1 ? 'follower' : 'followers'}
                                                    </p>
                                                </div>
                                            </Link>
                                            <FollowButton profileId={user.id} variant="small" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
