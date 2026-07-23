"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import styles from "./page.module.css";
import useTasks from "@/hooks/useTasks";
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
  const {
    tasks,
    isLoading,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  if (isLoading) {
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
                  onUpdatePriority={updateTaskPriority}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteTask}
                />
              ))}
            </ul>
          )}
        </div>

        <div className={styles.rightColumn}>
          <TaskDetails
            task={selectedTask}
            onUpdatePriority={updateTaskPriority}
            onUpdateDeadline={updateTaskDeadline}
            onToggleComplete={toggleComplete}
            onDelete={deleteTask}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
          />
        </div>
      </div>
    </div>
  );
};

export default Todo_App;