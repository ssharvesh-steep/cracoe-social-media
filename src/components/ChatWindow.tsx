'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import {
    Message,
    getConversationMessages,
    sendMessage,
    markMessagesAsRead,
    subscribeToMessages
} from '@/utils/messaging'

interface ChatWindowProps {
    conversationId: string
    otherUser: {
        id: string
        username: string
        full_name: string
        avatar_url: string
    }
    currentUserId: string
    onBack?: () => void
}

export default function ChatWindow({
    conversationId,
    otherUser,
    currentUserId,
    onBack
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Load messages
    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true)
            const msgs = await getConversationMessages(conversationId)
            setMessages(msgs)
            setLoading(false)
            setTimeout(scrollToBottom, 100)

            // Mark messages as read
            await markMessagesAsRead(conversationId, currentUserId)
        }

        loadMessages()
    }, [conversationId, currentUserId])

    // Subscribe to new messages
    useEffect(() => {
        const subscription = subscribeToMessages(conversationId, (newMessage) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === newMessage.id)) return prev
                return [...prev, newMessage]
            })

            setTimeout(scrollToBottom, 100)

            // Mark as read if not from current user
            if (newMessage.sender_id !== currentUserId) {
                markMessagesAsRead(conversationId, currentUserId)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [conversationId, currentUserId])

    // Handle send message
    const handleSend = async (content: string) => {
        if (!content.trim() || sending) return

        setSending(true)
        const newMessage = await sendMessage(conversationId, currentUserId, content)

        if (newMessage) {
            // Message will be added via subscription, but add optimistically for better UX
            setMessages(prev => {
                if (prev.some(m => m.id === newMessage.id)) return prev
                return [...prev, newMessage]
            })
            setTimeout(scrollToBottom, 100)
        }

        setSending(false)
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-border-color">
                <div className="px-4 py-4 flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="lg:hidden p-2 hover:bg-surface rounded-lg transition-colors"
                            aria-label="Back to conversations"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-border-color flex items-center justify-center text-primary font-black text-xs shadow-sm flex-shrink-0">
                            {otherUser.avatar_url ? (
                                <img
                                    src={otherUser.avatar_url}
                                    alt={otherUser.username}
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            ) : (
                                otherUser.username?.[0]?.toUpperCase() || '?'
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="font-black text-sm uppercase tracking-tight truncate">
                                {otherUser.full_name || otherUser.username}
                            </h2>
                            <p className="text-slate-400 text-[10px] font-bold truncate">
                                @{otherUser.username}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-6"
                style={{ scrollBehavior: 'smooth' }}
            >
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-xl animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="w-16 h-16 bg-surface border border-border-color rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <span className="text-2xl">💬</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-foreground mb-2">
                            No Messages Yet
                        </h3>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest max-w-[280px] leading-relaxed">
                            Start the conversation by sending a message
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwnMessage={message.sender_id === currentUserId}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <MessageInput onSend={handleSend} disabled={sending} />
        </div>
    )
}
