# 🚀 Complete Social Media App

A modern, feature-rich social media application built with Next.js 14, Supabase, and TypeScript. This app includes all essential social media features with a premium, responsive UI.

![Social Media App](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔐 Authentication
- Email/Password signup and login
- GitHub OAuth integration
- Secure session management
- Protected routes

### 👥 Social Features
- **Follow System**: Follow/unfollow users with real-time counts
- **Feed Tabs**: Switch between "For You" and "Following" feeds
- **User Profiles**: Customizable profiles with bio, avatar, and stats
- **Posts**: Create posts with text and images
- **Interactions**: Like, comment, and bookmark posts
- **Real-time Updates**: Live post updates using Supabase subscriptions
- **Direct Messaging**: 1-to-1 messaging with real-time delivery and read receipts

### 🔔 Notifications
- Real-time notifications for:
  - New followers
  - Post likes
  - Comments
  - Reposts
- Notification bell with unread count badge
- Mark as read functionality
- Filter by all/unread

### 🔍 Discovery
- **Search**: Find users and posts with debounced search
- **Explore Page**: Discover trending posts and suggested users
- **Trending Algorithm**: Posts ranked by engagement
- **User Suggestions**: Recommended users based on follower count

### 💾 Bookmarks
- Save posts for later
- Dedicated bookmarks page
- Quick bookmark toggle on posts

### 🎨 Premium UI/UX
- **Responsive Design**: Optimized for mobile and desktop
- **Desktop Sidebar**: Full navigation with gradient logo
- **Mobile Bottom Nav**: Touch-friendly navigation with active states
- **Loading Skeletons**: Smooth loading states
- **Toast Notifications**: Beautiful success/error messages
- **Character Counter**: Visual feedback for post length
- **Gradient Buttons**: Modern, eye-catching CTAs
- **Smooth Animations**: Polished transitions throughout

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- A Supabase account

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd social-media
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the SQL scripts in order in your Supabase SQL Editor:

1. **Initial Schema**: `supabase/schema.sql`
   - Creates profiles, posts, likes, and comments tables
   - Sets up Row Level Security (RLS) policies
   - Creates triggers for auto-profile creation

2. **Schema Extensions**: `supabase/schema_extensions.sql`
   - Adds follows, notifications, bookmarks tables
   - Creates hashtags and reposts tables
   - Adds notification triggers

3. **Messaging Tables**: `supabase/create_messaging_tables.sql`
   - Creates conversations and messages tables for 1-to-1 messaging
   - Sets up real-time messaging with read receipts
   - Adds helper functions for conversation management

### 5. Set up Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `media`
3. Set it to **public**
4. Add the following policy for authenticated uploads:

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
```

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 📱 Usage

### First Steps
1. **Sign Up**: Create an account using email/password or GitHub
2. **Complete Profile**: Add a bio and avatar (optional)
3. **Create Posts**: Share your thoughts with text and images
4. **Follow Users**: Discover and follow other users
5. **Engage**: Like, comment, and bookmark posts

### Navigation
- **Home**: View all posts or posts from people you follow
- **Messages**: Send and receive direct messages with real-time updates
- **Explore**: Discover trending content and suggested users
- **Search**: Find specific users or posts
- **Notifications**: See all your activity
- **Bookmarks**: Access your saved posts
- **Profile**: View and edit your profile

## 🗂️ Project Structure

```
social-media/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Home feed
│   │   ├── login/             # Authentication
│   │   ├── u/[username]/      # User profiles
│   │   ├── messages/          # Direct messaging
│   │   ├── notifications/     # Notifications page
│   │   ├── bookmarks/         # Bookmarks page
│   │   ├── search/            # Search page
│   │   ├── explore/           # Explore page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── Navbar.tsx         # Desktop sidebar
│   │   ├── BottomNav.tsx      # Mobile navigation
│   │   ├── PostCard.tsx       # Post display
│   │   ├── ComposePost.tsx    # Create posts
│   │   ├── FollowButton.tsx   # Follow/unfollow
│   │   ├── MessageBubble.tsx  # Message display
│   │   ├── MessageInput.tsx   # Message composer
│   │   ├── ChatWindow.tsx     # Chat interface
│   │   ├── ConversationList.tsx # Message list
│   │   ├── NotificationBell.tsx
│   │   ├── Toast.tsx          # Notifications
│   │   └── LoadingSkeleton.tsx
│   └── utils/
│       ├── supabase/
│       │   └── client.ts      # Supabase client
│       └── messaging.ts       # Messaging utilities
├── supabase/                  # Database schemas
│   ├── schema.sql            # Initial schema
│   ├── schema_extensions.sql # Extended schema
│   └── create_messaging_tables.sql # Messaging tables
└── public/                    # Static assets
```

## 🔒 Security

- **Row Level Security (RLS)**: All tables have RLS policies
- **Authentication Required**: Most actions require login
- **User Isolation**: Users can only modify their own data
- **Secure Storage**: Images stored in Supabase Storage with proper policies

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Database Migrations

When deploying to production:
1. Run the same SQL scripts in your production Supabase project
2. Ensure storage bucket is created and configured
3. Test authentication flows

## 🎯 Future Enhancements

- [x] Direct messaging system ✅
- [ ] Hashtag support with clickable tags
- [ ] User mentions (@username)
- [ ] Repost/share functionality
- [ ] Dark mode toggle
- [ ] Emoji picker
- [ ] Rich text editor
- [ ] Infinite scroll
- [ ] Image optimization
- [ ] Video support
- [ ] Stories feature
- [ ] Advanced analytics
- [ ] Group messaging
- [ ] Voice/video calls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and Auth by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

---

**Made with ❤️ by the community**
