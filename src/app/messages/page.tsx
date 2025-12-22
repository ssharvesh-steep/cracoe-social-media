'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import ConversationList from '@/components/ConversationList'
import ChatWindow from '@/components/ChatWindow'
import { Conversation } from '@/utils/messaging'

export default function MessagesPage() {
    const [session, setSession] = useState<any>(null)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [showChat, setShowChat] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login')
            } else {
                setSession(session)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login')
            } else {
                setSession(session)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    // Handle conversation selection
    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation)
        setShowChat(true)
    }

    // Handle back to list on mobile
    const handleBack = () => {
        setShowChat(false)
        setSelectedConversation(null)
    }

    // Get other user from conversation
    const getOtherUser = (conversation: Conversation) => {
        if (!session) return null

        if (conversation.participant_1_id === session.user.id) {
            return conversation.participant_2
        }
        return conversation.participant_1
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-xl animate-spin" />
            </div>
        )
    }

    const otherUser = selectedConversation ? getOtherUser(selectedConversation) : null

    return (
        <div className="flex justify-center min-h-screen bg-background">
            <main className="w-full max-w-[1200px] min-h-screen border-x border-border-color bg-background relative mb-20 md:mb-0">
                <div className="flex h-screen">
                    {/* Conversation List - Hidden on mobile when chat is open */}
                    <div className={`w-full lg:w-[380px] lg:flex-shrink-0 ${showChat ? 'hidden lg:block' : 'block'
                        }`}>
                        <ConversationList
                            currentUserId={session.user.id}
                            selectedConversationId={selectedConversation?.id}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>

                    {/* Chat Window - Hidden on mobile when no conversation selected */}
                    <div className={`flex-1 ${showChat ? 'block' : 'hidden lg:block'
                        }`}>
                        {selectedConversation && otherUser ? (
                            <ChatWindow
                                conversationId={selectedConversation.id}
                                otherUser={otherUser}
                                currentUserId={session.user.id}
                                onBack={handleBack}
                            />
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center h-full bg-background px-8 text-center">
                                <div className="w-20 h-20 bg-surface border border-border-color rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <span className="text-3xl">💬</span>
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-widest text-foreground mb-3">
                                    Select a Message
                                </h2>
                                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest max-w-[320px] leading-relaxed">
                                    Choose a conversation from the list to start messaging
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
