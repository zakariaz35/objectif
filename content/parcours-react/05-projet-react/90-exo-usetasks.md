---
title: "Exercice — logique de tâches (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Task {
      id: string
      title: string
      done: boolean
      priority: 'low' | 'medium' | 'high'
    }

    type FilterValue = 'all' | 'active' | 'done'

    // Pure task management logic (the kind useTasks hook would wrap).

    function addTask(tasks: Task[], title: string, priority: Task['priority']): Task[] {
      // TODO: append a new task with done: false and a generated id ('task-' + tasks.length + 1)
      return []
    }

    function toggleTask(tasks: Task[], id: string): Task[] {
      // TODO: flip done for the task with the given id (immutable)
      return []
    }

    function filterTasks(tasks: Task[], filter: FilterValue): Task[] {
      // TODO: return filtered tasks
      return []
    }

    function sortByPriority(tasks: Task[]): Task[] {
      // TODO: sort high > medium > low (do not mutate)
      return []
    }
  tests:
    - name: "addTask ajoute une tâche"
      code: |
        const tasks: Task[] = []
        const result = addTask(tasks, 'Faire du sport', 'high')
        console.log('tâches :', result)
        assertEqual(result.length, 1, '1 tâche')
        assertEqual(result[0].title, 'Faire du sport', 'titre ok')
        assertEqual(result[0].done, false, 'done = false')
        assertEqual(result[0].priority, 'high', 'priority = high')
    - name: "toggleTask bascule done"
      code: |
        const tasks: Task[] = [
          { id: 'task-1', title: 'Sport', done: false, priority: 'low' }
        ]
        const toggled = toggleTask(tasks, 'task-1')
        assertEqual(toggled[0].done, true, 'done bascule à true')
        const back = toggleTask(toggled, 'task-1')
        assertEqual(back[0].done, false, 'done rebascule à false')
    - name: "filterTasks filtre active"
      code: |
        const tasks: Task[] = [
          { id: 't1', title: 'A', done: false, priority: 'low' },
          { id: 't2', title: 'B', done: true,  priority: 'low' },
          { id: 't3', title: 'C', done: false, priority: 'low' },
        ]
        const active = filterTasks(tasks, 'active')
        console.log('active :', active.map(t => t.title))
        assertEqual(active.length, 2, '2 tâches actives')
    - name: "sortByPriority trie high > medium > low"
      code: |
        const tasks: Task[] = [
          { id: 't1', title: 'Low',  done: false, priority: 'low' },
          { id: 't2', title: 'High', done: false, priority: 'high' },
          { id: 't3', title: 'Med',  done: false, priority: 'medium' },
        ]
        const sorted = sortByPriority(tasks)
        console.log('ordre :', sorted.map(t => t.priority))
        assertEqual(sorted[0].priority, 'high', 'high en premier')
        assertEqual(sorted[2].priority, 'low', 'low en dernier')
---

## Énoncé

> **Durée conseillée : ~25 min.** Ces quatre fonctions constituent le cœur du hook
> `useTasks` du projet. Implémente-les en logique pure TypeScript.

Implémente :

1. `addTask` — ajoute une tâche (id généré `'task-' + (tasks.length + 1)`).
2. `toggleTask` — bascule `done` pour l'id donné. **Immuable** (`map`).
3. `filterTasks` — `'all'` retourne tout, `'active'` les non terminées, `'done'` les terminées.
4. `sortByPriority` — trie `high > medium > low`. **Ne mute pas** le tableau d'entrée.

<!--correction-->

## Correction

```ts
const PRIORITY_ORDER: Record<Task['priority'], number> = {
  high: 3,
  medium: 2,
  low: 1,
}

function addTask(tasks: Task[], title: string, priority: Task['priority']): Task[] {
  const newTask: Task = {
    id: `task-${tasks.length + 1}`,
    title,
    done: false,
    priority,
  }
  return [...tasks, newTask]
}

function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
}

function filterTasks(tasks: Task[], filter: FilterValue): Task[] {
  if (filter === 'active') return tasks.filter((t) => !t.done)
  if (filter === 'done') return tasks.filter((t) => t.done)
  return tasks
}

function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority])
}
```

Points clés :
- `addTask` : spread pour ne pas muter, id déterministe pour les tests.
- `toggleTask` : `map` retourne un nouveau tableau, spread pour le nouvel objet.
- `sortByPriority` : `[...tasks]` copie d'abord — `sort` **mute**, ne pas l'oublier.
