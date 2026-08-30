"use client";

import { useParams, useRouter } from "next/navigation";
import TaskDetails from "@/components/TaskDetails";
import { TaskDetailsSkeleton } from "@/components/Skeleton";
import Toast from "@/components/Toast";
import useTasks from "@/hooks/useTasks";

/*
 * Task is derived directly from useTasks' real return type instead of a
 * hand-written interface, so it always matches the hook exactly.
 */
type Task = ReturnType<typeof useTasks>["tasks"][number];

const TaskPage = () => {
  const { id } = useParams<{ id: string }>();
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

  const task: Task | undefined = tasks.find((t) => String(t.id) === String(id));

  const handleDelete = (taskId: string) => {
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