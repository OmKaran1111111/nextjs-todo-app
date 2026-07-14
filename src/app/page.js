"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import { TOPBAR_HEIGHT } from "@/components/topbar";
import { FOOTER_HEIGHT } from "@/components/footer";

// Incomplete tasks first (highest priority = lowest number, first), then
// completed tasks at the bottom, also sorted by priority.
const sortByPriority = (tasks) =>
  [...tasks].sort((a, b) => {
    const completedDiff =
      Number(a.completed || false) - Number(b.completed || false);
    if (completedDiff !== 0) return completedDiff;
    return (a.priority || 4) - (b.priority || 4);
  });

const TaskRow = ({
  task,
  isActive,
  onSelect,
  onUpdatePriority,
  onUpdateDeadline,
  onToggleComplete,
  onDelete,
}) => (
  <li
    className={`flex items-center gap-2 sm:gap-3 relative px-3.5 py-3 rounded-2xl 
    backdrop-blur-xl backdrop-saturate-200 border transition-[transform,background-color,box-shadow] 
    duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
    ${isActive ? "border-white/70 bg-white/25" : "border-white/45"} 
    ${
      task.completed
        ? "opacity-40 !bg-[rgba(225,225,225,0.05)] !border-white/10"
        : "hover:-translate-y-0.5 hover:bg-white/25"
    }`}
  >
    <input
      type="checkbox"
      className="shrink-0 appearance-none w-5 h-5 border-2 border-[#aaa] rounded-full 
      cursor-pointer transition-all checked:bg-[var(--apple-blue,#0071e3)] 
      checked:border-[var(--apple-blue,#0071e3)] checked:after:content-['✓'] 
      checked:after:relative checked:after:block checked:after:text-center 
      checked:after:-translate-y-[1px] checked:after:text-[13px] checked:after:text-white"
      checked={task.completed || false}
      onChange={() => onToggleComplete(task.id)}
    />

    <button
      onClick={() => onSelect(task)}
      className={`flex-1 min-w-0 truncate text-left font-bold cursor-pointer 
      bg-transparent border-none p-0 ${
        task.completed ? "text-[#888] line-through" : "text-[#dae5f4]"
      }`}
    >
      {task.text}
    </button>

    <RemainingTime targetDate={task.deadline} />

    <PriorityDropdown
      currentPriority={task.priority || 4}
      onSelect={(newPriority) => onUpdatePriority(task.id, newPriority)}
    />

    <button
      onClick={() => onDelete(task.id)}
      className="shrink-0 bg-transparent border-none text-[#e0d5d5] text-base 
      cursor-pointer p-1 transition-all hover:text-red-500"
    >
      ✕
    </button>
  </li>
);

const Todo_App = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  // 1. Initialize as empty to guarantee SSR matches first render client-side
  const [tasks, setTasks] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // 2. Load, Migrate, and Listen all in one mounted effect
  useEffect(() => {
    const loadAndMigrateTasks = () => {
      const sTasks = localStorage.getItem("todo_tasks");
      let loadedTasks = sTasks ? JSON.parse(sTasks) : [];

      // Migration runs safely right here on the loaded data
      const needsMigration = loadedTasks.some(
        (task) => task.completed && !task.completedAt,
      );
      if (needsMigration) {
        loadedTasks = loadedTasks.map((task) =>
          task.completed && !task.completedAt
            ? { ...task, completedAt: new Date().toISOString() }
            : task,
        );
        localStorage.setItem("todo_tasks", JSON.stringify(loadedTasks));
      }

      setTasks(loadedTasks);
    };

    loadAndMigrateTasks();
    setIsMounted(true); // Signal that we are safe to render on client

    window.addEventListener("todo_tasks_updated", loadAndMigrateTasks);

    return () => {
      window.removeEventListener("todo_tasks_updated", loadAndMigrateTasks);
    };
  }, []);

  // 3. Save updates safely (only AFTER the page has fully loaded and mounted)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  // 4. Return null (or a skeleton layout) until mounting is finished.
  // This completely eliminates any Hydration Errors.
  if (!isMounted) {
    return null; 
  }

  const sortedTasks = sortByPriority(tasks);
  const defaultTask = sortedTasks.find((task) => !task.completed) || sortedTasks[0];
  const selectedTask =
    sortedTasks.find((task) => task.id === selectedTaskId) || defaultTask;

  const handleSelectTask = (task) => {
    if (isDesktop) {
      setSelectedTaskId(task.id);
    } else {
      router.push(`/task/${task.id}`);
    }
  };

  const handleUpdateTaskPriority = (taskId, newPriority) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task,
      ),
    );
  };

  const handleUpdateTaskDeadline = (taskId, newDeadline) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task,
      ),
    );
  };

  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null,
            }
          : task,
      ),
    );
  };

  const handleDeleteTask = (idToDelete) => {
    setTasks(tasks.filter((task) => task.id !== idToDelete));
    if (selectedTaskId === idToDelete) setSelectedTaskId(null);
  };

  const handleAddSubtask = (taskId, text) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...(task.subtasks || []),
                { id: Date.now(), text, completed: false },
              ],
            }
          : task,
      ),
    );
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask,
              ),
            }
          : task,
      ),
    );
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).filter(
                (subtask) => subtask.id !== subtaskId,
              ),
            }
          : task,
      ),
    );
  };

  return (
    <div style={{ paddingTop: TOPBAR_HEIGHT, paddingBottom: FOOTER_HEIGHT }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:flex md:items-start md:gap-6">
        {/* Left: task list */}
        <div className="md:w-[380px] md:shrink-0">
          <h3 className="mb-3 px-1 text-xl font-bold text-[#dae5f4]">Tasks</h3>

          {sortedTasks.length === 0 ? (
            <p className="text-[#dae5f4] text-[0.95rem] text-center py-2.5">
              No tasks added yet!
            </p>
          ) : (
            <ul className="list-none flex flex-col gap-2">
              {sortedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isActive={
                    isDesktop && !!selectedTask && selectedTask.id === task.id
                  }
                  onSelect={handleSelectTask}
                  onUpdatePriority={handleUpdateTaskPriority}
                  onUpdateDeadline={handleUpdateTaskDeadline}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Right: task details panel */}
        <div className="hidden md:block md:flex-1 md:sticky md:top-[100px]">
          <TaskDetails
            task={selectedTask}
            onUpdatePriority={handleUpdateTaskPriority}
            onUpdateDeadline={handleUpdateTaskDeadline}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        </div>
      </div>
    </div>
  );
};

export default Todo_App;