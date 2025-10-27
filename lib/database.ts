import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

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

const DATABASE_NAME = 'todos.db';

let db: SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;

  db = await openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'General',
      priority TEXT DEFAULT 'medium',
      dueDate TEXT,
      completed INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_priority ON todos(priority);
    CREATE INDEX IF NOT EXISTS idx_category ON todos(category);
  `);

  return db;
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

export async function addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  const result = await database.runAsync(
    `INSERT INTO todos (title, description, category, priority, dueDate, completed, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      todo.title,
      todo.description,
      todo.category,
      todo.priority,
      todo.dueDate,
      todo.completed ? 1 : 0,
      now,
      now,
    ]
  );

  return result.lastInsertRowId;
}

export async function updateTodo(id: number, todo: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: any[] = [];

  if (todo.title !== undefined) {
    updates.push('title = ?');
    values.push(todo.title);
  }
  if (todo.description !== undefined) {
    updates.push('description = ?');
    values.push(todo.description);
  }
  if (todo.category !== undefined) {
    updates.push('category = ?');
    values.push(todo.category);
  }
  if (todo.priority !== undefined) {
    updates.push('priority = ?');
    values.push(todo.priority);
  }
  if (todo.dueDate !== undefined) {
    updates.push('dueDate = ?');
    values.push(todo.dueDate);
  }
  if (todo.completed !== undefined) {
    updates.push('completed = ?');
    values.push(todo.completed ? 1 : 0);
  }

  updates.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  if (updates.length > 1) {
    await database.runAsync(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deleteTodo(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM todos WHERE id = ?', [id]);
}

export async function getAllTodos(): Promise<Todo[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<any>(
    'SELECT * FROM todos ORDER BY completed ASC, priority DESC, dueDate ASC, createdAt DESC'
  );

  return result.map(row => ({
    ...row,
    completed: Boolean(row.completed),
  }));
}

export async function getTodosByCategory(category: string): Promise<Todo[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<any>(
    'SELECT * FROM todos WHERE category = ? ORDER BY completed ASC, priority DESC, dueDate ASC',
    [category]
  );

  return result.map(row => ({
    ...row,
    completed: Boolean(row.completed),
  }));
}

export async function getTodoById(id: number): Promise<Todo | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<any>(
    'SELECT * FROM todos WHERE id = ?',
    [id]
  );

  if (!result) return null;

  return {
    ...result,
    completed: Boolean(result.completed),
  };
}

export async function getCategories(): Promise<string[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<{ category: string }>(
    'SELECT DISTINCT category FROM todos ORDER BY category ASC'
  );

  return result.map(row => row.category);
}

export async function searchTodos(query: string): Promise<Todo[]> {
  const database = await getDatabase();
  const searchQuery = `%${query}%`;
  const result = await database.getAllAsync<any>(
    'SELECT * FROM todos WHERE title LIKE ? OR description LIKE ? ORDER BY completed ASC, priority DESC, dueDate ASC',
    [searchQuery, searchQuery]
  );

  return result.map(row => ({
    ...row,
    completed: Boolean(row.completed),
  }));
}
