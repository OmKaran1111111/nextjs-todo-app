import db from "@/lib/db";
import crypto from "crypto";

function rowToTask(row) {
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

export function getTasksForUser(userId) {
  const rows = db
    .prepare("SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt ASC")
    .all(userId);
  return rows.map(rowToTask);
}

export function getTaskForUser(taskId, userId) {
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND userId = ?")
    .get(taskId, userId);
  return rowToTask(row);
}

export function createTaskForUser(userId, { text, priority = 4, deadline = null }) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO tasks (id, userId, text, priority, completed, completedAt, deadline, subtasks, createdAt)
     VALUES (?, ?, ?, ?, 0, NULL, ?, '[]', ?)`,
  ).run(id, userId, text, priority, deadline, createdAt);
  return getTaskForUser(id, userId);
}

export function getTaskById(taskId) {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  return rowToTask(row);
}

export function updateTask(taskId, updates) {
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

export function deleteTask(taskId) {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  return result.changes > 0;
}