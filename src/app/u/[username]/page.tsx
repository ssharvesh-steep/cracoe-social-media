'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import PostCard from '@/components/PostCard'
import { Loader2, Calendar, Edit3, User } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import EditProfileModal from '@/components/EditProfileModal'
import FollowButton from '@/components/FollowButton'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function ProfilePage() {
    const { username } = useParams()
    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentSession, setCurrentSession] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [followerCount, setFollowerCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [activeTab, setActiveTab] = useState('Posts')

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setCurrentSession(session)
        })
        fetchProfile()
    }, [username])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .maybeSingle()

            if (profileError) throw profileError
            if (!profileData) {
                setProfile(null)
                return
            }

            setProfile(profileData)

            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*, profiles(*)')
                .eq('user_id', profileData.id)
                .order('created_at', { ascending: false })

            if (postsError) throw postsError
            setPosts(postsData || [])
            await fetchFollowCounts(profileData.id)
        } catch (error: any) {
            console.error('Error:', error)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    const fetchFollowCounts = async (userId: string) => {
        const { count: followers } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId)

        const { count: following } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId)

        setFollowerCount(followers || 0)
        setFollowingCount(following || 0)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-black">User not found</h2>
                <p className="text-gray-500 mt-2 max-w-sm">The account you are looking for doesn't exist or may have been removed.</p>
                <Link href="/" className="mt-6 text-primary font-bold hover:underline">Go back home</Link>
            </div>
        )
    }

    const isOwnProfile = currentSession?.user?.id === profile.id

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background min-h-screen border-x border-border-color max-w-[600px] mx-auto relative"
        >
            {/* Cover and Avatar Section */}
            <div className="h-44 bg-slate-100 relative overflow-hidden group">
                {/* Metallic grid/pattern background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background" />

                <div className="absolute -bottom-16 left-8">
                    <div className="w-32 h-32 rounded-2xl bg-surface border-4 border-background flex items-center justify-center overflow-hidden shadow-xl">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-500" />
                        ) : (
                            <span className="text-4xl font-black text-primary uppercase tracking-tighter">{profile.username[0]}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Terminal Info */}
            <div className="pt-20 px-8 pb-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">{profile.full_name || profile.username}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">NETWORK_ID.@{profile.username}</p>
                        </div>
                    </div>
                    {isOwnProfile ? (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-2.5 bg-surface border border-border-color rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
                        >
                            <Edit3 className="w-4 h-4 mb-0.5 inline-block mr-2" />
                            CONFIGURE
                        </button>
                    ) : (
                        <FollowButton
                            profileId={profile.id}
                            onFollowChange={() => fetchFollowCounts(profile.id)}
                        />
                    )}
                </div>

                <div className="p-5 bg-slate-50/50 border border-border-color rounded-xl relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                        <User className="w-24 h-24" />
                    </div>
                    <p className="text-sm font-bold tracking-tight text-slate-600 leading-relaxed uppercase">
                        {profile.bio || "IDENTITY_LOG_EMPTY. // NO_BIOGRAPHY_DEFINED"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-8 items-center pt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber Network</span>
                        <button className="flex gap-2 items-center group">
                            <span className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{followerCount}</span>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">NODES</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Subscriptions</span>
                        <button className="flex gap-2 items-center group">
                            <span className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{followingCount}</span>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">NODES</span>
                        </button>
                    </div>
                    {profile.created_at && (
                        <div className="flex flex-col gap-1 ml-auto text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Start</span>
                            <div className="flex items-center gap-2 justify-end text-slate-400 text-[10px] font-black uppercase">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(profile.created_at), 'MMM yyyy')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-t border-b border-border-color sticky top-0 glass z-30">
                {['Posts', 'Replies', 'Media', 'Likes'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-1 relative py-5 group"
                    >
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-400 group-hover:text-foreground'}`}>
                            {tab}
                        </span>
                        {activeTab === tab && (
                            <motion.div
                                layoutId="profileTabLine"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Module */}
            <div className="flex flex-col pb-24 md:pb-12">
                <AnimatePresence mode="popLayout">
                    {activeTab === 'Posts' ? (
                        posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="py-32 text-center">
                                <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">TRANSMISSION_HISTORY_EMPTY</h3>
                                <p className="text-slate-300 text-[10px] font-bold uppercase mt-2">NO DATA SIGNALS DETECTED IN THIS NODE</p>
                            </div>
                        )
                    ) : (
                        <div className="py-32 text-center">
                            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">MODULE_EMPTY. // DATA_PENDING</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {isEditModalOpen && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={fetchProfile}
                />
            )}
        </motion.div>
    )
}
