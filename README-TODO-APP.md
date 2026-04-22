# Todo App - Setup Instructions

A full-featured todo application built with Next.js, Supabase, and TypeScript.

## Features

- Email/password authentication
- Create, edit, and delete todos
- Organize todos in folders
- Custom todo states (Not Started, In Progress, Done, and custom states)
- Schedule todos with dates
- Filter todos by state, folder, date, and search
- Drag and drop to reorder todos
- Modern, responsive UI with dark mode support

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor
4. This will create all necessary tables, RLS policies, and triggers

The schema includes:
- `profiles` - User profiles
- `folders` - Todo folders
- `todo_states` - Custom todo states
- `todos` - Todo items

### 3. Configure Environment Variables

Your `.env.local` file should already be configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Getting Started

1. **Sign Up**: Create a new account at `/signup`
2. **Sign In**: Log in at `/login`
3. **Create Todos**: Click "+ New Todo" to create your first todo
4. **Organize**: Create folders and custom states to organize your tasks
5. **Filter**: Use the filter bar to view specific todos
6. **Drag & Drop**: Reorder todos by dragging them

### Managing States

- Click "Manage States" to add custom states beyond the defaults
- Default states (Not Started, In Progress, Done) cannot be deleted
- Custom states can be renamed or deleted

### Managing Folders

- Use the sidebar to create, rename, and delete folders
- Drag todos into folders or leave them unorganized
- View all todos or filter by specific folders

### Filtering

- **Search**: Search by todo title or description
- **States**: Filter by one or more states
- **Folders**: Filter by specific folders or "No Folder"
- **Dates**: Filter by today, upcoming, overdue, or no date

## Project Structure

```
app/
├── (auth)/              # Authentication pages
│   ├── login/
│   └── signup/
├── (dashboard)/         # Protected dashboard
│   └── todos/          # Main todos page
├── actions/            # Server actions
│   ├── auth.ts
│   ├── todos.ts
│   ├── folders.ts
│   └── states.ts
├── components/         # React components
│   ├── todo-list.tsx
│   ├── todo-item.tsx
│   ├── todo-form.tsx
│   ├── filter-bar.tsx
│   ├── folder-sidebar.tsx
│   └── state-manager.tsx
└── store/             # Client state management
    └── filters.ts
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **Supabase** - Backend as a Service (auth, database, RLS)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **dnd-kit** - Drag and drop functionality
- **Zustand** - Client state management
- **Sonner** - Toast notifications
- **date-fns** - Date utilities

## Database Security

All tables use Row Level Security (RLS) to ensure users can only access their own data. The policies are automatically created when you run the schema SQL.

## Troubleshooting

### Authentication Issues
- Make sure your Supabase URL and anon key are correct in `.env.local`
- Check that email confirmation is disabled in Supabase Auth settings (for development)

### Database Issues
- Verify all tables were created successfully in Supabase
- Check that RLS policies are enabled on all tables
- Ensure the trigger for initializing default states is working

### Todos Not Appearing
- Check browser console for errors
- Verify user is authenticated
- Check that todos are being created with the correct `user_id`

## License

MIT
