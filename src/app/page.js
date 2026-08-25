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
import sharedStyles from "@/components/components.module.css";
import { useSearch } from "@/components/SearchContext";

const sortByPriority = (tasks) =>
  [...tasks].sort((a, b) => {
    const completedDiff =
      Number(a.completed || false) - Number(b.completed || false);
    if (completedDiff !== 0) return completedDiff;
    return (a.priority || 4) - (b.priority || 4);
  });

function TaskRow({
  task,
  isActive,
  onSelect,
  onUpdatePriority,
  onToggleComplete,
  onDelete,
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li
      className={`relative flex items-center gap-2 rounded-2xl border px-[0.875rem] py-3 backdrop-blur-2xl backdrop-saturate-200 transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:gap-3 ${
        isActive
          ? "border-[var(--color-border-strong)] bg-[var(--color-surface-hover)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      } ${
        task.completed
          ? "!border-[var(--color-border-soft)] !bg-[var(--color-surface-soft)] opacity-40"
          : "hover:-translate-y-0.5 hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <input
        type="checkbox"
        className="checked:after:content-['✓'] h-5 w-5 flex-shrink-0 cursor-pointer appearance-none rounded-full border-2 border-[var(--color-border-strong)] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] checked:border-[var(--color-primary)] checked:bg-[var(--color-primary)] checked:after:relative checked:after:block checked:after:-translate-y-px checked:after:text-center checked:after:text-[13px] checked:after:text-[var(--color-primary-contrast)]"
        checked={task.completed || false}
        onChange={() => onToggleComplete(task.id)}
      />

      <button
        onClick={() => onSelect(task)}
        className={`min-w-0 flex-1 cursor-pointer overflow-hidden border-none bg-transparent p-0 text-left font-bold text-ellipsis whitespace-nowrap ${
          task.completed
            ? "text-[var(--color-faint)] line-through"
            : "text-[var(--color-heading)]"
        }`}
      >
        {task.text}
      </button>

      {task._status === "saving" && (
        <span
          className={`${sharedStyles.statusDot} ${sharedStyles.statusSaving}`}
          title="Saving…"
        />
      )}
      {task._status === "error" && (
        <span
          className={`${sharedStyles.statusDot} ${sharedStyles.statusError}`}
          title="Couldn't save — reverted"
        />
      )}

      <RemainingTime targetDate={task.deadline} />

      <PriorityDropdown
        currentPriority={task.priority || 4}
        onSelect={(newPriority) => onUpdatePriority(task.id, newPriority)}
      />

      {confirmingDelete ? (
        <span className={sharedStyles.confirmGroup}>
          <button onClick={() => onDelete(task.id)} className={sharedStyles.confirmYes}>
            Yes
          </button>
          <button onClick={() => setConfirmingDelete(false)} className={sharedStyles.confirmNo}>
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirmingDelete(true)}
          className="flex-shrink-0 cursor-pointer border-none bg-transparent p-1 text-base text-[var(--color-muted)] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-[var(--color-danger)]"
        >
          ✕
        </button>
      )}
    </li>
  );
}

const Todo_App = () => {
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

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { searchTerm } = useSearch();

  if (isLoading) {
    return (
      <main className="page-shell page-shell--cozy">
        <div className="page-shell-inner max-w-[72rem]">
          <div className="md:flex md:items-start md:gap-6">
            <div className="md:w-[380px] md:flex-shrink-0">
              <h3 className="mb-3 px-1 text-xl leading-7 font-bold text-[var(--color-heading)]">
                Tasks
              </h3>
              <TaskListSkeleton />
            </div>
            <div className="hidden md:sticky md:top-[100px] md:block md:flex-1">
              <TaskDetailsSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const sortedTasks = sortByPriority(tasks).filter((task) =>
    task.text.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );
  const defaultTask =
    sortedTasks.find((task) => !task.completed) || sortedTasks[0];
  const selectedTask =
    sortedTasks.find((task) => task.id === selectedTaskId) || defaultTask;

  const handleSelectTask = (task) => {
    if (isDesktop) {
      setSelectedTaskId(task.id);
    } else {
      router.push(`/tasks/${task.id}`);
    }
  };

  return (
    <main className="page-shell page-shell--cozy">
      <div className="page-shell-inner max-w-[72rem]">
        <div className="md:flex md:items-start md:gap-6">
          <div className="md:w-[380px] md:flex-shrink-0">
            <h3 className="mb-3 px-1 text-xl leading-7 font-bold text-[var(--color-heading)]">
              Tasks
            </h3>

            {sortedTasks.length === 0 ? (
              <p className="py-[0.625rem] text-center text-[0.95rem] text-[var(--color-heading)]">
                {searchTerm.trim() ? "No matching tasks found." : "No tasks added yet!"}
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
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

          <div className="hidden md:sticky md:top-[100px] md:block md:flex-1">
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
        <Toast message={error} onDismiss={clearError} />
      </div>
    </main>
  );
};

export default Todo_App;
