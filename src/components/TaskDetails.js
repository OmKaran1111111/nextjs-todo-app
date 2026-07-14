"use client";

import { useState } from "react";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";

const PRIORITY_INFO = {
  1: { label: "Priority 1 · Urgent", color: "text-red-400" },
  2: { label: "Priority 2 · High", color: "text-orange-400" },
  3: { label: "Priority 3 · Medium", color: "text-blue-400" },
  4: { label: "Priority 4 · None", color: "text-white/50" },
};

// Full detail view for a single task. Used both as the right-hand panel on
// the desktop homepage and as the whole page at /task/[id] on mobile.
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

  if (!task) {
    return (
      <div
        className="flex h-full min-h-[260px] items-center justify-center rounded-3xl 
        border border-white/20 bg-white/10 backdrop-blur-2xl backdrop-saturate-150 
        p-8 text-center text-[#9fb0c8]"
      >
        No tasks yet — add one to see its details here.
      </div>
    );
  }

  const priorityInfo = PRIORITY_INFO[task.priority || 4];

  return (
    <div
      className="flex h-full flex-col rounded-3xl border border-white/20 bg-white/10 
      backdrop-blur-2xl backdrop-saturate-150 p-5 sm:p-6 
      shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex w-fit items-center gap-1 rounded-full bg-black/[0.04] 
          px-3 py-1.5 text-sm text-[#dae5f4] transition-all hover:bg-white/10 cursor-pointer"
        >
          ← Back
        </button>
      )}

      <div className="flex items-start justify-between gap-3">
        <h2
          className={`text-2xl font-bold break-words ${
            task.completed ? "text-[#888] line-through" : "text-[#dae5f4]"
          }`}
        >
          {task.text}
        </h2>
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="shrink-0 rounded-full bg-transparent p-1.5 text-lg text-[#e0d5d5] 
          transition-all hover:bg-[#ef4444]/10 hover:text-red-500 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <label className="mt-4 flex w-fit items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task.id)}
          className="h-5 w-5 appearance-none rounded-full border-2 border-[#aaa] 
          cursor-pointer transition-all checked:bg-[var(--apple-blue,#0071e3)] 
          checked:border-[var(--apple-blue,#0071e3)] checked:after:content-['✓'] 
          checked:after:relative checked:after:block checked:after:text-center 
          checked:after:-translate-y-[1px] checked:after:text-[13px] checked:after:text-white"
        />
        <span className="text-sm text-[#c7d3e6]">
          {task.completed ? "Completed" : "Mark as complete"}
        </span>
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[#9fb0c8]">Priority</span>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) => onUpdatePriority(task.id, newPriority)}
        />
        <span className={`text-sm font-semibold ${priorityInfo.color}`}>
          {priorityInfo.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#9fb0c8]">Deadline</span>
        <span className="relative inline-block cursor-pointer text-xl">
          📅
          <input
            type="date"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={task.deadline || ""}
            onClick={(e) => e.target.showPicker()}
            onChange={(e) => onUpdateDeadline(task.id, e.target.value)}
          />
        </span>
        <span className="text-sm text-[#ff6565]">
          {task.deadline || "No deadline set"}
        </span>
        <RemainingTime targetDate={task.deadline} />
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <span className="mb-2 text-sm text-[#9fb0c8]">Subtasks</span>

        <ul className="mb-3 flex flex-col gap-1.5 overflow-y-auto">
          {(task.subtasks || []).length === 0 ? (
            <li className="text-sm text-white/40">No subtasks yet</li>
          ) : (
            (task.subtasks || []).map((subtask) => (
              <li
                key={subtask.id}
                className="flex items-center gap-2 rounded-xl border border-white/15 
                bg-white/5 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={subtask.completed || false}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                  className="h-4 w-4 shrink-0 appearance-none rounded-full border-2 
                  border-[#aaa] cursor-pointer transition-all 
                  checked:bg-[var(--apple-blue,#0071e3)] checked:border-[var(--apple-blue,#0071e3)] 
                  checked:after:content-['✓'] checked:after:relative checked:after:block 
                  checked:after:text-center checked:after:-translate-y-[2px] 
                  checked:after:text-[11px] checked:after:text-white"
                />
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${
                    subtask.completed
                      ? "text-[#888] line-through"
                      : "text-[#dae5f4]"
                  }`}
                >
                  {subtask.text}
                </span>
                <button
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className="shrink-0 bg-transparent border-none text-[#e0d5d5] 
                  text-sm cursor-pointer p-1 transition-all hover:text-red-500"
                >
                  ✕
                </button>
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
            className="flex-1 rounded-xl border border-black/10 bg-white/50 px-3 py-2 
            text-sm text-[var(--text-main)] outline-none transition-all duration-200 
            focus:bg-white focus:border-[var(--apple-blue)] 
            focus:shadow-[0_0_0_4px_rgba(0,113,227,0.15)]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl border-none bg-[var(--apple-blue)] px-4 py-2 
            text-sm font-medium text-white cursor-pointer transition-colors duration-200 
            hover:bg-[var(--apple-blue-hover)] active:scale-[0.97]"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;