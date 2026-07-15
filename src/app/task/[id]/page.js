"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskDetails from "@/components/TaskDetails";

const TaskPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const isFirstSave = useRef(true);

  const [tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("todo_tasks");
    return stored ? JSON.parse(stored) : [];
  });

  const persist = (nextTasks) => {
    if (isFirstSave.current) {
      	  isFirstSave.current = false;
    	  return;
   	 	}
    setTasks(nextTasks);
    localStorage.setItem("todo_tasks", JSON.stringify(nextTasks));
    window.dispatchEvent(new Event("todo_tasks_updated"));
  };

  const task = tasks.find((t) => String(t.id) === String(id));

  const handleUpdatePriority = (taskId, newPriority) =>
    persist(
      tasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t)),
    );

  const handleUpdateDeadline = (taskId, newDeadline) =>
    persist(
      tasks.map((t) => (t.id === taskId ? { ...t, deadline: newDeadline } : t)),
    );

  const handleToggleComplete = (taskId) =>
    persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t,
      ),
    );

  const handleDelete = (taskId) => {
    persist(tasks.filter((t) => t.id !== taskId));
    router.push("/");
  };

  const handleAddSubtask = (taskId, text) =>
    persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...(t.subtasks || []),
                { id: Date.now(), text, completed: false },
              ],
            }
          : t,
      ),
    );

  const handleToggleSubtask = (taskId, subtaskId) =>
    persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: (t.subtasks || []).map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask,
              ),
            }
          : t,
      ),
    );

  const handleDeleteSubtask = (taskId, subtaskId) =>
    persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: (t.subtasks || []).filter(
                (subtask) => subtask.id !== subtaskId,
              ),
            }
          : t,
      ),
    );

  return (
    <div className="min-h-screen" onClick={() => router.push("/")}>
      <div
        className="pt-[75px] pb-[70px] mx-auto max-w-2xl px-4 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6">
          <TaskDetails
            task={task}
            onUpdatePriority={handleUpdatePriority}
            onUpdateDeadline={handleUpdateDeadline}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onBack={() => router.push("/")}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskPage;