'use client'

import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
    onSend: (content: string) => void
    disabled?: boolean
}

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        const trimmed = message.trim()
        if (trimmed && !disabled) {
            onSend(trimmed)
            setMessage('')
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="border-t border-border-color bg-background p-4">
            <div className="flex items-end gap-3">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="TYPE YOUR SIGNAL..."
                    disabled={disabled}
                    className="flex-1 bg-surface border border-border-color focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm resize-none transition-all placeholder-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={1}
                    style={{
                        minHeight: '44px',
                        maxHeight: '120px',
                        height: 'auto'
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                    }}
                />

                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-sm flex-shrink-0"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {message.length > 0 && (
                <div className="mt-2 text-right">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${message.length > 500 ? 'text-red-500' : 'text-slate-400'
                        }`}>
                        {message.length} / 1000
                    </span>
                </div>
            )}
        </div>
    )
}
