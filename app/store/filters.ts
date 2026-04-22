import { create } from 'zustand'

export type FilterState = {
  selectedStates: string[]
  selectedFolders: string[]
  searchQuery: string
  dateFilter: 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date'
  setSelectedStates: (states: string[]) => void
  setSelectedFolders: (folders: string[]) => void
  setSearchQuery: (query: string) => void
  setDateFilter: (filter: FilterState['dateFilter']) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedStates: [],
  selectedFolders: [],
  searchQuery: '',
  dateFilter: 'all',
  setSelectedStates: (states) => set({ selectedStates: states }),
  setSelectedFolders: (folders) => set({ selectedFolders: folders }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDateFilter: (filter) => set({ dateFilter: filter }),
  resetFilters: () => set({
    selectedStates: [],
    selectedFolders: [],
    searchQuery: '',
    dateFilter: 'all',
  }),
}))
