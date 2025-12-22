'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/utils/supabase/client'
import CommentModal from './CommentModal'

interface PostCardProps {
    post: {
        id: string
        content: string
        image_url: string | null
        type: 'image' | 'reel'
        thumbnail_url?: string | null
        created_at: string
        profiles: {
            username: string
            full_name: string
            avatar_url: string | null
        }
    }
    onBookmarkRemoved?: () => void
}

import { motion, AnimatePresence } from 'framer-motion'

export default function PostCard({ post, onBookmarkRemoved }: PostCardProps) {
    const { id, content, image_url, type, thumbnail_url, created_at, profiles } = post
    const { username, full_name, avatar_url } = profiles

    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
    const [commentCount, setCommentCount] = useState(0)
    const [isBookmarked, setIsBookmarked] = useState(false)

    useEffect(() => {
        fetchPostStats()
    }, [id])

    const fetchPostStats = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch likes
        const { data: likes, error: likeError } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', id)

        if (!likeError) {
            setLikeCount(likes?.length || 0)
            if (user) {
                setIsLiked(likes?.some(like => like.user_id === user.id) || false)
            }
        }

        // Fetch comments count
        const { count, error: commentError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)

        if (!commentError) {
            setCommentCount(count || 0)
        }

        // Fetch bookmark status
        if (user) {
            const { data: bookmark } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .eq('post_id', id)
                .maybeSingle()

            setIsBookmarked(!!bookmark)
        }
    }

    const toggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return alert('Log in to like posts')

        const originalLiked = isLiked
        const originalCount = likeCount

        // Optimistic update
        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

        if (originalLiked) {
            const { error } = await supabase
                .from('likes')
                .delete()
                .match({ post_id: id, user_id: user.id })

            if (error) {
                setIsLiked(originalLiked)
                setLikeCount(originalCount)
            }
        } else {
            const { error } = await supabase
                .from('likes')
                .insert({ post_id: id, user_id: user.id })

            if (error) {
                setIsLiked(originalLiked)
                setLikeCount(originalCount)
            }
        }
    }

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return alert('Log in to bookmark posts')

        const originalState = isBookmarked

        // Optimistic update
        setIsBookmarked(!isBookmarked)

        if (originalState) {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .match({ post_id: id, user_id: user.id })

            if (error) {
                setIsBookmarked(originalState)
            } else {
                onBookmarkRemoved?.()
            }
        } else {
            const { error } = await supabase
                .from('bookmarks')
                .insert({ post_id: id, user_id: user.id })

            if (error) {
                setIsBookmarked(originalState)
            }
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="border-b border-border-color p-6 bg-background hover:bg-surface-hover/30 transition-all duration-300 cursor-pointer group"
            >
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-surface border border-border-color flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors shadow-sm">
                            {avatar_url ? (
                                <img src={avatar_url} alt={username} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-black text-xs uppercase">{username[0]}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="font-black text-sm uppercase tracking-wider text-foreground truncate group-hover:text-primary transition-colors">
                                    {full_name || username}
                                </span>
                                <span className="text-slate-500 text-[11px] font-bold tracking-tight truncate">@{username}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(created_at))} AGO
                                </span>
                            </div>
                            <button className="text-slate-400 hover:text-primary transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
                            {content}
                        </p>

                        {image_url && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-border-color group-relative aspect-video shadow-sm bg-black">
                                {type === 'reel' ? (
                                    <video
                                        src={image_url}
                                        poster={thumbnail_url || undefined}
                                        controls
                                        loop
                                        muted
                                        preload="none"
                                        playsInline
                                        className="w-full h-full object-contain contrast-[1.05]"
                                    />
                                ) : (
                                    <img
                                        src={image_url}
                                        alt="Post content"
                                        loading="lazy"
                                        className="w-full h-full object-cover contrast-[1.05] hover:scale-105 transition-all duration-700"
                                    />
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-slate-400 mt-5 pr-8">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsCommentModalOpen(true) }}
                                className="flex items-center gap-2 group/btn transition-colors hover:text-primary"
                            >
                                <div className="p-2 border border-transparent group-hover/btn:border-primary/20 rounded-lg transition-all group-hover/btn:bg-primary/5">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black tracking-widest group-hover/btn:text-primary">{commentCount}</span>
                            </button>

                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-2 group/btn transition-colors ${isLiked ? 'text-secondary' : 'hover:text-secondary'}`}
                            >
                                <div className={`p-2 border border-transparent ${isLiked ? 'border-secondary/20 bg-secondary/5' : 'group-hover/btn:border-secondary/20 group-hover/btn:bg-secondary/5'} rounded-lg transition-all`}>
                                    <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest">{likeCount}</span>
                            </button>

                            <button className="flex items-center gap-2 group/btn transition-colors hover:text-cyan-600">
                                <div className="p-2 border border-transparent group-hover/btn:border-cyan-600/20 rounded-lg transition-all group-hover/btn:bg-cyan-50">
                                    <Share2 className="w-4 h-4" />
                                </div>
                            </button>

                            <button
                                onClick={toggleBookmark}
                                className={`flex items-center gap-2 group/btn transition-colors ${isBookmarked ? 'text-primary' : 'hover:text-primary'}`}
                            >
                                <div className={`p-2 border border-transparent ${isBookmarked ? 'border-primary/20 bg-primary/5' : 'group-hover/btn:border-primary/20 group-hover/btn:bg-primary/5'} rounded-lg transition-all`}>
                                    <Bookmark className={`w-4 h-4 transition-all ${isBookmarked ? 'fill-current scale-110' : ''}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isCommentModalOpen && (
                    <CommentModal
                        postId={id}
                        onClose={() => {
                            setIsCommentModalOpen(false)
                            fetchPostStats()
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
