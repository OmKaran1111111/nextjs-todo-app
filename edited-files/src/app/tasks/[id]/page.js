"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskDetails from "@/components/TaskDetails";
import { TaskDetailsSkeleton } from "@/components/Skeleton";
import Toast from "@/components/Toast";
import styles from "./page.module.css";
import useTasks from "@/hooks/useTasks";
import PageShell from "@/components/PageShell";

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
      <PageShell padding="cozy" maxWidth="42rem" fullHeight>
        <div className={styles.innerSpacing}>
          <TaskDetailsSkeleton />
        </div>
      </PageShell>
    );
  }

  const task = tasks.find((t) => String(t.id) === String(id));

  const handleDelete = (taskId) => {
    deleteTask(taskId);
    router.push("/");
  };

  return (
    <PageShell
      padding="cozy"
      maxWidth="42rem"
      fullHeight
      onClick={() => router.push("/")}
    >
      <div className={styles.innerSpacing} onClick={(e) => e.stopPropagation()}>
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
      <Toast message={error} onDismiss={clearError} />
    </PageShell>
  );
};

export default TaskPage;
