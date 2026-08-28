import db from "@/lib/db";
import crypto from "crypto";

export interface Task {
  id: string;
  text: string;
  priority: number;
  completed: boolean;
  completedAt: string | null;
  deadline: string | null;
  subtasks: unknown[];
  createdAt: string;
}

export interface CreateTaskInput {
  text: string;
  priority?: number;
  deadline?: string | null;
}

export type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">>;

interface TaskRow {
  id: string;
  userId: string;
  text: string;
  priority: number;
  completed: number;
  completedAt: string | null;
  deadline: string | null;
  subtasks: string | null;
  createdAt: string;
}

function rowToTask(row: TaskRow | undefined): Task | null {
  if (!row) return null;
  return {
    id: row.id,
    text: row.text,
    priority: row.priority,
    completed: !!row.completed,
    completedAt: row.completedAt || null,
    deadline: row.deadline || null,
    subtasks: row.subtasks ? JSON.parse(row.subtasks) : [],
    createdAt: row.createdAt,
  };
}

export function getTasksForUser(userId: string): Task[] {
  const rows = db
    .prepare("SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt ASC")
    .all(userId) as TaskRow[];
  return rows.map((row) => rowToTask(row) as Task);
}

export function getTaskForUser(taskId: string, userId: string): Task | null {
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND userId = ?")
    .get(taskId, userId) as TaskRow | undefined;
  return rowToTask(row);
}

export function createTaskForUser(
  userId: string,
  { text, priority = 4, deadline = null }: CreateTaskInput
): Task | null {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO tasks (id, userId, text, priority, completed, completedAt, deadline, subtasks, createdAt)
     VALUES (?, ?, ?, ?, 0, NULL, ?, '[]', ?)`,
  ).run(id, userId, text, priority, deadline, createdAt);
  return getTaskForUser(id, userId);
}

export function getTaskById(taskId: string): Task | null {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as TaskRow | undefined;
  return rowToTask(row);
}

export function updateTask(taskId: string, updates: UpdateTaskInput): Task | null {
  const existing = getTaskById(taskId);
  if (!existing) return null;

  const next = { ...existing, ...updates };

  db.prepare(
    `UPDATE tasks
     SET text = ?, priority = ?, completed = ?, completedAt = ?, deadline = ?, subtasks = ?
     WHERE id = ?`,
  ).run(
    next.text,
    next.priority || 4,
    next.completed ? 1 : 0,
    next.completedAt || null,
    next.deadline || null,
    JSON.stringify(next.subtasks || []),
    taskId,
  );

  return getTaskById(taskId);
}

export function deleteTask(taskId: string): boolean {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  return result.changes > 0;
}