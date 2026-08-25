"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskDetails from "@/components/TaskDetails";
import { TaskDetailsSkeleton } from "@/components/Skeleton";
import Toast from "@/components/Toast";
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
      <main className="page-shell page-shell--cozy page-shell--full-height">
        <div className="page-shell-inner max-w-[42rem]">
          <div className="pt-6">
            <TaskDetailsSkeleton />
          </div>
        </div>
      </main>
    );
  }

  const task = tasks.find((t) => String(t.id) === String(id));

  const handleDelete = (taskId) => {
    deleteTask(taskId);
    router.push("/");
  };

  return (
    <main
      className="page-shell page-shell--cozy page-shell--full-height"
      onClick={() => router.push("/")}
    >
      <div className="page-shell-inner max-w-[42rem]">
        <div className="pt-6" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </main>
  );
};

export default TaskPage;
