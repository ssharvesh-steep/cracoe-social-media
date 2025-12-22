'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import ReelCard from '@/components/ReelCard'
import { Loader2, Clapperboard } from 'lucide-react'

export default function ReelsPage() {
    const [reels, setReels] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const REELS_PER_PAGE = 5
    const observerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchReels(0, true)
    }, [])

    const fetchReels = async (pageNumber: number, isReset = false) => {
        if (loading || (!hasMore && !isReset)) return

        setLoading(true)
        const from = pageNumber * REELS_PER_PAGE
        const to = from + REELS_PER_PAGE - 1

        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles(*)')
            .eq('type', 'reel')
            .order('created_at', { ascending: false })
            .range(from, to)

        if (!error && data) {
            if (data.length < REELS_PER_PAGE) {
                setHasMore(false)
            }
            setReels(prev => isReset ? data : [...prev, ...data])
        }
        setLoading(false)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchReels(nextPage)
                }
            },
            { threshold: 0.1 }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [hasMore, loading, page])

    return (
        <div className="h-screen w-full bg-black flex justify-center">
            <div className="w-full max-w-[500px] h-full no-scrollbar snap-y snap-mandatory overflow-y-scroll relative">
                {reels.map((reel) => (
                    <ReelCard key={reel.id} reel={reel} />
                ))}

                {/* Initial Loading State */}
                {loading && reels.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="mt-4 text-white text-[10px] font-black uppercase tracking-[.3em]">Calibrating Frequency</p>
                    </div>
                )}

                {/* Empty State */}
                {reels.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-10">
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                            <Clapperboard className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xl">No Transmissions</h3>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-4 max-w-[280px] leading-relaxed">
                            THE REEL FREQUENCY IS CURRENTLY VACANT. INITIATE A NEW VIDEO SIGNAL TO BEGIN BROADCAST.
                        </p>
                    </div>
                )}

                {/* Infinite Scroll Sentinel */}
                <div ref={observerRef} className="h-1 snapping-none" />

                {hasMore && loading && reels.length > 0 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
            </div>
        </div>
    )
}
