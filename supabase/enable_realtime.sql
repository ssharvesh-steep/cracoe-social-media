-- Enable Realtime for messaging tables
-- This ensures that the frontend receives 'postgres_changes' events

-- Add tables to the supabase_realtime publication
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.messages, public.conversations, public.notifications;
commit;

-- Verify
select * from pg_publication_tables where pubname = 'supabase_realtime';
