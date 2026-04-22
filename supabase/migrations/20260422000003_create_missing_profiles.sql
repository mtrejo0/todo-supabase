-- Create profiles for auth users who don't have one, then add their default states

DO $$
DECLARE
    auth_user RECORD;
    profile_exists BOOLEAN;
BEGIN
    -- Loop through all users in auth.users
    FOR auth_user IN 
        SELECT id, email, created_at 
        FROM auth.users 
    LOOP
        -- Check if profile exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth_user.id) INTO profile_exists;
        
        IF NOT profile_exists THEN
            -- Create the missing profile
            INSERT INTO profiles (id, email, created_at)
            VALUES (auth_user.id, auth_user.email, auth_user.created_at);
            
            RAISE NOTICE 'Created profile for user: % (%)', auth_user.email, auth_user.id;
            
            -- Add default states for this new profile
            INSERT INTO todo_states (user_id, name, order_index, is_default)
            VALUES 
                (auth_user.id, 'Not Started', 0, true),
                (auth_user.id, 'In Progress', 1, true),
                (auth_user.id, 'Done', 2, true);
                
            RAISE NOTICE 'Added default states for user: %', auth_user.email;
        ELSE
            RAISE NOTICE 'Profile already exists for: %', auth_user.email;
        END IF;
    END LOOP;
END $$;
