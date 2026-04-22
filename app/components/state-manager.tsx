'use client'

import { type TodoState } from '@/app/actions/states'
import { createState, updateState, deleteState } from '@/app/actions/states'
import { useState } from 'react'
import { toast } from 'sonner'

type StateManagerProps = {
  states: TodoState[]
}

export function StateManager({ states }: StateManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newStateName, setNewStateName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStateName.trim()) return

    try {
      await createState(newStateName.trim())
      setNewStateName('')
      setIsCreating(false)
      toast.success('State created')
    } catch (error) {
      toast.error('Failed to create state')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return

    try {
      await updateState(id, editingName.trim())
      setEditingId(null)
      setEditingName('')
      toast.success('State updated')
    } catch (error) {
      toast.error('Failed to update state')
    }
  }

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error('Cannot delete default states')
      return
    }

    if (!confirm('Delete this state? Todos with this state cannot be displayed.')) return

    try {
      await deleteState(id)
      toast.success('State deleted')
    } catch (error) {
      toast.error('Failed to delete state')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
      >
        Manage States
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Manage States
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {states.map((state) => (
            <div
              key={state.id}
              className="group flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              {editingId === state.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleUpdate(state.id)
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800"
                    autoFocus
                    onBlur={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                  />
                </form>
              ) : (
                <>
                  <span className="flex-1 text-zinc-900 dark:text-zinc-50">
                    {state.name}
                    {state.is_default && (
                      <span className="ml-2 text-xs text-zinc-500">(default)</span>
                    )}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(state.id)
                        setEditingName(state.name)
                      }}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {!state.is_default && (
                      <button
                        onClick={() => handleDelete(state.id, state.is_default)}
                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {isCreating ? (
            <form onSubmit={handleCreate} className="p-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <input
                type="text"
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                placeholder="State name..."
                className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                autoFocus
                onBlur={() => {
                  if (!newStateName.trim()) {
                    setIsCreating(false)
                  }
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full p-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              + Add State
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
