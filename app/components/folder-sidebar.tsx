'use client'

import { type Folder } from '@/app/actions/folders'
import { createFolder, updateFolder, deleteFolder } from '@/app/actions/folders'
import { useState } from 'react'
import { toast } from 'sonner'

type FolderSidebarProps = {
  folders: Folder[]
  activeFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
}

export function FolderSidebar({ folders, activeFolderId, onFolderSelect }: FolderSidebarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      await createFolder(newFolderName.trim())
      setNewFolderName('')
      setIsCreating(false)
      toast.success('Folder created')
    } catch (error) {
      toast.error('Failed to create folder')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return

    try {
      await updateFolder(id, editingName.trim())
      setEditingId(null)
      setEditingName('')
      toast.success('Folder updated')
    } catch (error) {
      toast.error('Failed to update folder')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this folder? Todos in this folder will not be deleted.')) return

    try {
      await deleteFolder(id)
      toast.success('Folder deleted')
    } catch (error) {
      toast.error('Failed to delete folder')
    }
  }

  return (
    <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Folders
          </h2>
          <button
            onClick={() => setIsCreating(true)}
            className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            + New
          </button>
        </div>

        <button
          onClick={() => onFolderSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            activeFolderId === null
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          All Todos
        </button>

        <button
          onClick={() => onFolderSelect('no-folder')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            activeFolderId === 'no-folder'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          No Folder
        </button>

        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeFolderId === folder.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {editingId === folder.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdate(folder.id)
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
                <button
                  onClick={() => onFolderSelect(folder.id)}
                  className="flex-1 text-left"
                >
                  {folder.name}
                </button>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(folder.id)
                      setEditingName(folder.name)
                    }}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(folder.id)
                    }}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {isCreating && (
          <form onSubmit={handleCreate} className="px-3 py-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              autoFocus
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setIsCreating(false)
                }
              }}
            />
          </form>
        )}
      </div>
    </div>
  )
}
