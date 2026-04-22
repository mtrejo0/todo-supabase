'use client'

import { type Todo } from '@/app/actions/todos'
import { type Folder } from '@/app/actions/folders'
import { type TodoState } from '@/app/actions/states'
import { createTodo, updateTodo } from '@/app/actions/todos'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

type TodoFormProps = {
  todo?: Todo
  folders: Folder[]
  states: TodoState[]
  onClose: () => void
}

export function TodoForm({ todo, folders, states, onClose }: TodoFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(todo?.title || '')
  const [description, setDescription] = useState(todo?.description || '')
  const [folderId, setFolderId] = useState<string>(todo?.folder_id || '')
  const [stateId, setStateId] = useState<string>(todo?.state_id || states[0]?.id || '')
  const [scheduledDate, setScheduledDate] = useState(
    todo?.scheduled_date ? format(new Date(todo.scheduled_date), 'yyyy-MM-dd') : ''
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!stateId && states.length > 0) {
      setStateId(states[0].id)
    }
  }, [states, stateId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('folderId', folderId)
      formData.append('stateId', stateId)
      formData.append('scheduledDate', scheduledDate)

      if (todo) {
        await updateTodo(todo.id, {
          title: title.trim(),
          description: description.trim() || null,
          folder_id: folderId || null,
          state_id: stateId,
          scheduled_date: scheduledDate || null,
        })
        toast.success('Todo updated')
      } else {
        await createTodo(formData)
        toast.success('Todo created')
      }

      // Trigger router refresh to get updated data from server
      router.refresh()
      onClose()
    } catch (error) {
      toast.error(todo ? 'Failed to update todo' : 'Failed to create todo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {todo ? 'Edit Todo' : 'New Todo'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              placeholder="Add more details..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                State *
              </label>
              <select
                id="state"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                required
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Folder
              </label>
              <select
                id="folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              >
                <option value="">No Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Scheduled Date
              </label>
              <input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : (todo ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
