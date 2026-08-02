"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const ERROR_FLASH_MS = 4000;

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const clearError = useCallback(() => setError(null), []);



  const flashTaskError = useCallback((taskId) => {
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

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
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
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const addTask = useCallback(async ({ text, priority = 4, deadline = null }) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority, deadline }),
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
  }, []);

  const patchTask = useCallback(async (taskId, updates) => {
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
  }, [flashTaskError]);

  const deleteTask = useCallback(async (taskId) => {
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
    (taskId, newPriority) => patchTask(taskId, { priority: newPriority }),
    [patchTask],
  );

  const updateTaskDeadline = useCallback(
    (taskId, newDeadline) => patchTask(taskId, { deadline: newDeadline }),
    [patchTask],
  );

  const toggleComplete = useCallback(
    (taskId) => {
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (!task) return;
      const completed = !task.completed;
      return patchTask(taskId, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
    },
    [patchTask],
  );

  const addSubtask = useCallback(
    (taskId, text) => {
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = [
        ...(task.subtasks || []),
        { id: crypto.randomUUID(), text, completed: false },
      ];
      return patchTask(taskId, { subtasks });
    },
    [patchTask],
  );

  const toggleSubtask = useCallback(
    (taskId, subtaskId) => {
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = (task.subtasks || []).map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      );
      return patchTask(taskId, { subtasks });
    },
    [patchTask],
  );

  const deleteSubtask = useCallback(
    (taskId, subtaskId) => {
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = (task.subtasks || []).filter((s) => s.id !== subtaskId);
      return patchTask(taskId, { subtasks });
    },
    [patchTask],
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
