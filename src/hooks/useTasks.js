"use client";

import { useEffect, useState, useCallback } from "react";

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks || []);
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const addTask = useCallback(async ({ text, priority = 4, deadline = null }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, priority, deadline }),
    });
    if (!res.ok) return null;
    const { task } = await res.json();
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const patchTask = useCallback(async (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    );
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
    await refresh();
    return null;
  }, [refresh]);

  const deleteTask = useCallback(async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) await refresh();
  }, [refresh]);

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
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const completed = !task.completed;
      return patchTask(taskId, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
    },
    [tasks, patchTask],
  );

  const addSubtask = useCallback(
    (taskId, text) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = [
        ...(task.subtasks || []),
        { id: Date.now(), text, completed: false },
      ];
      return patchTask(taskId, { subtasks });
    },
    [tasks, patchTask],
  );

  const toggleSubtask = useCallback(
    (taskId, subtaskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = (task.subtasks || []).map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      );
      return patchTask(taskId, { subtasks });
    },
    [tasks, patchTask],
  );

  const deleteSubtask = useCallback(
    (taskId, subtaskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = (task.subtasks || []).filter((s) => s.id !== subtaskId);
      return patchTask(taskId, { subtasks });
    },
    [tasks, patchTask],
  );

  return {
    tasks,
    isLoading,
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