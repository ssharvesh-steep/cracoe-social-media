'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Search, Mail, Calendar, Shield, Ban, Loader2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([])
    const [authUsers, setAuthUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)

        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
        } else {
            setUsers(profilesData || [])
        }

        // Fetch auth users (requires admin access)
        // Note: Direct access to auth.users requires service role key
        // For now, we'll show what we can from profiles

        setLoading(false)
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: !currentStatus })
            .eq('id', userId)

        if (error) {
            alert('Error updating admin status: ' + error.message)
        } else {
            alert(`Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully`)
            fetchUsers()
        }
    }

    const toggleBanStatus = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: !currentStatus })
            .eq('id', userId)

        if (error) {
            alert('Error updating ban status: ' + error.message)
        } else {
            alert(`User ${!currentStatus ? 'banned' : 'unbanned'} successfully`)
            fetchUsers()
        }
    }

    const viewUserDetails = async (user: any) => {
        setSelectedUser(user)
        setShowDetails(true)

        // Fetch additional stats
        const [postsCount, followersCount, followingCount, likesCount] = await Promise.all([
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
            supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ])

        setSelectedUser({
            ...user,
            stats: {
                posts: postsCount.count || 0,
                followers: followersCount.count || 0,
                following: followingCount.count || 0,
                likes: likesCount.count || 0,
            }
        })
    }

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Total Users</p>
                    <p className="text-3xl font-black text-blue-900">{users.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-semibold">Admin Users</p>
                    <p className="text-3xl font-black text-green-900">
                        {users.filter(u => u.is_admin).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-semibold">Banned Users</p>
                    <p className="text-3xl font-black text-red-900">
                        {users.filter(u => u.is_banned).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold">Active Users</p>
                    <p className="text-3xl font-black text-purple-900">
                        {users.filter(u => !u.is_banned).length}
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
                    placeholder="Search by username, name, or ID..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-blue-500 font-bold">
                                                    {user.username?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.full_name || user.username}</p>
                                            <p className="text-sm text-gray-500">@{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            {user.id.substring(0, 8)}...
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(user.id, user.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            {copiedId === user.id ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        {formatDistanceToNow(new Date(user.created_at))} ago
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                        {user.is_admin && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                Admin
                                            </span>
                                        )}
                                        {user.is_banned && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                                <Ban className="w-3 h-3" />
                                                Banned
                                            </span>
                                        )}
                                        {!user.is_admin && !user.is_banned && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => viewUserDetails(user)}
                                            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                                            className={`px-3 py-1.5 text-sm rounded transition-colors ${user.is_admin
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                        >
                                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                        <button
                                            onClick={() => toggleBanStatus(user.id, user.is_banned)}
                                            className={`px-3 py-1.5 text-sm rounded transition-colors ${user.is_banned
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                        >
                                            {user.is_banned ? 'Unban' : 'Ban'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No users found</p>
                </div>
            )}

            {/* User Details Modal */}
            {showDetails && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">User Details</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl text-blue-500 font-bold">
                                            {selectedUser.username?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.full_name || selectedUser.username}</h3>
                                    <p className="text-gray-500">@{selectedUser.username}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            {selectedUser.stats && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.posts}</p>
                                        <p className="text-sm text-gray-600">Posts</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">{selectedUser.stats.followers}</p>
                                        <p className="text-sm text-gray-600">Followers</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-purple-600">{selectedUser.stats.following}</p>
                                        <p className="text-sm text-gray-600">Following</p>
                                    </div>
                                    <div className="bg-pink-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-pink-600">{selectedUser.stats.likes}</p>
                                        <p className="text-sm text-gray-600">Likes</p>
                                    </div>
                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{selectedUser.id}</code>
                                        <button
                                            onClick={() => copyToClipboard(selectedUser.id, 'modal-' + selectedUser.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            {copiedId === 'modal-' + selectedUser.id ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-500">Bio</p>
                                    <p className="text-gray-900">{selectedUser.bio || 'No bio'}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleString()}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-500">Account Status</p>
                                    <div className="flex gap-2 mt-1">
                                        {selectedUser.is_admin && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Admin</span>
                                        )}
                                        {selectedUser.is_banned && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Banned</span>
                                        )}
                                        {!selectedUser.is_banned && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> User passwords are securely hashed by Supabase Auth and cannot be viewed in plain text. This is a security best practice.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
