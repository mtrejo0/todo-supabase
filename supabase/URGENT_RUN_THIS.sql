-- ============================================================================
-- URGENT FIX: Run this SQL in Supabase Dashboard > SQL Editor
-- This will backfill default states for ALL existing users
-- ============================================================================

-- Step 1: Backfill states for existing users
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

-- Step 2: Create helper function for future use
CREATE OR REPLACE FUNCTION ensure_user_has_default_states(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    state_count INTEGER;
    inserted_count INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO state_count
    FROM todo_states 
    WHERE user_id = target_user_id;
    
    IF state_count = 0 THEN
        INSERT INTO todo_states (user_id, name, order_index, is_default)
        VALUES 
            (target_user_id, 'Not Started', 0, true),
            (target_user_id, 'In Progress', 1, true),
            (target_user_id, 'Done', 2, true);
        inserted_count := 3;
    END IF;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION ensure_user_has_default_states(UUID) TO authenticated;

-- Step 3: Verify the fix
SELECT 
    COUNT(*) as users_without_states
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM todo_states ts WHERE ts.user_id = p.id
);

-- Should return 0 if successful!
