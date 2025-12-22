-- Quick check: Run this to see which tables are missing
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follows') 
    THEN '✅ follows exists'
    ELSE '❌ follows MISSING - run setup_all_tables.sql'
  END as follows_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') 
    THEN '✅ notifications exists'
    ELSE '❌ notifications MISSING - run setup_all_tables.sql'
  END as notifications_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookmarks') 
    THEN '✅ bookmarks exists'
    ELSE '❌ bookmarks MISSING - run setup_all_tables.sql'
  END as bookmarks_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') 
    THEN '✅ conversations exists'
    ELSE '❌ conversations MISSING - run setup_all_tables.sql'
  END as conversations_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') 
    THEN '✅ messages exists'
    ELSE '❌ messages MISSING - run setup_all_tables.sql'
  END as messages_status;
