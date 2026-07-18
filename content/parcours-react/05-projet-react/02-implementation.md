---
title: "Projet — implémentation guidée"
type: lesson
---

# Implémentation guidée

On construit le Task Manager étape par étape, de la logique métier vers l'UI.

## Étape 1 — Le hook `useLocalStorage`

```ts
// src/hooks/useLocalStorage.ts
import { useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  function set(newValue: T) {
    localStorage.setItem(key, JSON.stringify(newValue))
    setValue(newValue)
  }

  return [value, set]
}
```

## Étape 2 — Le hook `useTasks`

```ts
// src/hooks/useTasks.ts
import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Task, FilterValue } from '../types/task'

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])

  const addTask = useCallback((title: string, description = '') => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      done: false,
      createdAt: new Date().toISOString(),
    }
    setTasks([...tasks, newTask])
  }, [tasks, setTasks])

  const toggleTask = useCallback((id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }, [tasks, setTasks])

  const deleteTask = useCallback((id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }, [tasks, setTasks])

  function getFiltered(filter: FilterValue) {
    return useMemo(() => {
      if (filter === 'active') return tasks.filter((t) => !t.done)
      if (filter === 'done') return tasks.filter((t) => t.done)
      return tasks
    }, [tasks, filter])
  }

  return { tasks, addTask, toggleTask, deleteTask, getFiltered }
}
```

> **Note —** dans le code réel, `getFiltered` doit être un hook séparé ou `useMemo`
> doit être appelé au niveau supérieur (règle des hooks). Ici c'est simplifié pour la
> lisibilité pédagogique.

## Étape 3 — Le Context thème

```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme} className="app">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

## Étape 4 — Le router

```tsx
// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './pages/Layout'
import TaskList from './pages/TaskList'
import TaskDetail from './pages/TaskDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: 'tasks', element: <TaskList /> },
      { path: 'tasks/:id', element: <TaskDetail /> },
    ],
  },
])
```

## Étape 5 — La page TaskList

```tsx
// src/pages/TaskList.tsx
import { useState, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskItem from '../components/TaskItem'
import TaskForm from '../components/TaskForm'
import FilterBar from '../components/FilterBar'
import type { FilterValue } from '../types/task'

export default function TaskList() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks()
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.done)
    if (filter === 'done') return tasks.filter((t) => t.done)
    return tasks
  }, [tasks, filter])

  return (
    <div className="task-list">
      <TaskForm onAdd={addTask} />
      <FilterBar current={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="empty">Aucune tâche pour ce filtre.</p>
      ) : (
        <ul>
          {filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Étape 6 — Les composants de base

```tsx
// src/components/TaskForm.tsx
import { useState } from 'react'

interface TaskFormProps {
  onAdd: (title: string, description?: string) => void
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), desc.trim())
    setTitle('')
    setDesc('')
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la tâche…"
        required
      />
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optionnel)"
      />
      <button type="submit" disabled={!title.trim()}>Ajouter</button>
    </form>
  )
}
```

```tsx
// src/components/TaskItem.tsx
import { Link } from 'react-router-dom'
import type { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={`task-item ${task.done ? 'task-item--done' : ''}`}>
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      <button onClick={() => onDelete(task.id)} aria-label="Supprimer">×</button>
    </li>
  )
}
```

```tsx
// src/components/FilterBar.tsx
import type { FilterValue } from '../types/task'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'En cours' },
  { value: 'done', label: 'Terminées' },
]

interface FilterBarProps {
  current: FilterValue
  onChange: (f: FilterValue) => void
}

export default function FilterBar({ current, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          className={current === value ? 'active' : ''}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```
