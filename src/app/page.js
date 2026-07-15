"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import styles from "./page.module.css";

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
    className={`${styles.taskRow} ${isActive ? styles.taskRowActive : ""} ${
      task.completed ? styles.taskRowCompleted : styles.taskRowHover
    }`}
  >
    <input
      type="checkbox"
      className={styles.checkbox}
      checked={task.completed || false}
      onChange={() => onToggleComplete(task.id)}
    />

    <button
      onClick={() => onSelect(task)}
      className={`${styles.taskTitleBtn} ${
        task.completed ? styles.taskTitleBtnCompleted : ""
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
      className={styles.deleteBtn}
    >
      ✕
    </button>
  </li>
);

const Todo_App = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const [tasks, setTasks] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    const loadAndMigrateTasks = () => {
      const sTasks = localStorage.getItem("todo_tasks");
      let loadedTasks = sTasks ? JSON.parse(sTasks) : [];

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
    setIsMounted(true);

    window.addEventListener("todo_tasks_updated", loadAndMigrateTasks);

    return () => {
      window.removeEventListener("todo_tasks_updated", loadAndMigrateTasks);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

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
    <div className={styles.appContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.leftColumn}>
          <h3 className={styles.heading}>Tasks</h3>

          {sortedTasks.length === 0 ? (
            <p className={styles.emptyText}>No tasks added yet!</p>
          ) : (
            <ul className={styles.taskList}>
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

        <div className={styles.rightColumn}>
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