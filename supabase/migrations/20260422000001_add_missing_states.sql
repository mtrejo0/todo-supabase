-- Add default states for any users who don't have them
INSERT INTO todo_states (user_id, name, order_index, is_default)
SELECT 
  p.id as user_id,
  s.name,
  s.order_index,
  true as is_default
FROM profiles p
CROSS JOIN (
  VALUES 
    ('Not Started', 0),
    ('In Progress', 1),
    ('Done', 2)
) AS s(name, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM todo_states ts WHERE ts.user_id = p.id
);
