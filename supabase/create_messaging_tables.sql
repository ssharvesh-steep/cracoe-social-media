-- ============================================
-- CREATE ONLY MESSAGING TABLES
-- Run this if follows/notifications/bookmarks already exist
-- ============================================

-- 1. CREATE CONVERSATIONS TABLE (for messaging)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  participant_1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_content text,
  last_message_sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
);

-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- 2. CREATE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  read_at timestamp with time zone,
  
  CONSTRAINT content_not_empty CHECK (char_length(content) > 0)
);

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
CREATE POLICY "Users can update messages in their conversations" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;

-- 3. CREATE TRIGGER TO UPDATE CONVERSATION ON NEW MESSAGE
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    updated_at = NEW.created_at,
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    last_message_sender_id = NEW.sender_id
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- 4. CREATE FUNCTION TO GET OR CREATE CONVERSATION
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  user1_id uuid,
  user2_id uuid
)
RETURNS uuid AS $$
DECLARE
  conversation_id uuid;
  min_id uuid;
  max_id uuid;
BEGIN
  -- Ensure consistent ordering of participant IDs
  IF user1_id < user2_id THEN
    min_id := user1_id;
    max_id := user2_id;
  ELSE
    min_id := user2_id;
    max_id := user1_id;
  END IF;
  
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE participant_1_id = min_id AND participant_2_id = max_id;
  
  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (min_id, max_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Messaging tables created successfully! ✅' AS status;

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages')
ORDER BY table_name;
