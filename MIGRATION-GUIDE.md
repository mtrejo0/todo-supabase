# Supabase Migration Guide

I've set up the Supabase CLI with migrations! Here are your options:

## Option 1: Use Supabase CLI (Recommended for production)

### Step 1: Login to Supabase CLI

A browser window should have opened. If not:

```bash
supabase login
```

This will:
1. Open a browser
2. Ask you to authorize the CLI
3. Generate an access token

### Step 2: Link to your project

```bash
supabase link --project-ref jjhkkdulykpqjqffsvpr
```

You'll need your **database password** (from when you created the Supabase project).

### Step 3: Run the migration

```bash
supabase db push
```

This will apply the migration in `supabase/migrations/20260422000000_initial_schema.sql` to your remote database.

### Step 4: Check status

```bash
supabase migration list
```

---

## Option 2: Manual SQL (Quickest for now)

Since the login is interactive, here's the fastest way:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/jjhkkdulykpqjqffsvpr
2. **Click "SQL Editor"** in the left sidebar
3. **Copy the SQL** from `supabase-schema.sql` (or `supabase/migrations/20260422000000_initial_schema.sql`)
4. **Paste and Run** in the SQL Editor

---

## Option 3: Use the Supabase API with Access Token

If you have a Supabase access token, you can set it and push directly:

```bash
export SUPABASE_ACCESS_TOKEN="your-token-here"
supabase link --project-ref jjhkkdulykpqjqffsvpr
supabase db push
```

Get your access token from: https://supabase.com/dashboard/account/tokens

---

## What I've Set Up

✅ Installed Supabase CLI via Homebrew
✅ Initialized Supabase in your project (`supabase/` folder)
✅ Created migration file: `supabase/migrations/20260422000000_initial_schema.sql`
✅ Ready to push to your database

## Migration Contains

- `profiles` table + RLS policies
- `folders` table + RLS policies  
- `todo_states` table + RLS policies
- `todos` table + RLS policies
- Triggers for auto-creating default states
- Indexes for performance

---

## Future Migrations

After the initial setup, when you need to make changes:

```bash
# Create a new migration
supabase migration new add_column_to_todos

# Edit the generated file in supabase/migrations/

# Push to remote
supabase db push
```

---

## My Recommendation

**For now**: Use Option 2 (Manual SQL) - it's the fastest

**For later**: Complete the CLI login so you can use `supabase db push` for future schema changes

Would you like me to wait for you to complete the login, or shall we go with the manual SQL approach?
