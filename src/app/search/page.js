"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import styles from "./page.module.css";

const Search_Task = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [searchInput, setSearchInput] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return [];
    const storedTasks = localStorage.getItem("todo_tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const isFirstSave = useRef(true);

  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleClose = () => {
    router.push("/");
  };

  const handleUpdateTaskDeadline = (taskId, newDeadline) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task,
      ),
    );
  };

  const filteredTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.text.toLowerCase().includes(searchInput.trim().toLowerCase()),
  );

  const handleUpdateTaskPriority = (taskId, newPriority) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task,
      ),
    );
  };

  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
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

  const highestPriorityMatch =
    [...filteredTasks].sort((a, b) => (a.priority || 4) - (b.priority || 4))[0];
  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ||
    highestPriorityMatch;

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
                handleUpdateTaskDeadline(task.id, e.target.value)
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
            handleUpdateTaskPriority(task.id, newPriority)
          }
        />
      </div>
    </li>
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
            renderTaskItem(task, (t) => router.push(`/task/${t.id}`)),
          )}
        </ul>
      </div>
    </div>
  );
};

export default Search_Task;