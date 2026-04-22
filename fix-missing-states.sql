-- This script adds default states for any existing users who don't have them
-- Run this if you signed up before the default states were working

DO $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Loop through all profiles
    FOR profile_record IN 
        SELECT id FROM profiles
    LOOP
        -- Check if this user has any states
        IF NOT EXISTS (
            SELECT 1 FROM todo_states WHERE user_id = profile_record.id LIMIT 1
        ) THEN
            -- Add default states for this user
            INSERT INTO todo_states (user_id, name, order_index, is_default)
            VALUES 
                (profile_record.id, 'Not Started', 0, true),
                (profile_record.id, 'In Progress', 1, true),
                (profile_record.id, 'Done', 2, true);
            
            RAISE NOTICE 'Added default states for user: %', profile_record.id;
        END IF;
    END LOOP;
END $$;
