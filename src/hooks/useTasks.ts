"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const ERROR_FLASH_MS = 4000;

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  priority: number;
  deadline: string | null;
  completed: boolean;
  completedAt: string | null;
  subtasks?: Subtask[];
  _status?: "saving" | "error";
}

export interface AddTaskInput {
  text: string;
  priority?: number;
  deadline?: string | null;
}

export interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  addTask: (input: AddTaskInput) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskPriority: (taskId: string, newPriority: number) => Promise<Task | null | undefined>;
  updateTaskDeadline: (taskId: string, newDeadline: string | null) => Promise<Task | null | undefined>;
  toggleComplete: (taskId: string) => Promise<Task | null | undefined>;
  addSubtask: (taskId: string, text: string) => Promise<Task | null | undefined>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<Task | null | undefined>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<Task | null | undefined>;
}

export default function useTasks(userId?: string | null): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;

  const clearError = useCallback(() => setError(null), []);

  const flashTaskError = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, _status: "error" } : t)),
    );
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId && t._status === "error"
            ? { ...t, _status: undefined }
            : t,
        ),
      );
    }, ERROR_FLASH_MS);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const url = userId ? `/api/tasks?userId=${userId}` : "/api/tasks";
      const res = await fetch(url);
      if (!res.ok) {
        setError("Couldn't load your tasks. Please try refreshing.");
        return;
      }
      const data = await res.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const addTask = useCallback(
    async ({ text, priority = 4, deadline = null }: AddTaskInput): Promise<Task | null> => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, priority, deadline, userId }),
        });
        if (!res.ok) {
          setError("Couldn't add the task. Please try again.");
          return null;
        }
        const { task } = await res.json();
        setTasks((prev) => [...prev, task]);
        return task;
      } catch {
        setError("Couldn't reach the server. Check your connection.");
        return null;
      }
    },
    [userId],
  );

  const patchTask = useCallback(
    async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
      const snapshot = tasksRef.current;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, ...updates, _status: "saving" } : t,
        ),
      );
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const { task } = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
          return task;
        }
        setTasks(snapshot);
        flashTaskError(taskId);
        setError("A change couldn't be saved, so it was reverted.");
        return null;
      } catch {
        setTasks(snapshot);
        flashTaskError(taskId);
        setError("Couldn't reach the server. The change was reverted.");
        return null;
      }
    },
    [flashTaskError],
  );

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    const snapshot = tasksRef.current;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        setTasks(snapshot);
        setError("Couldn't delete the task. Please try again.");
      }
    } catch {
      setTasks(snapshot);
      setError("Couldn't reach the server. The task was not deleted.");
    }
  }, []);

  const updateTaskPriority = useCallback(
    (taskId: string, newPriority: number) => patchTask(taskId, { priority: newPriority }),
    [patchTask],
  );

  const updateTaskDeadline = useCallback(
    (taskId: string, newDeadline: string | null) => patchTask(taskId, { deadline: newDeadline }),
    [patchTask],
  );

  const findTask = useCallback(
    (taskId: string): Task | undefined => tasksRef.current.find((t) => t.id === taskId),
    [],
  );

  const toggleComplete = useCallback(
    async (taskId: string) => {
      const task = findTask(taskId);
      if (!task) return undefined;
      const completed = !task.completed;
      return patchTask(taskId, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
    },
    [patchTask, findTask],
  );

  const addSubtask = useCallback(
    async (taskId: string, text: string) => {
      const task = findTask(taskId);
      if (!task) return undefined;
      const subtasks: Subtask[] = [
        ...(task.subtasks || []),
        { id: crypto.randomUUID(), text, completed: false },
      ];
      return patchTask(taskId, { subtasks });
    },
    [patchTask, findTask],
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = findTask(taskId);
      if (!task) return undefined;
      const subtasks = (task.subtasks || []).map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      );
      return patchTask(taskId, { subtasks });
    },
    [patchTask, findTask],
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = findTask(taskId);
      if (!task) return undefined;
      const subtasks = (task.subtasks || []).filter((s) => s.id !== subtaskId);
      return patchTask(taskId, { subtasks });
    },
    [patchTask, findTask],
  );

  return {
    tasks,
    isLoading,
    error,
    clearError,
    refresh,
    addTask,
    deleteTask,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}