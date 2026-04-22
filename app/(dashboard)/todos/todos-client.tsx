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

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTodo(undefined)
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <FilterBar states={states} folders={folders} />

      <div className="flex">
        <FolderSidebar
          folders={folders}
          activeFolderId={activeFolderId}
          onFolderSelect={setActiveFolderId}
        />

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {activeFolderId === null 
                  ? 'All Todos' 
                  : activeFolderId === 'no-folder'
                  ? 'No Folder'
                  : folders.find((f) => f.id === activeFolderId)?.name || 'Todos'}
              </h2>
              <div className="flex gap-3">
                <StateManager states={states} />
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
