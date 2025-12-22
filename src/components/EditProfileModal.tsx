'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { X, Loader2, Camera } from 'lucide-react'

interface EditProfileModalProps {
    profile: any
    onClose: () => void
    onUpdate: () => void
}

export default function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(profile.full_name || '')
    const [bio, setBio] = useState(profile.bio || '')
    const [loading, setLoading] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    bio: bio,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)

            if (error) throw error
            onUpdate()
            onClose()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2 className="font-bold text-xl text-gray-900">Edit profile</h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-black text-white px-4 py-1.5 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>

                <div className="h-32 bg-gray-200 relative">
                    <div className="absolute -bottom-12 left-4">
                        <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white relative group overflow-hidden">
                            {profile.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" />}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-4 pt-16 space-y-6">
                    <div className="space-y-1 border border-gray-200 rounded p-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <label className="text-xs text-gray-500 px-1">Name</label>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full text-lg border-none focus:ring-0 p-1"
                            placeholder="Your display name"
                        />
                    </div>

                    <div className="space-y-1 border border-gray-200 rounded p-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <label className="text-xs text-gray-500 px-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full text-lg border-none focus:ring-0 p-1 resize-none h-24"
                            placeholder="Tell us about yourself"
                        />
                    </div>
                </form>

                {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}
            </div>
        </div>
    )
}
