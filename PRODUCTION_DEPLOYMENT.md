# 🚀 Production Deployment Checklist for Messaging Feature

## ✅ Completed
- [x] Code pushed to GitHub (commit: bab5c7d)
- [x] GitHub connected to Vercel

## 📋 Required Steps

### 1. Verify Vercel Deployment

**Check if Vercel is building:**
1. Go to https://vercel.com/dashboard
2. Find your project (cracoe-social-media)
3. Check the "Deployments" tab
4. You should see a new deployment in progress or completed

**If deployment is not triggered:**
- Vercel should auto-deploy when you push to `main` branch
- If not, click "Redeploy" on the latest deployment
- Or manually trigger: `Deploy` → `Redeploy`

### 2. Set Up Production Database Tables

**CRITICAL**: The messaging feature won't work until you create the tables in your **production** Supabase database.

**Steps:**
1. Go to your **production** Supabase project dashboard (not local)
2. Navigate to: **SQL Editor**
3. Run this SQL file: `supabase/create_messaging_tables.sql`

**Copy this SQL and run it in Supabase SQL Editor:**

```sql
-- Run this in your PRODUCTION Supabase SQL Editor

-- 1. CREATE CONVERSATIONS TABLE
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

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

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

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;

-- 3. CREATE TRIGGER
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

-- 4. CREATE FUNCTION
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
  IF user1_id < user2_id THEN
    min_id := user1_id;
    max_id := user2_id;
  ELSE
    min_id := user2_id;
    max_id := user1_id;
  END IF;
  
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE participant_1_id = min_id AND participant_2_id = max_id;
  
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (min_id, max_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Messaging tables created successfully! ✅' AS status;
```

### 3. Verify Deployment

After Vercel finishes deploying and you've run the SQL:

1. Visit your production URL (e.g., `your-app.vercel.app`)
2. Log in to your account
3. Check if "Messages" tab appears in navigation
4. Visit a user profile - you should see "MESSAGE" button
5. Click it and try sending a message

### 4. Troubleshooting

**If Messages tab doesn't appear:**
- Clear browser cache and hard refresh (Cmd+Shift+R)
- Check Vercel deployment logs for errors
- Verify environment variables are set in Vercel

**If you get database errors:**
- Make sure you ran the SQL in the **production** Supabase (not local)
- Check Supabase logs for any SQL errors
- Verify the `follows` table exists (run `check_tables.sql`)

**If Vercel isn't deploying:**
- Check GitHub webhook is connected
- Manually trigger deployment from Vercel dashboard
- Check build logs for errors

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/ssharvesh-steep/cracoe-social-media

---

## Summary

✅ Code is in GitHub  
⏳ Waiting for Vercel to deploy  
❌ Production database tables not created yet  

**Next Action**: Run the SQL above in your production Supabase SQL Editor!
