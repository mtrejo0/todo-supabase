-- Quick fix: Add default states for all users who don't have them

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

-- Verify it worked
SELECT 
  p.email,
  COUNT(ts.id) as state_count
FROM profiles p
LEFT JOIN todo_states ts ON ts.user_id = p.id
GROUP BY p.id, p.email;
