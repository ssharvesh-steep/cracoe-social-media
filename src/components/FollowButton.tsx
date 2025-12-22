'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface FollowButtonProps {
    profileId: string
    initialIsFollowing?: boolean
    onFollowChange?: (isFollowing: boolean) => void
    variant?: 'default' | 'small'
}

export default function FollowButton({
    profileId,
    initialIsFollowing = false,
    onFollowChange,
    variant = 'default'
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [loading, setLoading] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        checkFollowStatus()
    }, [profileId])

    const checkFollowStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setCurrentUserId(user.id)

        const { data } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', profileId)
            .maybeSingle()

        setIsFollowing(!!data)
    }

    const toggleFollow = async () => {
        if (!currentUserId) {
            alert('Please log in to follow users')
            return
        }

        if (currentUserId === profileId) {
            return // Can't follow yourself
        }

        setLoading(true)
        const originalState = isFollowing

        // Optimistic update
        setIsFollowing(!isFollowing)
        onFollowChange?.(!isFollowing)

        try {
            // Verify current user has a profile record
            const { data: myProfile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', currentUserId)
                .maybeSingle()

            if (profileError) throw profileError
            if (!myProfile) {
                alert('Your profile record is missing. Please try logging out and back in to re-sync.')
                return
            }

            if (originalState) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUserId)
                    .eq('following_id', profileId)

                if (error) throw error
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: currentUserId,
                        following_id: profileId
                    })

                if (error) throw error
            }
        } catch (error: any) {
            console.error('Follow Error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                error
            })
            alert(`Error: ${error.message || 'Unknown error occurred'}`)
            // Revert on error
            setIsFollowing(originalState)
            onFollowChange?.(originalState)
        } finally {
            setLoading(false)
        }
    }

    if (!currentUserId || currentUserId === profileId) {
        return null
    }

    const buttonClasses = variant === 'small'
        ? 'px-3 py-1 text-sm'
        : 'px-4 py-2'

    return (
        <button
            onClick={toggleFollow}
            disabled={loading}
            className={`${buttonClasses} rounded-full font-bold transition-all duration-200 flex items-center gap-2 ${isFollowing
                ? 'bg-transparent border-2 border-gray-300 text-gray-900 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus className="w-4 h-4" />
                    {variant === 'default' && <span>Following</span>}
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    {variant === 'default' && <span>Follow</span>}
                </>
            )}
        </button>
    )
}
