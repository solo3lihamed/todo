import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Todo {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

class WebDatabase {
  private static STORAGE_KEY = 'todos';
  private static COUNTER_KEY = 'todos_counter';

  static async getAllTodos(): Promise<Todo[]> {
    try {
      const todosJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return todosJson ? JSON.parse(todosJson) : [];
    } catch (error) {
      console.error('Failed to get todos:', error);
      return [];
    }
  }

  static async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
      throw error;
    }
  }

  static async getNextId(): Promise<number> {
    try {
      const counterStr = await AsyncStorage.getItem(this.COUNTER_KEY);
      const counter = counterStr ? parseInt(counterStr, 10) : 0;
      const nextId = counter + 1;
      await AsyncStorage.setItem(this.COUNTER_KEY, nextId.toString());
      return nextId;
    } catch (error) {
      console.error('Failed to get next ID:', error);
      return Date.now(); // Fallback to timestamp
    }
  }
}

export async function initializeDatabase(): Promise<void> {
  // Web doesn't need initialization
  return;
}

export async function addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date().toISOString();
  const todos = await WebDatabase.getAllTodos();
  const id = await WebDatabase.getNextId();
  const newTodo: Todo = {
    ...todo,
    id,
    createdAt: now,
    updatedAt: now,
  };
  todos.push(newTodo);
  await WebDatabase.saveTodos(todos);
  return id;
}

export async function updateTodo(id: number, todo: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const now = new Date().toISOString();
  const todos = await WebDatabase.getAllTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...todo, updatedAt: now };
    await WebDatabase.saveTodos(todos);
  }
}

export async function deleteTodo(id: number): Promise<void> {
  const todos = await WebDatabase.getAllTodos();
  const filteredTodos = todos.filter(t => t.id !== id);
  await WebDatabase.saveTodos(filteredTodos);
}

export async function getAllTodos(): Promise<Todo[]> {
  const todos = await WebDatabase.getAllTodos();
  return todos.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 2;
    const bPriority = priorityOrder[b.priority] || 2;
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getTodosByCategory(category: string): Promise<Todo[]> {
  const todos = await getAllTodos();
  return todos.filter(todo => todo.category === category);
}

export async function getTodoById(id: number): Promise<Todo | null> {
  const todos = await WebDatabase.getAllTodos();
  return todos.find(todo => todo.id === id) || null;
}

export async function getCategories(): Promise<string[]> {
  const todos = await WebDatabase.getAllTodos();
  const categories = [...new Set(todos.map(todo => todo.category))];
  return categories.sort();
}

export async function searchTodos(query: string): Promise<Todo[]> {
  const todos = await getAllTodos();
  const searchQuery = query.toLowerCase();
  return todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery) ||
    todo.description.toLowerCase().includes(searchQuery)
  );
}