-- ============================================================================
-- CRITICAL FIX: Create missing profiles for auth users
-- This fixes the foreign key constraint error for legacy users
-- ============================================================================

-- Step 1: Create profiles for auth.users that don't have a profile
INSERT INTO profiles (id, email, created_at)
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Now backfill states for users without them
DO $$
DECLARE
    user_record RECORD;
    state_count INTEGER;
    inserted_count INTEGER := 0;
BEGIN
    FOR user_record IN 
        SELECT p.id, p.email 
        FROM profiles p
        ORDER BY p.created_at
    LOOP
        SELECT COUNT(*) INTO state_count 
        FROM todo_states 
        WHERE user_id = user_record.id;
        
        IF state_count = 0 THEN
            INSERT INTO todo_states (user_id, name, order_index, is_default)
            VALUES 
                (user_record.id, 'Not Started', 0, true),
                (user_record.id, 'In Progress', 1, true),
                (user_record.id, 'Done', 2, true);
                
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Backfill complete. Added states for % users', inserted_count;
END $$;

-- Step 3: Verify no missing profiles
SELECT 
    COUNT(*) as auth_users_without_profiles
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Step 4: Verify no missing states
SELECT 
    COUNT(*) as profiles_without_states
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM todo_states ts WHERE ts.user_id = p.id
);

-- Both should return 0!
