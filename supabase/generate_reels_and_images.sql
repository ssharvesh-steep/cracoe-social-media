-- ============================================
-- GENERATE 50 REELS AND 50 IMAGE POSTS
-- Run this in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
    sample_user_ids uuid[];
    i integer;
    random_user_id uuid;
    
    image_pool text[] := ARRAY[
        'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000'
    ];
    
    video_pool text[] := ARRAY[
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackAds.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    ];
    
    post_contents text[] := ARRAY[
        'Synchronizing with the neural network. 🧠',
        'Intercepting data stream... [SUCCESS] 📡',
        'The future is here, it''s just not evenly distributed. 🌌',
        'Neon dreams and silicon reality. 🌃',
        'Compiling the next revolution. ⌨️',
        'Zero latency detected. Perfect signal. 📶',
        'Encryption keys deployed. Secure transmission active. 🔐',
        'Exploring the digital frontier. 🚀',
        'System override in progress... ⚠️',
        'Glitch in the matrix detected. 🧩'
    ];

BEGIN
    -- Step 1: Remove existing reels to avoid duplicates/dead links
    DELETE FROM public.posts WHERE type = 'reel';
    RAISE NOTICE 'Cleared existing reels';

    -- Get sample user IDs
    SELECT ARRAY_AGG(id) INTO sample_user_ids FROM public.profiles;
    
    IF ARRAY_LENGTH(sample_user_ids, 1) = 0 THEN
        RAISE EXCEPTION 'No users found in public.profiles. Run generate_sample_data.sql first.';
    END IF;

    -- Generate 50 Image Posts
    FOR i IN 1..50 LOOP
        random_user_id := sample_user_ids[1 + floor(random() * ARRAY_LENGTH(sample_user_ids, 1))::int];
        
        INSERT INTO public.posts (user_id, content, image_url, type, created_at)
        VALUES (
            random_user_id,
            post_contents[1 + floor(random() * 10)::int] || ' (Image #' || i || ')',
            image_pool[1 + floor(random() * 10)::int],
            'image',
            NOW() - (random() * interval '30 days')
        );
    END LOOP;

    -- Generate 100 Reels (Video Posts)
    FOR i IN 1..100 LOOP
        random_user_id := sample_user_ids[1 + floor(random() * ARRAY_LENGTH(sample_user_ids, 1))::int];
        
        INSERT INTO public.posts (user_id, content, image_url, type, created_at)
        VALUES (
            random_user_id,
            post_contents[1 + floor(random() * 10)::int] || ' (Reel #' || i || ')',
            video_pool[1 + floor(random() * 10)::int],
            'reel',
            NOW() - (random() * interval '30 days')
        );
    END LOOP;

    RAISE NOTICE 'Created 50 image posts and 100 reels';

END $$;

SELECT 
    type,
    count(*) 
FROM public.posts 
GROUP BY type;
