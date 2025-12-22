'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Search, Trash2, Eye, Heart, MessageCircle, Calendar, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ContentModeration() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPost, setSelectedPost] = useState<any>(null)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (*),
                likes (count),
                comments (count)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching posts:', error)
        } else {
            setPosts(data || [])
        }

        setLoading(false)
    }

    const deletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)

        if (error) {
            alert('Error deleting post: ' + error.message)
        } else {
            alert('Post deleted successfully')
            fetchPosts()
        }
    }

    const viewPostDetails = async (post: any) => {
        setSelectedPost(post)
        setShowDetails(true)

        // Fetch comments
        const { data: comments } = await supabase
            .from('comments')
            .select('*, profiles(*)')
            .eq('post_id', post.id)
            .order('created_at', { ascending: false })

        setSelectedPost({
            ...post,
            fullComments: comments || []
        })
    }

    const filteredPosts = posts.filter(post =>
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Total Posts</p>
                    <p className="text-3xl font-black text-blue-900">{posts.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold">Posts with Images</p>
                    <p className="text-3xl font-black text-purple-900">
                        {posts.filter(p => p.image_url).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                    <p className="text-sm text-pink-600 font-semibold">Total Likes</p>
                    <p className="text-3xl font-black text-pink-900">
                        {posts.reduce((sum, post) => sum + (post.likes?.[0]?.count || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts by content or author..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                    {post.profiles?.avatar_url ? (
                                        <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-blue-500 font-bold">
                                            {post.profiles?.username?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{post.profiles?.full_name || post.profiles?.username}</p>
                                    <p className="text-xs text-gray-500">@{post.profiles?.username}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {formatDistanceToNow(new Date(post.created_at))} ago
                            </div>
                        </div>

                        <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

                        {post.image_url && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                                <img src={post.image_url} alt="Post image" className="w-full h-auto max-h-96 object-cover" />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {post.likes?.[0]?.count || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    {post.comments?.[0]?.count || 0}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => viewPostDetails(post)}
                                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => deletePost(post.id)}
                                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No posts found</p>
                </div>
            )}

            {/* Post Details Modal */}
            {showDetails && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Post Details</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Author Info */}
                            <div className="flex items-center gap-4 pb-4 border-b">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                                    {selectedPost.profiles?.avatar_url ? (
                                        <img src={selectedPost.profiles.avatar_url} alt={selectedPost.profiles.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl text-blue-500 font-bold">
                                            {selectedPost.profiles?.username?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedPost.profiles?.full_name || selectedPost.profiles?.username}</h3>
                                    <p className="text-gray-500">@{selectedPost.profiles?.username}</p>
                                    <p className="text-sm text-gray-400">{new Date(selectedPost.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Content</h4>
                                <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.content}</p>
                            </div>

                            {/* Post Image */}
                            {selectedPost.image_url && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Image</h4>
                                    <img src={selectedPost.image_url} alt="Post image" className="w-full rounded-lg border border-gray-200" />
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-pink-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-pink-600">{selectedPost.likes?.[0]?.count || 0}</p>
                                    <p className="text-sm text-gray-600">Likes</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-blue-600">{selectedPost.comments?.[0]?.count || 0}</p>
                                    <p className="text-sm text-gray-600">Comments</p>
                                </div>
                            </div>

                            {/* Comments */}
                            {selectedPost.fullComments && selectedPost.fullComments.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-3">Comments ({selectedPost.fullComments.length})</h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {selectedPost.fullComments.map((comment: any) => (
                                            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                                        {comment.profiles?.avatar_url ? (
                                                            <img src={comment.profiles.avatar_url} alt={comment.profiles.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs text-blue-500 font-bold">
                                                                {comment.profiles?.username?.[0]?.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{comment.profiles?.username}</p>
                                                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_at))} ago</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Post ID */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Post ID</p>
                                <code className="text-xs bg-white px-2 py-1 rounded font-mono border border-gray-200">{selectedPost.id}</code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
