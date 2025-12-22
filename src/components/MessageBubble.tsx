'use client'

import { formatDistanceToNow } from 'date-fns'
import { Message } from '@/utils/messaging'

interface MessageBubbleProps {
    message: Message
    isOwnMessage: boolean
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-3 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isOwnMessage && message.sender && (
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-surface border border-border-color flex items-center justify-center text-primary font-black text-xs shadow-sm">
                            {message.sender.avatar_url ? (
                                <img
                                    src={message.sender.avatar_url}
                                    alt={message.sender.username}
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            ) : (
                                message.sender.username?.[0]?.toUpperCase() || '?'
                            )}
                        </div>
                    </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {!isOwnMessage && message.sender && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                            {message.sender.username}
                        </span>
                    )}

                    <div
                        className={`px-4 py-3 rounded-2xl ${isOwnMessage
                                ? 'bg-primary text-white rounded-br-md'
                                : 'bg-surface border border-border-color text-foreground rounded-bl-md shadow-sm'
                            }`}
                    >
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {message.content}
                        </p>
                    </div>

                    {/* Timestamp and Read Status */}
                    <div className={`flex items-center gap-2 mt-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        {isOwnMessage && (
                            <span className="text-[9px] font-bold text-slate-400">
                                {message.is_read ? '✓✓' : '✓'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
