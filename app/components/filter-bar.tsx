'use client'

import { type Folder } from '@/app/actions/folders'
import { type TodoState } from '@/app/actions/states'
import { useFilterStore, type FilterState } from '@/app/store/filters'

type FilterBarProps = {
  states: TodoState[]
  folders: Folder[]
}

export function FilterBar({ states, folders }: FilterBarProps) {
  const {
    selectedStates,
    selectedFolders,
    searchQuery,
    dateFilter,
    setSelectedStates,
    setSelectedFolders,
    setSearchQuery,
    setDateFilter,
    resetFilters,
  } = useFilterStore()

  const toggleState = (stateId: string) => {
    if (selectedStates.includes(stateId)) {
      setSelectedStates(selectedStates.filter((id) => id !== stateId))
    } else {
      setSelectedStates([...selectedStates, stateId])
    }
  }

  const toggleFolder = (folderId: string) => {
    if (selectedFolders.includes(folderId)) {
      setSelectedFolders(selectedFolders.filter((id) => id !== folderId))
    } else {
      setSelectedFolders([...selectedFolders, folderId])
    }
  }

  const hasActiveFilters = 
    selectedStates.length > 0 || 
    selectedFolders.length > 0 || 
    searchQuery.length > 0 || 
    dateFilter !== 'all'

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as FilterState['dateFilter'])}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
            <option value="no-date">No Date</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          {states.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                States
              </label>
              <div className="flex flex-wrap gap-2">
                {states.map((state) => (
                  <button
                    key={state.id}
                    onClick={() => toggleState(state.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                      selectedStates.includes(state.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {state.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {folders.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Folders
              </label>
              <div className="flex flex-wrap gap-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => toggleFolder(folder.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                      selectedFolders.includes(folder.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {folder.name}
                  </button>
                ))}
                <button
                  onClick={() => toggleFolder('no-folder')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                    selectedFolders.includes('no-folder')
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                >
                  No Folder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
