-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create folders table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for folders
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Create todo_states table
CREATE TABLE todo_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on todo_states
ALTER TABLE todo_states ENABLE ROW LEVEL SECURITY;

-- RLS policies for todo_states
CREATE POLICY "Users can view their own states"
  ON todo_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own states"
  ON todo_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own states"
  ON todo_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own states"
  ON todo_states FOR DELETE
  USING (auth.uid() = user_id);

-- Create todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  state_id UUID NOT NULL REFERENCES todo_states(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on todos
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- RLS policies for todos
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for todos updated_at
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to initialize default states for new users
CREATE OR REPLACE FUNCTION initialize_user_states()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if states don't already exist
  IF NOT EXISTS (
    SELECT 1 FROM todo_states WHERE user_id = NEW.id LIMIT 1
  ) THEN
    INSERT INTO todo_states (user_id, name, order_index, is_default)
    VALUES 
      (NEW.id, 'Not Started', 0, true),
      (NEW.id, 'In Progress', 1, true),
      (NEW.id, 'Done', 2, true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize states when profile is created
CREATE TRIGGER initialize_states_on_signup
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_states();

-- Create indexes for better query performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_order_index ON folders(order_index);
CREATE INDEX idx_todo_states_user_id ON todo_states(user_id);
CREATE INDEX idx_todo_states_order_index ON todo_states(order_index);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_folder_id ON todos(folder_id);
CREATE INDEX idx_todos_state_id ON todos(state_id);
CREATE INDEX idx_todos_order_index ON todos(order_index);
CREATE INDEX idx_todos_scheduled_date ON todos(scheduled_date);
