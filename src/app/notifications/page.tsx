'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Heart, MessageCircle, UserPlus, Repeat2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Notification {
    id: string
    created_at: string
    type: 'like' | 'comment' | 'follow' | 'mention' | 'repost'
    is_read: boolean
    actor: {
        username: string
        full_name: string
        avatar_url: string | null
    }
    post?: {
        id: string
        content: string
    }
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Subscribe to real-time notifications
            const channel = supabase
                .channel(`notifications-${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    fetchNotifications()
                })
                .subscribe()

            return channel
        }

        const subscriptionPromise = setupSubscription()

        fetchNotifications()

        return () => {
            subscriptionPromise.then(channel => {
                if (channel) supabase.removeChannel(channel)
            })
        }
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    actor:profiles!actor_id (username, full_name, avatar_url),
                    post:posts!post_id (id, content)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Full notifications error:', error)
                throw error
            }

            setNotifications(data as any || [])
        } catch (error: any) {
            console.error('Error fetching notifications:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)

        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="w-8 h-8 text-pink-500 fill-current" />
            case 'comment':
                return <MessageCircle className="w-8 h-8 text-blue-500" />
            case 'follow':
                return <UserPlus className="w-8 h-8 text-green-500" />
            case 'repost':
                return <Repeat2 className="w-8 h-8 text-purple-500" />
            default:
                return null
        }
    }

    const getNotificationText = (notification: Notification) => {
        const actorName = notification.actor?.full_name || notification.actor?.username || 'Someone'

        switch (notification.type) {
            case 'like':
                return `${actorName} liked your post`
            case 'comment':
                return `${actorName} commented on your post`
            case 'follow':
                return `${actorName} started following you`
            case 'repost':
                return `${actorName} reposted your post`
            default:
                return 'New notification'
        }
    }

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications

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
                    <div className="p-4">
                        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-t border-gray-100">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-4 text-center font-bold transition-all ${filter === 'all'
                                ? 'text-gray-900 border-b-4 border-blue-500'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-4 text-center font-bold transition-all ${filter === 'unread'
                                ? 'text-gray-900 border-b-4 border-blue-500'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Unread
                        </button>
                    </div>

                    {/* Mark all as read button */}
                    {notifications.some(n => !n.is_read) && (
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={markAllAsRead}
                                className="text-blue-500 text-sm font-semibold hover:underline"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </header>

                {/* Notifications List */}
                <div className="flex flex-col">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-20 text-center text-gray-500">
                            <p className="text-lg">No notifications yet</p>
                            <p className="text-sm mt-2">When someone interacts with your content, you'll see it here</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                                className={`border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/30' : ''
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <Link
                                                href={`/u/${notification.actor?.username}`}
                                                className="flex-shrink-0"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                                    {notification.actor?.avatar_url ? (
                                                        <img
                                                            src={notification.actor.avatar_url}
                                                            alt={notification.actor.username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-blue-500 font-bold text-sm">
                                                            {notification.actor?.username?.[0]?.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 text-sm">
                                                    {getNotificationText(notification)}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {formatDistanceToNow(new Date(notification.created_at))} ago
                                                </p>

                                                {notification.post && notification.type !== 'follow' && (
                                                    <Link href={`/`} className="mt-2 block">
                                                        <p className="text-gray-600 text-sm line-clamp-2 bg-gray-50 p-2 rounded-lg">
                                                            {notification.post.content}
                                                        </p>
                                                    </Link>
                                                )}
                                            </div>

                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
