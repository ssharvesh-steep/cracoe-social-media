-- Migration to add reel support to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS type text DEFAULT 'image' CHECK (type IN ('image', 'reel'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Update existing reels (if any)
-- This is just a placeholder in case the user wants to identify existing videos
-- UPDATE public.posts SET type = 'reel' WHERE image_url LIKE '%.mp4' OR image_url LIKE '%.mov';

COMMENT ON COLUMN public.posts.type IS 'Type of content: image or reel';
COMMENT ON COLUMN public.posts.thumbnail_url IS 'Thumbnail URL for video content (reels)';
