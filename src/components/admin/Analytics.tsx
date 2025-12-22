'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Users, FileText, Heart, MessageCircle, Loader2, TrendingUp } from 'lucide-react'

export default function Analytics() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
    })
    const [topUsers, setTopUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        setLoading(true)

        // Fetch counts
        const [usersRes, postsRes, likesRes, commentsRes] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('posts').select('*', { count: 'exact', head: true }),
            supabase.from('likes').select('*', { count: 'exact', head: true }),
            supabase.from('comments').select('*', { count: 'exact', head: true }),
        ])

        setStats({
            totalUsers: usersRes.count || 0,
            totalPosts: postsRes.count || 0,
            totalLikes: likesRes.count || 0,
            totalComments: commentsRes.count || 0,
        })

        // Fetch top users by post count
        const { data: postsData } = await supabase
            .from('posts')
            .select('user_id, profiles(username, full_name, avatar_url)')

        if (postsData) {
            const userPostCounts = postsData.reduce((acc: any, post: any) => {
                const userId = post.user_id
                if (!acc[userId]) {
                    acc[userId] = {
                        ...post.profiles,
                        count: 0,
                    }
                }
                acc[userId].count++
                return acc
            }, {})

            const sortedUsers = Object.values(userPostCounts)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, 5)

            setTopUsers(sortedUsers as any[])
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
        { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'green' },
        { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'pink' },
        { label: 'Total Comments', value: stats.totalComments, icon: MessageCircle, color: 'purple' },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    )
                })}
            </div>

            {/* Top Users */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Most Active Users</h3>
                <div className="space-y-3">
                    {topUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user.username?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{user.full_name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{user.count}</div>
                                <div className="text-xs text-gray-500">posts</div>
                            </div>
                        </div>
                    ))}
                </div>

                {topUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No user activity yet.
                    </div>
                )}
            </div>
        </div>
    )
}
