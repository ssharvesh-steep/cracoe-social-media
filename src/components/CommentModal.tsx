'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { X, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentModalProps {
    postId: string
    onClose: () => void
}

export default function CommentModal({ postId, onClose }: CommentModalProps) {
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        fetchComments()
    }, [postId])

    const fetchComments = async () => {
        setFetching(true)
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(*)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (error) console.error(error)
        else setComments(data || [])
        setFetching(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Log in to comment')
                return
            }

            const { error } = await supabase
                .from('comments')
                .insert({
                    content: newComment,
                    post_id: postId,
                    user_id: user.id
                })

            if (error) throw error

            setNewComment('')
            fetchComments()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Comments</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {fetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center border border-blue-100">
                                    <span className="text-xs font-bold text-blue-500">{comment.profiles.username[0].toUpperCase()}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
                                        <p className="font-bold text-xs text-gray-900">{comment.profiles.full_name || comment.profiles.username}</p>
                                        <p className="text-sm text-gray-800">{comment.content}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 ml-2">
                                        {formatDistanceToNow(new Date(comment.created_at))} ago
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8 text-sm">No comments yet. Be the first to reply!</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    )
}
