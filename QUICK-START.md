# Quick Start Guide

## 🚀 Getting Started (Under 5 Minutes)

### Step 1: Set Up Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/jjhkkdulykpqjqffsvpr
2. Click on **SQL Editor** in the left sidebar
3. Copy all the SQL from `supabase-schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### Step 2: Configure Auth (Optional for Development)

1. Go to **Authentication** → **Providers** → **Email**
2. Turn OFF "Confirm email" (makes testing easier)
3. Save

### Step 3: Start Using the App

The dev server is already running at: **http://localhost:3000**

1. Visit http://localhost:3000
2. Click **Sign Up**
3. Create an account with any email/password
4. You're in! Start creating todos

## 📝 Quick Feature Tour

### Create Your First Todo
1. Click **"+ New Todo"** button
2. Enter a title (required)
3. Optionally add description, folder, state, date
4. Click **Create**

### Organize with Folders
1. Look at the left sidebar
2. Click **"+ New"** next to Folders
3. Type folder name and press Enter
4. Edit todos to assign them to folders

### Add Custom States
1. Click **"Manage States"** button
2. Click **"+ Add State"** at the bottom
3. Type state name (e.g., "Blocked", "Review", "Testing")
4. Press Enter

### Filter Your Todos
- Use the search bar to find todos
- Click state/folder tags to filter
- Use date dropdown for time-based filtering
- Click **"Clear Filters"** to reset

### Reorder Todos
- Grab the handle icon (☰) on the left of any todo
- Drag it up or down
- Release to drop

### Schedule Todos
- Edit a todo
- Click the date picker
- Select a date
- Save

Color coding:
- 🔵 Blue = Today
- 🟢 Green = Upcoming
- 🔴 Red = Overdue

## 🎯 Pro Tips

1. **Quick Edit**: Click anywhere on a todo card to edit it
2. **Bulk Organize**: Use filters to view specific groups, then reorder them
3. **Keyboard Shortcut**: Click "Manage States" or "New Todo" without mouse
4. **Mobile Friendly**: Works great on phones too!

## ❓ Troubleshooting

**Can't log in?**
- Check that the database schema was created successfully
- Verify email confirmation is disabled in Supabase Auth settings

**Todos not appearing?**
- Open browser DevTools (F12) and check Console for errors
- Make sure you're logged in
- Verify the database tables exist in Supabase

**Need to reset?**
- Delete your account data from Supabase Dashboard → Table Editor
- Or create a new Supabase project

## 📚 More Info

See `README-TODO-APP.md` for detailed documentation.

---

**Happy organizing! 🎉**
