-- ============================================
-- GENERATE SAMPLE DATA (SIMPLIFIED VERSION)
-- This version works without creating auth users
-- Run this in Supabase SQL Editor
-- ============================================

-- IMPORTANT: This script temporarily disables the foreign key constraint
-- to allow creating sample profiles for testing purposes.

-- Step 1: Temporarily disable the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Generate sample profiles
DO $$
DECLARE
    sample_user_ids uuid[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    
    usernames text[] := ARRAY[
        'alex_tech', 'sarah_designs', 'mike_photos', 'emma_travels', 'john_fitness',
        'lisa_foodie', 'david_music', 'anna_art', 'chris_gaming', 'maria_books',
        'tom_sports', 'julia_fashion', 'ryan_coding', 'sophie_yoga', 'kevin_chef',
        'nina_dance', 'paul_writer', 'olivia_pets', 'mark_cars', 'lucy_plants',
        'daniel_tech', 'amy_beauty', 'steve_outdoor', 'kate_movies', 'brian_coffee',
        'rachel_wellness', 'jason_business', 'megan_diy', 'tyler_skate', 'hannah_baking',
        'eric_photography', 'jessica_lifestyle', 'adam_entrepreneur', 'laura_mindfulness', 'sean_gamer',
        'natalie_vegan', 'derek_fitness', 'chloe_fashion', 'marcus_tech', 'emily_artist',
        'jordan_athlete', 'samantha_blogger', 'nathan_developer', 'victoria_designer', 'austin_musician',
        'grace_writer', 'blake_adventurer', 'madison_foodie', 'connor_streamer', 'zoe_creative'
    ];
    
    full_names text[] := ARRAY[
        'Alex Thompson', 'Sarah Martinez', 'Mike Johnson', 'Emma Davis', 'John Wilson',
        'Lisa Anderson', 'David Brown', 'Anna Garcia', 'Chris Miller', 'Maria Rodriguez',
        'Tom Taylor', 'Julia Moore', 'Ryan Jackson', 'Sophie White', 'Kevin Harris',
        'Nina Martin', 'Paul Thompson', 'Olivia Lee', 'Mark Walker', 'Lucy Hall',
        'Daniel Allen', 'Amy Young', 'Steve King', 'Kate Wright', 'Brian Lopez',
        'Rachel Hill', 'Jason Scott', 'Megan Green', 'Tyler Adams', 'Hannah Baker',
        'Eric Nelson', 'Jessica Carter', 'Adam Mitchell', 'Laura Perez', 'Sean Roberts',
        'Natalie Turner', 'Derek Phillips', 'Chloe Campbell', 'Marcus Parker', 'Emily Evans',
        'Jordan Edwards', 'Samantha Collins', 'Nathan Stewart', 'Victoria Morris', 'Austin Rogers',
        'Grace Reed', 'Blake Cook', 'Madison Bell', 'Connor Murphy', 'Zoe Rivera'
    ];
    
    bios text[] := ARRAY[
        'Tech enthusiast | Building the future 🚀',
        'Designer | Creating beautiful experiences ✨',
        'Photographer | Capturing moments 📸',
        'Travel blogger | Exploring the world 🌍',
        'Fitness coach | Transform your life 💪',
        'Food lover | Sharing recipes 🍳',
        'Musician | Making melodies 🎵',
        'Artist | Painting dreams 🎨',
        'Gamer | Streaming daily 🎮',
        'Bookworm | Reading everything 📚',
        'Sports fan | Living the game ⚽',
        'Fashion designer | Style is everything 👗',
        'Developer | Coding magic ⌨️',
        'Yoga instructor | Find your zen 🧘',
        'Chef | Culinary adventures 👨‍🍳',
        'Dancer | Moving to the rhythm 💃',
        'Writer | Telling stories ✍️',
        'Pet lover | Dogs are life 🐕',
        'Car enthusiast | Speed and style 🏎️',
        'Plant parent | Green thumb 🌱',
        'Tech reviewer | Latest gadgets 📱',
        'Beauty guru | Makeup tutorials 💄',
        'Outdoor adventurer | Nature calls 🏔️',
        'Movie buff | Cinema lover 🎬',
        'Coffee addict | Espresso life ☕',
        'Wellness coach | Healthy living 🌿',
        'Entrepreneur | Building dreams 💼',
        'DIY creator | Handmade everything 🔨',
        'Skateboarder | Street life 🛹',
        'Baker | Sweet treats 🧁',
        'Photographer | Visual storyteller 📷',
        'Lifestyle blogger | Daily inspiration ✨',
        'Startup founder | Innovation first 🚀',
        'Mindfulness coach | Present moment 🙏',
        'Pro gamer | Esports life 🎯',
        'Vegan chef | Plant-based cooking 🥗',
        'Personal trainer | Get fit 🏋️',
        'Fashion influencer | Trendsetter 👠',
        'Software engineer | Code & coffee 💻',
        'Digital artist | Creating worlds 🎨',
        'Athlete | Never give up 🏃',
        'Content creator | Sharing life 📹',
        'Full-stack dev | Building apps 🔧',
        'UX designer | User-first 🎯',
        'Music producer | Beats & vibes 🎧',
        'Creative writer | Words matter 📖',
        'Adventure seeker | Live wild 🌲',
        'Food photographer | Delicious shots 🍕',
        'Live streamer | Join the fun 🎥',
        'Creative director | Vision & art 🎭'
    ];
    
    i integer;
    random_user_id uuid;
    random_post_id uuid;
BEGIN
    -- Insert sample profiles
    FOR i IN 1..50 LOOP
        INSERT INTO public.profiles (id, username, full_name, bio, created_at, is_admin, is_banned)
        VALUES (
            sample_user_ids[i],
            usernames[i],
            full_names[i],
            bios[i],
            NOW() - (random() * interval '90 days'),
            false,
            false
        );
    END LOOP;
    
    RAISE NOTICE 'Created 50 sample users';
    
    -- Insert sample posts (3-5 posts per user)
    FOR i IN 1..50 LOOP
        -- Post 1
        INSERT INTO public.posts (user_id, content, created_at)
        VALUES (
            sample_user_ids[i],
            CASE (i % 10)
                WHEN 0 THEN 'Just launched my new project! So excited to share this with you all. What do you think? 🚀'
                WHEN 1 THEN 'Beautiful sunset today. Sometimes you just need to stop and appreciate the little things in life. 🌅'
                WHEN 2 THEN 'Working on something amazing! Can''t wait to reveal it soon. Stay tuned! ✨'
                WHEN 3 THEN 'Had the best coffee today at this new cafe downtown. Highly recommend! ☕'
                WHEN 4 THEN 'Finished reading an incredible book. Anyone else love getting lost in a good story? 📚'
                WHEN 5 THEN 'New workout routine is killing it! Feeling stronger every day. 💪'
                WHEN 6 THEN 'Just tried this new recipe and it turned out amazing! Who wants the recipe? 🍳'
                WHEN 7 THEN 'Exploring new places and meeting amazing people. Travel really does broaden the mind. 🌍'
                WHEN 8 THEN 'Late night coding session. There''s something magical about solving problems at 2 AM. 💻'
                ELSE 'Great day today! Feeling grateful for all the amazing people in my life. ❤️'
            END,
            NOW() - (random() * interval '30 days')
        );
        
        -- Post 2
        INSERT INTO public.posts (user_id, content, created_at)
        VALUES (
            sample_user_ids[i],
            CASE (i % 8)
                WHEN 0 THEN 'Monday motivation: You are capable of amazing things! Let''s make this week count. 🎯'
                WHEN 1 THEN 'Just finished an amazing workout. Feeling energized and ready to take on the day! 🏃'
                WHEN 2 THEN 'Trying out new techniques today. Learning never stops! 📖'
                WHEN 3 THEN 'Weekend vibes! Time to relax and recharge. What are your plans? 🌴'
                WHEN 4 THEN 'Grateful for another beautiful day. Count your blessings! 🙏'
                WHEN 5 THEN 'New blog post is live! Check it out and let me know what you think. 📝'
                WHEN 6 THEN 'Coffee and creativity - the perfect combination for a productive morning. ☕'
                ELSE 'Sunset chasing and good vibes. Life is beautiful! 🌅'
            END,
            NOW() - (random() * interval '25 days')
        );
        
        -- Post 3
        INSERT INTO public.posts (user_id, content, created_at)
        VALUES (
            sample_user_ids[i],
            CASE (i % 7)
                WHEN 0 THEN 'Throwback to this amazing moment! Good times. 📸'
                WHEN 1 THEN 'Learning something new every day. Growth mindset! 🌱'
                WHEN 2 THEN 'Friday feeling! Who else is ready for the weekend? 🎉'
                WHEN 3 THEN 'Just hit a new milestone! Thank you all for the support. 🎊'
                WHEN 4 THEN 'Nature walk today. Fresh air and clear mind. 🌲'
                WHEN 5 THEN 'Trying something completely new today. Stepping out of my comfort zone! 🚀'
                ELSE 'Good food, good mood. Simple pleasures in life. 🍕'
            END,
            NOW() - (random() * interval '20 days')
        );
        
        -- Post 4 (for some users)
        IF i % 2 = 0 THEN
            INSERT INTO public.posts (user_id, content, created_at)
            VALUES (
                sample_user_ids[i],
                'Behind the scenes of today''s project. The process is just as important as the result! 🎬',
                NOW() - (random() * interval '15 days')
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Created sample posts';
    
    -- Create some follows
    FOR i IN 1..50 LOOP
        FOR j IN 1..7 LOOP
            random_user_id := sample_user_ids[1 + floor(random() * 50)::int];
            IF random_user_id != sample_user_ids[i] THEN
                INSERT INTO public.follows (follower_id, following_id)
                VALUES (sample_user_ids[i], random_user_id)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Created sample follows';
    
    -- Create some likes
    FOR i IN 1..200 LOOP
        random_user_id := sample_user_ids[1 + floor(random() * 50)::int];
        SELECT id INTO random_post_id FROM public.posts ORDER BY random() LIMIT 1;
        
        INSERT INTO public.likes (user_id, post_id)
        VALUES (random_user_id, random_post_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Created sample likes';
    
    -- Create some comments
    FOR i IN 1..100 LOOP
        random_user_id := sample_user_ids[1 + floor(random() * 50)::int];
        SELECT id INTO random_post_id FROM public.posts ORDER BY random() LIMIT 1;
        
        INSERT INTO public.comments (user_id, post_id, content)
        VALUES (
            random_user_id,
            random_post_id,
            (ARRAY[
                'This is amazing! 🔥',
                'Love this! ❤️',
                'Great post! 👏',
                'So inspiring! ✨',
                'Totally agree! 💯',
                'This is exactly what I needed to see today!',
                'Keep up the great work! 🚀',
                'Wow, this is incredible!',
                'Thanks for sharing! 🙏',
                'Can''t wait to see more!'
            ])[1 + floor(random() * 10)::int]
        );
    END LOOP;
    
    RAISE NOTICE 'Created sample comments';
    
END $$;

-- Step 3: Re-enable the foreign key constraint (optional - only if you want to enforce it later)
-- Uncomment this line if you want to re-add the constraint:
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Display summary
SELECT 
    '✅ Sample data created successfully!' as status,
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.posts) as total_posts,
    (SELECT COUNT(*) FROM public.follows) as total_follows,
    (SELECT COUNT(*) FROM public.likes) as total_likes,
    (SELECT COUNT(*) FROM public.comments) as total_comments;

-- Show some sample users
SELECT 
    username,
    full_name,
    LEFT(bio, 50) as bio_preview
FROM public.profiles
WHERE username LIKE '%_tech' OR username LIKE '%_designs' OR username LIKE '%_photos'
ORDER BY created_at DESC
LIMIT 10;
