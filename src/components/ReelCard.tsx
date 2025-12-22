'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, Music2, User } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface ReelCardProps {
    reel: {
        id: string
        content: string
        image_url: string
        created_at: string
        profiles: {
            username: string
            full_name: string
            avatar_url: string | null
        }
    }
}

export default function ReelCard({ reel }: ReelCardProps) {
    const { id, content, image_url, profiles } = reel
    const { username, full_name, avatar_url } = profiles

    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [commentCount, setCommentCount] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => { })
                    setIsPlaying(true)
                } else {
                    videoRef.current?.pause()
                    setIsPlaying(false)
                }
            },
            { threshold: 0.6 }
        )

        if (videoRef.current) {
            observer.observe(videoRef.current)
        }

        fetchStats()

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current)
        }
    }, [id])

    const fetchStats = async () => {
        const { count: likes } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)

        const { count: comments } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)

        setLikeCount(likes || 0)
        setCommentCount(comments || 0)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: like } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', id)
                .eq('user_id', user.id)
                .maybeSingle()
            setIsLiked(!!like)
        }
    }

    const toggleLike = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return alert('Log in to like reels')

        if (isLiked) {
            await supabase.from('likes').delete().match({ post_id: id, user_id: user.id })
            setLikeCount(prev => prev - 1)
        } else {
            await supabase.from('likes').insert({ post_id: id, user_id: user.id })
            setLikeCount(prev => prev + 1)
        }
        setIsLiked(!isLiked)
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    return (
        <div className="relative h-screen w-full bg-black snap-start overflow-hidden group">
            <video
                ref={videoRef}
                src={image_url}
                className="h-full w-full object-contain cursor-pointer"
                loop
                playsInline
                onClick={togglePlay}
                preload="metadata"
                onError={(e) => {
                    console.error('Video Playback Error for ID:', id, e)
                    const videoTag = e.currentTarget as HTMLVideoElement
                    console.error('Video Error Status:', videoTag.error)
                    console.error('Video Source:', image_url)
                }}
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={toggleLike}
                        className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all active:scale-90 ${isLiked ? 'text-secondary' : 'text-white'}`}
                    >
                        <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <span className="text-white text-xs font-bold tracking-tight">{likeCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white transition-all active:scale-90">
                        <MessageCircle className="w-7 h-7" />
                    </button>
                    <span className="text-white text-xs font-bold tracking-tight">{commentCount}</span>
                </div>

                <button className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white transition-all active:scale-90">
                    <Share2 className="w-7 h-7" />
                </button>

                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-surface animate-spin-slow">
                    {avatar_url ? (
                        <img src={avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                            <Music2 className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute left-0 right-0 bottom-0 p-6 z-10 pointer-events-none">
                <div className="flex flex-col gap-3 max-w-[80%] pointer-events-auto">
                    <Link href={`/u/${username}`} className="flex items-center gap-3 group/user">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center">
                            {avatar_url ? (
                                <img src={avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-white font-black text-sm uppercase tracking-wider group-hover:text-primary transition-colors">
                                {full_name || username}
                            </p>
                            <p className="text-white/60 text-[10px] font-bold">@{username}</p>
                        </div>
                    </Link>

                    <p className="text-white text-sm font-medium line-clamp-3 leading-relaxed">
                        {content}
                    </p>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg w-fit">
                        <Music2 className="w-3.5 h-3.5 text-white" />
                        <span className="text-white text-[10px] font-black tracking-widest uppercase truncate max-w-[150px]">
                            Original Audio - {username}
                        </span>
                    </div>
                </div>
            </div>

            {/* Play/Pause Indicator Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <div className="p-6 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
                            <svg className="w-12 h-12 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
