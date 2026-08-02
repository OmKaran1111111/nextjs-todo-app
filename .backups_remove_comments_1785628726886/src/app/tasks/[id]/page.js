"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskDetails from "@/components/TaskDetails";
import { TaskDetailsSkeleton } from "@/components/Skeleton";
import Toast from "@/components/Toast";
import styles from "./page.module.css";
import useTasks from "@/hooks/useTasks";

const TaskPage = () => {
  const { id } = useParams();
  const router = useRouter();
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

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.innerContainer}>
            <TaskDetailsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const task = tasks.find((t) => String(t.id) === String(id));

  const handleDelete = (taskId) => {
    deleteTask(taskId);
    router.push("/");
  };

  return (
    <div className={styles.pageContainer} onClick={() => router.push("/")}>
      <div
        className={styles.contentWrapper}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.innerContainer}>
          <TaskDetails
            task={task}
            onUpdatePriority={updateTaskPriority}
            onUpdateDeadline={updateTaskDeadline}
            onToggleComplete={toggleComplete}
            onDelete={handleDelete}
            onBack={() => router.push("/")}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
          />
        </div>
      </div>
      <Toast message={error} onDismiss={clearError} />
    </div>
  );
};

export default TaskPage;