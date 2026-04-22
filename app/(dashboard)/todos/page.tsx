import { getTodos } from '@/app/actions/todos'
import { getFolders } from '@/app/actions/folders'
import { getStates } from '@/app/actions/states'
import { TodosClient } from './todos-client'

export const dynamic = 'force-dynamic'

export default async function TodosPage() {
  const [todos, folders, states] = await Promise.all([
    getTodos(),
    getFolders(),
    getStates(),
  ])

  return <TodosClient initialTodos={todos} folders={folders} states={states} />
}
