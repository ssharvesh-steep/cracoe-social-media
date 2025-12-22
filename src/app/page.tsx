'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import ComposePost from '@/components/ComposePost'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const POSTS_PER_PAGE = 10

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Reset and fetch when tab or session changes
  useEffect(() => {
    setPosts([])
    setPage(0)
    setHasMore(true)
    fetchPosts(0, true)
  }, [activeTab, session])

  const fetchPosts = async (pageNumber: number, isReset = false) => {
    if (loading || (!hasMore && !isReset)) return

    setLoading(true)
    const from = pageNumber * POSTS_PER_PAGE
    const to = from + POSTS_PER_PAGE - 1

    let query = supabase
      .from('posts')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (activeTab === 'following' && session) {
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', session.user.id)

      const followingIds = followingData?.map(f => f.following_id) || []

      if (followingIds.length === 0) {
        setPosts([])
        setHasMore(false)
        setLoading(false)
        return
      }
      query = query.in('user_id', followingIds)
    }

    const { data, error } = await query

    if (!error && data) {
      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false)
      }
      setPosts(prev => isReset ? data : [...prev, ...data])
    }
    setLoading(false)
  }

  // Handle intersection for infinite scroll
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchPosts(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, page])

  const fetchSinglePost = async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()

    if (!error && data) {
      setPosts((prev) => [data, ...prev])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <div className="flex justify-center min-h-screen bg-background">
      <main className="w-full max-w-[600px] min-h-screen border-x border-border-color bg-background relative mb-20 md:mb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary neon-glow" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-[0.15em] text-foreground">
                Frequency
              </h1>
            </div>
            {!session && (
              <Link href="/login" className="bg-foreground text-background px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300">
                INITIATE
              </Link>
            )}
          </div>

          {/* Feed Tabs */}
          {session && (
            <div className="flex border-t border-border-color">
              <button
                onClick={() => setActiveTab('foryou')}
                className="flex-1 relative py-4 group"
              >
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'foryou' ? 'text-primary' : 'text-slate-500 group-hover:text-foreground'}`}>
                  ALL SIGNALS
                </span>
                {activeTab === 'foryou' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className="flex-1 relative py-4 group"
              >
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'following' ? 'text-primary' : 'text-slate-500 group-hover:text-foreground'}`}>
                  SUBSCRIBED
                </span>
                {activeTab === 'following' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </div>
          )}
        </header>

        {session && <ComposePost onPostCreated={() => { }} />}

        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </AnimatePresence>

          {/* Initial Loading State */}
          {loading && posts.length === 0 && (
            <div className="flex justify-center p-24">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-xl animate-spin" />
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={observerRef} className="h-20 flex items-center justify-center">
            {hasMore && loading && posts.length > 0 && (
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-xl animate-spin" />
            )}
          </div>

          {posts.length === 0 && !loading && (
            <div className="px-12 py-32 text-center">
              <div className="w-20 h-20 bg-surface border border-border-color rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Void Detected</h3>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-4 max-w-[280px] mx-auto leading-relaxed">
                {activeTab === 'following'
                  ? "NO ACTIVE SIGNALS FROM YOUR SUBSCRIPTION LIST. INITIATE NEW CONNECTIONS TO POPULATE FEED."
                  : "THE GLOBAL FREQUENCY IS CURRENTLY SILENT. BE THE FIRST TO EMIT A SIGNAL."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-[380px] h-screen sticky top-0 px-10 py-10 space-y-10">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="INTERCEPT..."
            className="w-full bg-surface border border-border-color focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-3.5 pl-14 pr-4 transition-all uppercase text-[11px] font-black tracking-widest placeholder-slate-300 shadow-sm"
          />
        </div>

        {/* Global Trends */}
        <div className="bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border-color bg-slate-50/50">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Live Frequencies</h2>
          </div>
          <div className="divide-y divide-border-color">
            <TrendItem tag="#XAUUSD" posts="42.5K" />
            <TrendItem tag="#CYBERMOD" posts="12.8K" />
            <TrendItem tag="#CRAC0E" posts="8.4K" />
          </div>
          <button className="w-full text-center py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all">
            Expand Log
          </button>
        </div>

        {/* Network suggestions */}
        <div className="bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border-color bg-slate-50/50">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Node Suggestions</h2>
          </div>
          <div className="divide-y divide-border-color">
            <UserItem name="CYBER_SYSTEM" username="root" />
            <UserItem name="MOD_X" username="admin_mod" />
          </div>
          <button className="w-full text-center py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all">
            Scout Network
          </button>
        </div>
      </aside>
    </div>
  )
}

function TrendItem({ tag, posts }: { tag: string, posts: string }) {
  return (
    <div className="px-5 py-4 hover:bg-slate-50 cursor-pointer transition-all group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Global Trend</p>
          <p className="font-black text-xs mt-1 text-foreground group-hover:text-primary transition-colors">{tag}</p>
        </div>
        <div className="px-2 py-1 bg-white border border-border-color rounded-md shadow-sm">
          <p className="text-slate-500 text-[9px] font-black">{posts}</p>
        </div>
      </div>
    </div>
  )
}

function UserItem({ name, username }: { name: string, username: string }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-background border border-border-color flex items-center justify-center text-primary font-black text-xs group-hover:border-primary/50 transition-all shadow-sm">
          {name[0]}
        </div>
        <div className="min-w-0">
          <p className="font-black text-xs text-foreground uppercase tracking-tight truncate">{name}</p>
          <p className="text-slate-400 text-[10px] font-bold truncate">@{username}</p>
        </div>
      </div>
      <button className="bg-foreground text-background px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-sm">
        FOLLOW
      </button>
    </div>
  )
}
