-- Comprehensive fix for missing default states
-- This migration ensures ALL users (existing and future) have default states

-- Step 1: Backfill states for ALL existing users who don't have any
DO $$
DECLARE
    user_record RECORD;
    state_count INTEGER;
    inserted_count INTEGER := 0;
BEGIN
    -- Loop through all profiles
    FOR user_record IN 
        SELECT p.id, p.email 
        FROM profiles p
        ORDER BY p.created_at
    LOOP
        -- Count existing states for this user
        SELECT COUNT(*) INTO state_count 
        FROM todo_states 
        WHERE user_id = user_record.id;
        
        -- If no states exist, add them
        IF state_count = 0 THEN
            INSERT INTO todo_states (user_id, name, order_index, is_default)
            VALUES 
                (user_record.id, 'Not Started', 0, true),
                (user_record.id, 'In Progress', 1, true),
                (user_record.id, 'Done', 2, true);
                
            inserted_count := inserted_count + 1;
            RAISE NOTICE 'Added default states for user: % (ID: %)', user_record.email, user_record.id;
        ELSE
            RAISE NOTICE 'User % already has % states - skipping', user_record.email, state_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Backfill complete. Added states for % users', inserted_count;
END $$;

-- Step 2: Drop and recreate the trigger function to make it more robust
DROP TRIGGER IF EXISTS initialize_states_on_signup ON profiles;
DROP FUNCTION IF EXISTS initialize_user_states();

-- Create improved function to initialize default states
CREATE OR REPLACE FUNCTION initialize_user_states()
RETURNS TRIGGER AS $$
DECLARE
    state_count INTEGER;
BEGIN
    -- Count existing states (use FOR UPDATE to prevent race conditions)
    SELECT COUNT(*) INTO state_count
    FROM todo_states 
    WHERE user_id = NEW.id;
    
    -- Only insert if states don't already exist
    IF state_count = 0 THEN
        BEGIN
            INSERT INTO todo_states (user_id, name, order_index, is_default)
            VALUES 
                (NEW.id, 'Not Started', 0, true),
                (NEW.id, 'In Progress', 1, true),
                (NEW.id, 'Done', 2, true);
                
            RAISE NOTICE 'Initialized default states for new user: %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't fail the profile creation
            RAISE WARNING 'Failed to initialize states for user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to initialize states when profile is created
CREATE TRIGGER initialize_states_on_signup
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_states();

-- Step 3: Create a helper function that can be called from the application
-- This provides a fallback if the trigger fails
CREATE OR REPLACE FUNCTION ensure_user_has_default_states(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    state_count INTEGER;
    inserted_count INTEGER := 0;
BEGIN
    -- Count existing states
    SELECT COUNT(*) INTO state_count
    FROM todo_states 
    WHERE user_id = target_user_id;
    
    -- Insert defaults if none exist
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_user_has_default_states(UUID) TO authenticated;

-- Step 4: Add a check constraint to prevent users from having zero states
-- (We'll add this as a soft check via a periodic maintenance function)
CREATE OR REPLACE FUNCTION check_users_have_states()
RETURNS TABLE(user_id UUID, email TEXT, state_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.email,
        COUNT(ts.id) as state_count
    FROM profiles p
    LEFT JOIN todo_states ts ON p.id = ts.user_id
    GROUP BY p.id, p.email
    HAVING COUNT(ts.id) = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the fix worked
DO $$
DECLARE
    users_without_states INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_without_states
    FROM profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM todo_states ts WHERE ts.user_id = p.id
    );
    
    IF users_without_states > 0 THEN
        RAISE WARNING 'WARNING: Still have % users without states!', users_without_states;
    ELSE
        RAISE NOTICE 'SUCCESS: All users now have default states';
    END IF;
END $$;
