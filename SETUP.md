# 🚀 Quick Start Guide

## Important: Node.js Version Requirement

⚠️ **This app requires Node.js 20.9.0 or higher**

Your current version: **Node.js 18.20.8**

### Upgrade Node.js

**Option 1: Using nvm (Recommended)**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20

# Use Node.js 20
nvm use 20

# Set as default
nvm alias default 20
```

**Option 2: Download from nodejs.org**
Visit https://nodejs.org/ and download the LTS version (20+)

---

## Setup Steps

### 1. Upgrade Node.js (see above)

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the database to be ready (~2 minutes)
3. Get your credentials from Project Settings > API

### 4. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run Database Migrations

In your Supabase dashboard, go to SQL Editor and run these scripts **in order**:

#### Step 1: Initial Schema
Copy and paste the contents of `supabase/schema.sql`

This creates:
- ✅ profiles table
- ✅ posts table
- ✅ likes table
- ✅ comments table
- ✅ RLS policies
- ✅ Auto-profile creation trigger

#### Step 2: Extended Features
Copy and paste the contents of `supabase/schema_extensions.sql`

This creates:
- ✅ follows table
- ✅ notifications table
- ✅ bookmarks table
- ✅ conversations & messages tables
- ✅ hashtags tables
- ✅ reposts table
- ✅ Notification triggers
- ✅ Helper functions

### 6. Set Up Storage

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `media`
4. Make it **Public**
5. Click **Save**

Then add these policies in the Storage Policies section:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow public access to view media
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 7. Disable Email Confirmation (Optional, for Testing)

For easier testing, you can disable email confirmation:

1. Go to **Authentication > Providers > Email**
2. Disable **Confirm email**
3. Click **Save**

⚠️ **Re-enable this in production!**

### 8. Run the App

```bash
npm run dev
```

Open http://localhost:3000

---

## First Steps in the App

1. **Sign Up**
   - Click "Log In" in the top right
   - Click "Sign Up"
   - Enter email and password
   - You're automatically logged in!

2. **Create Your First Post**
   - Type in the "What's happening?" box
   - Optionally add an image
   - Click "Post"

3. **Explore Features**
   - Click **Explore** to see trending posts
   - Click **Search** to find users
   - Click **Notifications** to see activity
   - Click your profile icon to view your profile

4. **Follow Users**
   - Search for users or visit the Explore page
   - Click "Follow" on any user
   - Switch to the "Following" tab on the home page to see their posts

---

## Troubleshooting

### "Cannot coerce the result to a single JSON object"
This usually means:
- The database schema isn't set up correctly
- Run the SQL scripts again in order
- Make sure both `schema.sql` and `schema_extensions.sql` are executed

### "Invalid API key"
- Check your `.env.local` file
- Make sure the values match your Supabase project
- Restart the dev server after changing `.env.local`

### "Storage bucket not found"
- Create the `media` bucket in Supabase Storage
- Make sure it's set to public
- Add the storage policies

### Images not uploading
- Check the storage bucket is created
- Verify the storage policies are added
- Check browser console for errors

### Node.js version error
- Upgrade to Node.js 20+ (see top of this guide)
- Run `node --version` to verify

---

## Testing the App

### Create Test Users

1. Sign up with multiple email addresses (you can use temp emails)
2. Or use the same email with `+` tags: `yourname+test1@gmail.com`, `yourname+test2@gmail.com`

### Test Features

- ✅ Create posts with text and images
- ✅ Like and comment on posts
- ✅ Follow other users
- ✅ Check notifications
- ✅ Bookmark posts
- ✅ Search for users and posts
- ✅ Edit your profile

---

## Deployment to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your app will be live in ~2 minutes! 🎉

---

## Need Help?

Check the main [README.md](file:///Users/sharveshs/Project/social%20media/README.md) for detailed documentation.

Review the [walkthrough.md](file:///Users/sharveshs/.gemini/antigravity/brain/e1ec3bb3-395c-45bb-b014-778e35f5693a/walkthrough.md) for a complete feature overview.

---

**Happy coding! 🚀**
