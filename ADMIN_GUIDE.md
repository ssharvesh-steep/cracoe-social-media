# 🛡️ Admin Dashboard Guide

## Accessing the Admin Dashboard

The admin dashboard is located at: **http://localhost:3000/admin**

## Making Yourself an Admin

### Step 1: Create Your Account
1. Go to http://localhost:3000
2. Click "Log In"
3. Click "Sign Up"
4. Create your account with email and password

### Step 2: Grant Admin Access

**Option A: Using SQL (Recommended)**

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/make_admin.sql`
4. Replace `'your-email@example.com'` with your actual email
5. Run the query
6. You should see a success message with your admin user

**Option B: Make First User Admin**

Run this in Supabase SQL Editor:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
    SELECT id FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);
```

**Option C: Make All Users Admin (Testing Only)**

```sql
UPDATE public.profiles
SET is_admin = true;
```

### Step 3: Access Admin Dashboard

1. Refresh your browser or log out and log back in
2. Go to http://localhost:3000/admin
3. You should now see the admin dashboard!

---

## Admin Dashboard Features

### 📊 Users Tab

**View All Users:**
- See all registered users
- View user profiles, IDs, and creation dates
- See admin and banned status

**User Management:**
- **View Details**: Click to see full user profile with stats (posts, followers, following, likes)
- **Make Admin**: Grant admin privileges to any user
- **Remove Admin**: Revoke admin privileges
- **Ban User**: Prevent user from accessing the platform
- **Unban User**: Restore user access

**User Information Displayed:**
- Username and full name
- User ID (with copy button)
- Avatar
- Account creation date
- Admin status
- Ban status
- Bio
- Activity stats

**Search:**
- Search by username
- Search by full name
- Search by user ID

### 📝 Content Tab

**View All Posts:**
- See every post in the system
- View post content, images, and metadata
- See like and comment counts

**Post Management:**
- **View Details**: See full post with all comments
- **Delete Post**: Remove inappropriate content
- View post author information
- See engagement metrics

**Post Information Displayed:**
- Author details
- Post content
- Images (if any)
- Like count
- Comment count
- Creation date
- All comments on the post

**Search:**
- Search by post content
- Search by author name
- Search by author username

### 📈 Analytics Tab

View platform statistics:
- Total users
- Total posts
- Total likes
- Total comments
- Growth trends
- Engagement metrics

### 🗄️ Database Tab

Direct database access and tools:
- View raw database statistics
- Export data
- Database health monitoring

---

## Important Notes

### 🔒 Security

**Passwords:**
- User passwords are **securely hashed** by Supabase Auth
- Passwords **cannot be viewed** in plain text (this is a security best practice)
- Even admins cannot see user passwords
- This protects user privacy and security

**Admin Access:**
- Only users with `is_admin = true` can access the admin dashboard
- Non-admin users are redirected to the home page
- Admin status is checked on every page load

### 👥 User Management Best Practices

**Banning Users:**
- Use ban feature for policy violations
- Banned users cannot access the platform
- Their content remains visible (unless deleted)

**Admin Privileges:**
- Grant admin access carefully
- Admins have full control over users and content
- Consider having multiple admins for larger platforms

### 📊 Data Access

**What You Can See:**
- All user profiles and public information
- All posts and comments
- Engagement metrics (likes, follows)
- User activity statistics

**What You Cannot See:**
- User passwords (hashed by Supabase)
- Private messages (if implemented)
- User's personal Supabase auth data

---

## Troubleshooting

### "Access denied. Admin privileges required."

**Solution:**
1. Make sure you ran the `make_admin.sql` script
2. Verify your user has `is_admin = true` in the profiles table
3. Log out and log back in
4. Clear browser cache if needed

### Can't see admin dashboard

**Check:**
1. Are you logged in?
2. Is your account marked as admin in the database?
3. Are you going to the correct URL? (/admin)

### Users not showing up

**Solution:**
1. Check if users have been created
2. Verify the profiles table has data
3. Check browser console for errors

---

## Database Queries for Admins

### View All Admins
```sql
SELECT 
    p.username,
    p.full_name,
    au.email,
    p.created_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.is_admin = true;
```

### View All Banned Users
```sql
SELECT 
    username,
    full_name,
    created_at
FROM public.profiles
WHERE is_banned = true;
```

### View User Stats
```sql
SELECT 
    p.username,
    COUNT(DISTINCT po.id) as post_count,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT c.id) as comment_count
FROM public.profiles p
LEFT JOIN public.posts po ON po.user_id = p.id
LEFT JOIN public.likes l ON l.user_id = p.id
LEFT JOIN public.comments c ON c.user_id = p.id
GROUP BY p.id, p.username
ORDER BY post_count DESC;
```

### View Most Active Users
```sql
SELECT 
    p.username,
    p.full_name,
    COUNT(po.id) as posts
FROM public.profiles p
LEFT JOIN public.posts po ON po.user_id = p.id
GROUP BY p.id, p.username, p.full_name
ORDER BY posts DESC
LIMIT 10;
```

---

## Quick Reference

| Action | Location | Button |
|--------|----------|--------|
| Make user admin | Users tab | "Make Admin" |
| Remove admin | Users tab | "Remove Admin" |
| Ban user | Users tab | "Ban" |
| Unban user | Users tab | "Unban" |
| View user details | Users tab | "View Details" |
| Delete post | Content tab | "Delete" |
| View post details | Content tab | "View" |

---

**Need Help?**

Check the main [README.md](file:///Users/sharveshs/Project/social%20media/README.md) for general documentation.

---

**Happy Moderating! 🚀**
