'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Image, X, Loader2, Video } from 'lucide-react'

export default function ComposePost({ onPostCreated }: { onPostCreated?: () => void }) {
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [mediaType, setMediaType] = useState<'image' | 'reel'>('image')
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            setMediaType(file.type.startsWith('video/') ? 'reel' : 'image')
            setPreview(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImage(null)
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content && !image) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('You must be logged in to post')
                return
            }

            let image_url = null

            if (image) {
                const fileExt = image.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError, data } = await supabase.storage
                    .from('media')
                    .upload(filePath, image)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('media')
                    .getPublicUrl(filePath)

                image_url = publicUrl
            }

            const { error: postError } = await supabase
                .from('posts')
                .insert({
                    content,
                    image_url,
                    type: mediaType,
                    user_id: user.id
                })

            if (postError) throw postError

            setContent('')
            removeImage()
            if (onPostCreated) onPostCreated()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border-b border-border-color p-8 bg-background relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex gap-5 relative z-10">
                <div className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-surface border border-border-color flex items-center justify-center overflow-hidden shadow-sm">
                        <span className="text-primary font-black text-[10px] uppercase tracking-tighter">NODE</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="INITIATE FREQUENCY..."
                        className="w-full text-lg bg-transparent border-none focus:ring-0 resize-none min-h-[120px] placeholder-slate-300 text-foreground font-bold tracking-tight uppercase"
                    />

                    {preview && (
                        <div className="relative rounded-2xl overflow-hidden border border-border-color bg-surface group animate-in fade-in zoom-in duration-300 shadow-sm">
                            {mediaType === 'reel' ? (
                                <video src={preview} controls className="w-full h-auto max-h-[500px] object-contain contrast-[1.02]" />
                            ) : (
                                <img src={preview} alt="Preview" className="w-full h-auto max-h-[500px] object-cover contrast-[1.02] transition-all duration-500" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-4 right-4 p-2.5 bg-background/90 text-foreground rounded-xl border border-border-color hover:bg-secondary hover:text-white hover:border-secondary transition-all group-hover:scale-105 active:scale-95 shadow-xl"
                            >
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-5 border-t border-border-color">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-slate-400 hover:text-primary bg-surface border border-border-color hover:border-primary/30 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                                title="Attach Fragment"
                            >
                                <Image className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                accept="image/*,video/*"
                                onChange={handleImageChange}
                            />

                            {content.length > 0 && (
                                <div className="flex items-center gap-3 ml-2 px-3 py-1.5 bg-surface border border-border-color rounded-lg shadow-sm">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse-slow ${content.length > 280 ? 'bg-secondary' : 'bg-primary'}`} />
                                    <span className={`text-[10px] font-black tracking-widest ${content.length > 280 ? 'text-secondary' :
                                        content.length > 260 ? 'text-amber-500' :
                                            'text-slate-400'
                                        }`}>
                                        {280 - content.length} BITS REMAINING
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (!content && !image) || content.length > 280}
                            className={`
                                relative overflow-hidden px-10 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em]
                                transition-all duration-300 shadow-lg active:scale-95
                                ${loading || (!content && !image) || content.length > 280
                                    ? 'bg-surface text-slate-300 border border-border-color cursor-not-allowed shadow-none'
                                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'}
                            `}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONSTRUCT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
