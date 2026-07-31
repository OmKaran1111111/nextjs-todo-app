"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import { TaskListSkeleton, TaskDetailsSkeleton } from "@/components/Skeleton";
import Toast from "@/components/Toast";
import useIsDesktop from "@/hooks/useIsDesktop";
import useTasks from "@/hooks/useTasks";
import styles from "./page.module.css";

const Search_Task = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const {
    tasks,
    isLoading,
    error,
    clearError,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();

  const [searchInput, setSearchInput] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleClose = () => {
    router.push("/");
  };

  const handleDeleteTask = (idToDelete) => {
    deleteTask(idToDelete);
    if (selectedTaskId === idToDelete) setSelectedTaskId(null);
  };

  if (isLoading) {
    return (
      <div className={styles.desktopContainer}>
        <div className={styles.desktopInner}>
          <div className={styles.leftColumn}>
            <h3 className={styles.headerTitle}>Search Tasks</h3>
            <TaskListSkeleton />
          </div>
          <div className={styles.rightColumn}>
            <TaskDetailsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.text.toLowerCase().includes(searchInput.trim().toLowerCase()),
  );

  const highestPriorityMatch =
    [...filteredTasks].sort((a, b) => (a.priority || 4) - (b.priority || 4))[0];
  
  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ||
    highestPriorityMatch ||
    null;

  const searchBox = (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className={styles.searchInput}
      />
    </form>
  );

  const renderTaskItem = (task, onSelectName) => (
    <li key={task.id} className={styles.taskItem}>
      <div className={styles.taskItemContent}>
        <div
          onClick={() => onSelectName(task)}
          className={`${styles.taskText} ${
            task.completed ? styles.taskTextCompleted : styles.taskTextPending
          }`}
        >
          {task.text}
        </div>
        <div className={styles.deadlineWrapper}>
          <span className={styles.emojiContainer}>
            📅
            <input
              type="date"
              className={styles.dateInput}
              value={task.deadline || ""}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) =>
                updateTaskDeadline(task.id, e.target.value)
              }
            />
          </span>
          <span className={styles.deadlineText}>{task.deadline}</span>
          <RemainingTime targetDate={task.deadline} />
        </div>
      </div>
      <div>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) =>
            updateTaskPriority(task.id, newPriority)
          }
        />
      </div>
    </li>
  );

  const rightColumnContent = selectedTask ? (
    <TaskDetails
      task={selectedTask}
      onUpdatePriority={updateTaskPriority}
      onUpdateDeadline={updateTaskDeadline}
      onToggleComplete={toggleComplete}
      onDelete={handleDeleteTask}
      onAddSubtask={addSubtask}
      onToggleSubtask={toggleSubtask}
      onDeleteSubtask={deleteSubtask}
    />
  ) : (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--faint)" }}>
      <p>No task selected or found.</p>
    </div>
  );

  if (isDesktop) {
    return (
      <div className={styles.desktopContainer} onClick={handleClose}>
        <div className={styles.desktopInner} onClick={(e) => e.stopPropagation()}>
          <div className={styles.leftColumn}>
            <div className={styles.headerWrapper}>
              <h3 className={styles.headerTitle}>Search Tasks</h3>
              <button onClick={handleClose} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            {searchBox}

            <ul className={styles.listDesktop}>
              {filteredTasks.map((task) =>
                renderTaskItem(task, (t) => setSelectedTaskId(t.id)),
              )}
            </ul>
          </div>

          <div className={styles.rightColumn}>
            {rightColumnContent}
          </div>
        </div>
        <Toast message={error} onDismiss={clearError} />
      </div>
    );
  }

  return (
    <div className={styles.mobileContainer} onClick={handleClose}>
      <div className={styles.mobileModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerWrapper}>
          <h3 className={styles.headerTitle}>Search Tasks</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        {searchBox}

        <ul className={styles.listMobile}>
          {filteredTasks.map((task) =>
            renderTaskItem(task, (t) => router.push(`/tasks/${t.id}`)),
          )}
        </ul>
      </div>
      <Toast message={error} onDismiss={clearError} />
    </div>
  );
};

export default Search_Task;