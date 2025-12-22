'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Search } from 'lucide-react'
import {
    Conversation,
    getUserConversations,
    subscribeToConversations
} from '@/utils/messaging'

interface ConversationListProps {
    currentUserId: string
    selectedConversationId?: string
    onSelectConversation: (conversation: Conversation) => void
}

export default function ConversationList({
    currentUserId,
    selectedConversationId,
    onSelectConversation
}: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Load conversations
    useEffect(() => {
        const loadConversations = async () => {
            setLoading(true)
            const convs = await getUserConversations(currentUserId)
            setConversations(convs)
            setLoading(false)
        }

        loadConversations()
    }, [currentUserId])

    // Subscribe to conversation updates
    useEffect(() => {
        const subscription = subscribeToConversations(currentUserId, async () => {
            const convs = await getUserConversations(currentUserId)
            setConversations(convs)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [currentUserId])

    // Get the other participant in a conversation
    const getOtherUser = (conversation: Conversation) => {
        if (conversation.participant_1_id === currentUserId) {
            return conversation.participant_2
        }
        return conversation.participant_1
    }

    // Filter conversations by search query
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true
        const otherUser = getOtherUser(conv)
        const searchLower = searchQuery.toLowerCase()
        return (
            otherUser?.username?.toLowerCase().includes(searchLower) ||
            otherUser?.full_name?.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="flex flex-col h-full bg-background border-r border-border-color">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-border-color">
                <div className="px-4 py-5">
                    <h1 className="text-xl font-black uppercase tracking-[0.15em] text-foreground mb-4">
                        Messages
                    </h1>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-border-color focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-12 pr-4 transition-all uppercase text-[11px] font-black tracking-widest placeholder-slate-300 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-xl animate-spin" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                        <div className="w-16 h-16 bg-surface border border-border-color rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="text-2xl">💬</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-foreground mb-2">
                            {searchQuery ? 'No Results' : 'No Messages'}
                        </h3>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Start a conversation from a user profile'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border-color">
                        {filteredConversations.map((conversation) => {
                            const otherUser = getOtherUser(conversation)
                            if (!otherUser) return null

                            const isSelected = conversation.id === selectedConversationId
                            const isUnread = conversation.last_message_sender_id !== currentUserId

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className={`w-full px-4 py-4 flex items-start gap-3 hover:bg-surface transition-all text-left ${isSelected ? 'bg-surface border-l-2 border-primary' : ''
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="w-12 h-12 rounded-xl bg-background border border-border-color flex items-center justify-center text-primary font-black text-sm shadow-sm">
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
                                        {isUnread && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2 mb-1">
                                            <h3 className={`font-black text-sm uppercase tracking-tight truncate ${isUnread ? 'text-foreground' : 'text-slate-600'
                                                }`}>
                                                {otherUser.full_name || otherUser.username}
                                            </h3>
                                            {conversation.last_message_at && (
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                                                    {formatDistanceToNow(new Date(conversation.last_message_at), {
                                                        addSuffix: false
                                                    })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-slate-400 text-[10px] font-bold mb-1 truncate">
                                            @{otherUser.username}
                                        </p>

                                        {conversation.last_message_content && (
                                            <p className={`text-xs truncate ${isUnread ? 'font-bold text-foreground' : 'text-slate-500'
                                                }`}>
                                                {conversation.last_message_sender_id === currentUserId && 'You: '}
                                                {conversation.last_message_content}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
