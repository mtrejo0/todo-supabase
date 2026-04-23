'use client'

import { type Todo } from '@/app/actions/todos'
import { type Folder } from '@/app/actions/folders'
import { type TodoState } from '@/app/actions/states'
import { TodoList } from '@/app/components/todo-list'
import { TodoForm } from '@/app/components/todo-form'
import { FilterBar } from '@/app/components/filter-bar'
import { FolderSidebar } from '@/app/components/folder-sidebar'
import { StateManager } from '@/app/components/state-manager'
import { useState } from 'react'
import { Toaster } from 'sonner'

type TodosClientProps = {
  initialTodos: Todo[]
  folders: Folder[]
  states: TodoState[]
}

export function TodosClient({ initialTodos, folders, states }: TodosClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTodo(undefined)
  }

  const handleFolderSelect = (folderId: string | null) => {
    setActiveFolderId(folderId)
    setIsSidebarOpen(false)
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <FilterBar states={states} folders={folders} />

      <div className="flex relative">
        <FolderSidebar
          folders={folders}
          activeFolderId={activeFolderId}
          onFolderSelect={handleFolderSelect}
          isSidebarOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label="Open folder menu"
                >
                  <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {activeFolderId === null 
                    ? 'All Todos' 
                    : activeFolderId === 'no-folder'
                    ? 'No Folder'
                    : folders.find((f) => f.id === activeFolderId)?.name || 'Todos'}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <StateManager states={states} />
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                >
                  + New Todo
                </button>
              </div>
            </div>

            <TodoList
              initialTodos={initialTodos}
              states={states}
              folders={folders}
              onEditTodo={handleEditTodo}
              activeFolderId={activeFolderId}
            />
          </div>
        </main>
      </div>

      {isFormOpen && (
        <TodoForm
          todo={editingTodo}
          folders={folders}
          states={states}
          onClose={handleCloseForm}
        />
      )}
    </>
  )
}
