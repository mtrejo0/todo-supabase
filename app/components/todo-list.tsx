'use client'

import { type Todo } from '@/app/actions/todos'
import { type TodoState } from '@/app/actions/states'
import { type Folder } from '@/app/actions/folders'
import { reorderTodos } from '@/app/actions/todos'
import { TodoItem } from './todo-item'
import { useState, useMemo, useEffect } from 'react'
import { useFilterStore } from '@/app/store/filters'
import { isToday, isBefore, startOfToday } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'

type TodoListProps = {
  initialTodos: Todo[]
  states: TodoState[]
  folders: Folder[]
  onEditTodo: (todo: Todo) => void
  activeFolderId: string | null
}

export function TodoList({ initialTodos, states, folders, onEditTodo, activeFolderId }: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { selectedStates, selectedFolders, searchQuery, dateFilter } = useFilterStore()

  // Sync local state when server data changes
  useEffect(() => {
    setTodos(initialTodos)
  }, [initialTodos])

  // Prevent hydration mismatch by only enabling DnD after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Sidebar folder filter (takes precedence)
      if (activeFolderId !== null) {
        if (activeFolderId === 'no-folder' && todo.folder_id) {
          return false
        } else if (activeFolderId !== 'no-folder' && todo.folder_id !== activeFolderId) {
          return false
        }
      }

      // Filter bar state filters
      if (selectedStates.length > 0 && !selectedStates.includes(todo.state_id)) {
        return false
      }

      // Filter bar folder filters (only if sidebar shows "All Todos")
      if (activeFolderId === null && selectedFolders.length > 0) {
        if (selectedFolders.includes('no-folder') && !todo.folder_id) {
          // pass
        } else if (!selectedFolders.includes(todo.folder_id || '')) {
          return false
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!todo.title.toLowerCase().includes(query) && 
            !todo.description?.toLowerCase().includes(query)) {
          return false
        }
      }

      if (dateFilter !== 'all') {
        const today = startOfToday()
        if (dateFilter === 'no-date' && todo.scheduled_date) return false
        if (dateFilter === 'today' && (!todo.scheduled_date || !isToday(new Date(todo.scheduled_date)))) return false
        if (dateFilter === 'upcoming' && (!todo.scheduled_date || !isBefore(today, new Date(todo.scheduled_date)))) return false
        if (dateFilter === 'overdue' && (!todo.scheduled_date || !isBefore(new Date(todo.scheduled_date), today))) return false
      }

      return true
    })
  }, [todos, activeFolderId, selectedStates, selectedFolders, searchQuery, dateFilter])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = filteredTodos.findIndex((todo) => todo.id === active.id)
    const newIndex = filteredTodos.findIndex((todo) => todo.id === over.id)

    const newFilteredOrder = arrayMove(filteredTodos, oldIndex, newIndex)
    
    const allTodoIds = todos.map((t) => t.id)
    const filteredIds = new Set(newFilteredOrder.map((t) => t.id))
    const unfilteredTodos = todos.filter((t) => !filteredIds.has(t.id))
    
    const newAllTodos = [...unfilteredTodos, ...newFilteredOrder]
    
    // Optimistic update
    setTodos(newAllTodos)

    try {
      await reorderTodos(newAllTodos.map((t) => t.id))
    } catch (error) {
      // Rollback on failure
      setTodos(todos)
      toast.error('Failed to reorder todos')
    }
  }

  if (filteredTodos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          {todos.length === 0 ? 'No todos yet. Create one to get started!' : 'No todos match the current filters.'}
        </p>
      </div>
    )
  }

  // Render without DnD during SSR/hydration or on mobile
  if (!mounted || isMobile) {
    return (
      <div className="space-y-3">
        {filteredTodos.map((todo) => {
          const state = states.find((s) => s.id === todo.state_id)
          const folder = folders.find((f) => f.id === todo.folder_id)
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              state={state}
              folder={folder}
              allStates={states}
              onEdit={onEditTodo}
              isMobile={isMobile}
            />
          )
        })}
      </div>
    )
  }

  // Render with DnD after hydration on desktop
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={filteredTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {filteredTodos.map((todo) => {
            const state = states.find((s) => s.id === todo.state_id)
            const folder = folders.find((f) => f.id === todo.folder_id)
            return (
              <TodoItem
                key={todo.id}
                todo={todo}
                state={state}
                folder={folder}
                allStates={states}
                onEdit={onEditTodo}
                isMobile={isMobile}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
