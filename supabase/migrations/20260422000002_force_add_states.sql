-- Force add default states for ALL users (including existing ones)
-- This will add states to any profile that doesn't have them

DO $$
DECLARE
    user_record RECORD;
    state_count INTEGER;
BEGIN
    FOR user_record IN SELECT id, email FROM profiles LOOP
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
                
            RAISE NOTICE 'Added states for user: % (%)', user_record.email, user_record.id;
        ELSE
            RAISE NOTICE 'User % already has % states', user_record.email, state_count;
        END IF;
    END LOOP;
END $$;
