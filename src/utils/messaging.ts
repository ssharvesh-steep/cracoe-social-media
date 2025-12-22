import { supabase } from './supabase/client'

export interface Message {
    id: string
    created_at: string
    conversation_id: string
    sender_id: string
    content: string
    is_read: boolean
    read_at: string | null
    sender?: {
        id: string
        username: string
        full_name: string
        avatar_url: string
    }
}

export interface Conversation {
    id: string
    created_at: string
    updated_at: string
    participant_1_id: string
    participant_2_id: string
    last_message_at: string
    last_message_content: string | null
    last_message_sender_id: string | null
    participant_1?: {
        id: string
        username: string
        full_name: string
        avatar_url: string
    }
    participant_2?: {
        id: string
        username: string
        full_name: string
        avatar_url: string
    }
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
        const { data, error } = await supabase.rpc('get_or_create_conversation', {
            user1_id: userId1,
            user2_id: userId2
        })

        if (error) throw error
        return data
    } catch (error: any) {
        console.error('Error getting/creating conversation:', error?.message || error)
        return null
    }
}

/**
 * Get all conversations for the current user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
        *,
        participant_1:participant_1_id(id, username, full_name, avatar_url),
        participant_2:participant_2_id(id, username, full_name, avatar_url)
      `)
            .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error: any) {
        console.error('Error fetching conversations:', error?.message || error)
        return []
    }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        sender:sender_id(id, username, full_name, avatar_url)
      `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error: any) {
        console.error('Error fetching messages:', error?.message || error)
        return []
    }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content: content.trim()
            })
            .select(`
        *,
        sender:sender_id(id, username, full_name, avatar_url)
      `)
            .single()

        if (error) throw error
        return data
    } catch (error: any) {
        console.error('Error sending message:', error?.message || error)
        return null
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('messages')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .eq('is_read', false)

        if (error) throw error
    } catch (error: any) {
        console.error('Error marking messages as read:', error?.message || error)
    }
}

/**
 * Get unread message count for user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        // Get all conversations for the user
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)

        if (convError) throw convError
        if (!conversations || conversations.length === 0) return 0

        const conversationIds = conversations.map(c => c.id)

        // Count unread messages in those conversations that user didn't send
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .neq('sender_id', userId)
            .eq('is_read', false)

        if (error) throw error
        return count || 0
    } catch (error: any) {
        console.error('Error getting unread count:', error?.message || error)
        return 0
    }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
) {
    const subscription = supabase
        .channel(`messages:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            },
            async (payload) => {
                // Fetch the complete message with sender info
                const { data } = await supabase
                    .from('messages')
                    .select(`
            *,
            sender:sender_id(id, username, full_name, avatar_url)
          `)
                    .eq('id', payload.new.id)
                    .single()

                if (data) {
                    onMessage(data)
                }
            }
        )
        .subscribe()

    return subscription
}

/**
 * Subscribe to conversation updates (for conversation list)
 */
export function subscribeToConversations(
    userId: string,
    onUpdate: () => void
) {
    const subscription = supabase
        .channel(`conversations:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversations'
            },
            () => {
                onUpdate()
            }
        )
        .subscribe()

    return subscription
}
