# 🔐 Admin Account Details

## Default Admin Account

I've set up a default admin account for you to use:

### Login Credentials

```
Email:    sharveshadmin@gmail.com
Username: Sharveshadmin
Password: 9843147333
```

### Access URLs

- **Login Page**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin
- **Home Page**: http://localhost:3000

---

## How to Set Up the Admin Account

### Step 1: Create the User in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** (or **"Invite"**)
4. Enter the credentials:
   - **Email**: `sharveshadmin@gmail.com`
   - **Password**: `9843147333`
   - **Auto Confirm User**: ✅ (check this box)
5. Click **"Create User"** or **"Send Invitation"**

### Step 2: Grant Admin Privileges

1. Go to **SQL Editor** in Supabase
2. Copy and paste this SQL:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'sharveshadmin@gmail.com'
    LIMIT 1
);
```

3. Click **"Run"**
4. You should see "Success. No rows returned"

### Step 3: Verify Admin Access

Run this query to verify:

```sql
SELECT 
    p.username,
    au.email,
    p.is_admin
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email = 'sharveshadmin@gmail.com';
```

You should see:
- `is_admin: true`

---

## Alternative: Make YOUR Account Admin

If you prefer to use your own account as admin:

### Option 1: By Email

```sql
-- Replace with YOUR email
UPDATE public.profiles
SET is_admin = true
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'
    LIMIT 1
);
```

### Option 2: Make First User Admin

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
    SELECT id FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);
```

### Option 3: Make ALL Users Admin (Testing Only)

```sql
UPDATE public.profiles
SET is_admin = true;
```

---

## Logging In

1. Open http://localhost:3000
2. Click **"Log In"** in the top right
3. Enter credentials:
   - Email: `sharveshadmin@gmail.com`
   - Password: `9843147333`
4. Click **"Log In"**

---

## Accessing Admin Dashboard

Once logged in:

1. Go to http://localhost:3000/admin
2. You'll see the admin dashboard with 4 tabs:
   - **Users**: View and manage all users
   - **Content**: View and moderate all posts
   - **Analytics**: Platform statistics
   - **Database**: Database tools

---

## What You Can Do as Admin

### User Management
- ✅ View all user profiles
- ✅ See user IDs and details
- ✅ View user stats (posts, followers, following, likes)
- ✅ Make users admin
- ✅ Remove admin privileges
- ✅ Ban users
- ✅ Unban users
- ✅ Search users

### Content Moderation
- ✅ View all posts
- ✅ See post content and images
- ✅ View all comments on posts
- ✅ Delete inappropriate posts
- ✅ See engagement metrics
- ✅ Search posts

### Important Notes
- ❌ **Cannot view passwords** (they are securely hashed)
- ✅ Can see user IDs (for database queries)
- ✅ Can see all public user information
- ✅ Full control over content and users

---

## Security Notes

### Password Security
- User passwords are **encrypted/hashed** by Supabase
- Even admins **cannot see** user passwords
- This is a **security best practice**
- Passwords are stored using bcrypt hashing

### Admin Access
- Only users with `is_admin = true` can access `/admin`
- Non-admin users are automatically redirected
- Admin status is verified on every page load

---

## Troubleshooting

### "Access denied. Admin privileges required."

**Solutions:**
1. Make sure you ran the SQL to set `is_admin = true`
2. Log out and log back in
3. Clear browser cache
4. Verify in database:
   ```sql
   SELECT * FROM public.profiles WHERE is_admin = true;
   ```

### Can't log in with admin credentials

**Check:**
1. Did you create the user in Supabase Dashboard?
2. Did you check "Auto Confirm User"?
3. Is email confirmation disabled in Auth settings?
4. Try resetting the password in Supabase Dashboard

### User created but not showing in profiles table

**Solution:**
The trigger should auto-create the profile. If not, run:
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If missing, run the schema.sql file again
```

---

## Quick Reference

| What | Value |
|------|-------|
| **Email** | sharveshadmin@gmail.com |
| **Password** | 9843147333 |
| **Login URL** | http://localhost:3000/login |
| **Admin URL** | http://localhost:3000/admin |
| **Dashboard** | http://localhost:3000 |

---

## Next Steps

1. ✅ Create admin user in Supabase Dashboard
2. ✅ Run SQL to grant admin privileges
3. ✅ Log in at http://localhost:3000/login
4. ✅ Access admin dashboard at http://localhost:3000/admin
5. ✅ Start managing your social media platform!

---

**Need Help?**

- Check `ADMIN_GUIDE.md` for detailed admin features
- Check `SETUP.md` for general setup instructions
- Check `README.md` for complete documentation

---

**Happy Administrating! 🚀**
