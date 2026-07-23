"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskDetails from "@/components/TaskDetails";
import styles from "./page.module.css";
import useTasks from "@/hooks/useTasks";

const TaskPage = () => {
  const { id } = useParams();
  const router = useRouter();
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

  if (isLoading) {
    return null;
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
    </div>
  );
};

export default TaskPage;