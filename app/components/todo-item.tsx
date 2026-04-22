'use client'

import { type Todo } from '@/app/actions/todos'
import { type TodoState } from '@/app/actions/states'
import { type Folder } from '@/app/actions/folders'
import { deleteTodo, updateTodo } from '@/app/actions/todos'
import { toast } from 'sonner'
import { format, isPast, isToday } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'

type TodoItemProps = {
  todo: Todo
  state: TodoState | undefined
  folder: Folder | undefined
  onEdit: (todo: Todo) => void
}

export function TodoItem({ todo, state, folder, onEdit }: TodoItemProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    if (!confirm('Delete this todo?')) return

    try {
      await deleteTodo(todo.id)
      toast.success('Todo deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete todo')
    }
  }

  const getDateColor = (date: string | null) => {
    if (!date) return ''
    const todoDate = new Date(date)
    if (isToday(todoDate)) return 'text-blue-600 dark:text-blue-400'
    if (isPast(todoDate)) return 'text-red-600 dark:text-red-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 break-words">
            {todo.title}
          </h3>
          
          {todo.description && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 break-words">
              {todo.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-2 items-center text-xs">
            {state && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                {state.name}
              </span>
            )}
            
            {folder && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                {folder.name}
              </span>
            )}

            {todo.scheduled_date && (
              <span className={`px-2 py-1 rounded-full font-medium ${getDateColor(todo.scheduled_date)}`}>
                {format(new Date(todo.scheduled_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
