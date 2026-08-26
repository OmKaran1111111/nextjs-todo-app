"use client";

import { useState, useEffect } from "react";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";

const PRIORITY_INFO = {
  1: { label: "Priority 1 · Urgent", colorClass: "text-danger" },
  2: { label: "Priority 2 · High", colorClass: "text-warning" },
  3: { label: "Priority 3 · Medium", colorClass: "text-info" },
  4: { label: "Priority 4 · None", colorClass: "text-faint" },
};

const confirmGroupClass = "inline-flex items-center gap-2 shrink-0";
const confirmTextClass = "text-xs text-muted whitespace-nowrap";
const confirmYesClass =
  "bg-danger text-white border-0 rounded-md py-1 px-2.5 text-xs cursor-pointer hover:opacity-90";
const confirmNoClass =
  "bg-transparent border border-border-strong text-body rounded-md py-1 px-2.5 text-xs cursor-pointer hover:bg-surface-muted";

const TaskDetails = ({
  task,
  onUpdatePriority,
  onUpdateDeadline,
  onToggleComplete,
  onDelete,
  onBack,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [subtaskInput, setSubtaskInput] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingSubtaskId, setConfirmingSubtaskId] = useState(null);

  useEffect(() => {
    setConfirmingDelete(false);
    setConfirmingSubtaskId(null);
  }, [task?.id]);

  if (!task) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center rounded-3xl border border-border bg-surface-soft backdrop-blur-[40px] [backdrop-filter:blur(40px)_saturate(150%)] p-8 text-center text-muted">
        No tasks yet — add one to see its details here.
      </div>
    );
  }

  const priorityInfo = PRIORITY_INFO[task.priority || 4];

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-surface-soft backdrop-blur-[40px] [backdrop-filter:blur(40px)_saturate(150%)] p-5 sm:p-6 shadow-card-lg">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex w-max items-center gap-1 rounded-full bg-surface-muted border-0 py-1.5 px-3 text-sm text-heading transition-all duration-150 cursor-pointer hover:bg-surface-hover"
        >
          ← Back
        </button>
      )}

      <div className="flex items-start justify-between gap-3">
        <h2
          className={`text-2xl font-bold break-words m-0 ${
            task.completed ? "text-faint line-through" : "text-heading"
          }`}
        >
          {task.text}
        </h2>
        {task._status === "saving" && (
          <span
            className="inline-block w-2 h-2 rounded-full ml-1.5 shrink-0 bg-info animate-pulse"
            title="Saving…"
          />
        )}
        {task._status === "error" && (
          <span
            className="inline-block w-2 h-2 rounded-full ml-1.5 shrink-0 bg-danger"
            title="Couldn't save — reverted"
          />
        )}
        {confirmingDelete ? (
          <span className={confirmGroupClass}>
            <span className={confirmTextClass}>Delete task?</span>
            <button onClick={() => onDelete(task.id)} className={confirmYesClass}>
              Yes
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className={confirmNoClass}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            title="Delete task"
            className="shrink-0 rounded-full bg-transparent border-0 py-1.5 px-1.5 text-lg text-muted transition-all duration-150 cursor-pointer hover:bg-danger-soft hover:text-danger"
          >
            ✕
          </button>
        )}
      </div>

      <label className="mt-4 flex w-max items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task.id)}
          className="h-5 w-5 appearance-none rounded-full border-2 border-border-strong cursor-pointer transition-all duration-150 relative checked:bg-primary checked:border-primary [&:checked::after]:content-['✓'] [&:checked::after]:relative [&:checked::after]:block [&:checked::after]:text-center [&:checked::after]:-translate-y-px [&:checked::after]:text-[13px] [&:checked::after]:text-primary-contrast"
        />
        <span className="text-sm text-body">
          {task.completed ? "Completed" : "Mark as complete"}
        </span>
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">Priority</span>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) => onUpdatePriority(task.id, newPriority)}
        />
        <span className={`text-sm font-semibold ${priorityInfo.colorClass}`}>
          {priorityInfo.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Deadline</span>
        <span className="relative inline-block cursor-pointer text-xl">
          📅
          <input
            type="date"
            className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
            value={task.deadline || ""}
            onClick={(e) => e.target.showPicker()}
            onChange={(e) => onUpdateDeadline(task.id, e.target.value)}
          />
        </span>
        <span className="text-sm text-danger">
          {task.deadline || "No deadline set"}
        </span>
        <RemainingTime targetDate={task.deadline} />
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <span className="mb-2 text-sm text-muted">Subtasks</span>

        <ul className="mb-3 flex flex-col gap-1.5 overflow-y-auto list-none p-0">
          {(task.subtasks || []).length === 0 ? (
            <li className="text-sm text-faint">No subtasks yet</li>
          ) : (
            (task.subtasks || []).map((subtask) => (
              <li
                key={subtask.id}
                className="flex items-center gap-2 rounded-xl border border-border-soft bg-surface-muted py-2 px-3"
              >
                <input
                  type="checkbox"
                  checked={subtask.completed || false}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                  className="h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-border-strong cursor-pointer transition-all duration-150 relative checked:bg-primary checked:border-primary [&:checked::after]:content-['✓'] [&:checked::after]:relative [&:checked::after]:block [&:checked::after]:text-center [&:checked::after]:-translate-y-0.5 [&:checked::after]:text-[11px] [&:checked::after]:text-primary-contrast"
                />
                <span
                  className={`min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm ${
                    subtask.completed ? "text-faint line-through" : "text-heading"
                  }`}
                >
                  {subtask.text}
                </span>
                {confirmingSubtaskId === subtask.id ? (
                  <span className={confirmGroupClass}>
                    <button
                      onClick={() => {
                        onDeleteSubtask(task.id, subtask.id);
                        setConfirmingSubtaskId(null);
                      }}
                      className={confirmYesClass}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmingSubtaskId(null)}
                      className={confirmNoClass}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmingSubtaskId(subtask.id)}
                    className="shrink-0 bg-transparent border-0 text-muted text-sm cursor-pointer p-1 transition-all duration-150 hover:text-danger"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))
          )}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subtaskInput.trim()) return;
            onAddSubtask(task.id, subtaskInput.trim());
            setSubtaskInput("");
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            placeholder="Add a subtask..."
            className="flex-1 rounded-xl border border-border bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] py-2 px-3 text-sm text-heading outline-none transition-all duration-200 focus:bg-bg-elevated focus:border-primary focus:shadow-[0_0_0_4px_var(--color-info-soft)]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl border-0 bg-primary py-2 px-4 text-sm font-medium text-primary-contrast cursor-pointer transition-colors transition-transform duration-200 hover:bg-primary-hover active:scale-[0.97]"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;
