// ---------------------------------------------------------------------------
// Domain / DB types (unchanged from your original file)
// ---------------------------------------------------------------------------

import type { SVGProps } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  verified: number;
  isBanned?: number;
  createdAt: string;
  role: string;
}

/**
 * DB-shaped task record (server/API model). NOTE: the task-list feature
 * (page.js -> useTasks -> TaskDetails/PriorityDropdown) does NOT use this
 * shape at runtime — see `ClientTask` below. Keeping this separate rather
 * than trying to unify them, since they genuinely have different fields
 * (title vs text, dueDate vs deadline, string vs numeric priority).
 */
export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: string;
  dueDate: string | null;
  completed: number;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  userAgent: string;
  deviceName?: string;
  appVersion?: string;
  revoked: number;
  createdAt: string;
}

export interface PairingCode {
  code: string;
  userId: string;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Priority — re-exported from lib/priority, NOT redefined here.
// `lib/priority.ts` is the single source of truth for `Priority`/`Tone`;
// duplicating them caused the earlier "Priority is not assignable to
// Priority" / Record<Tone, string> indexing errors.
// ---------------------------------------------------------------------------

export type { Priority, Tone } from "@/lib/priority";

// ---------------------------------------------------------------------------
// Client-side task shape actually used by PriorityDropdown.tsx / TaskDetails.tsx,
// matching how page.js reads/writes tasks (task.text, task.priority as a
// number matching Priority.id, task.deadline, task.completed, task.subtasks).
// ---------------------------------------------------------------------------

export interface Subtask {
  id: string;
  text: string;
  completed?: boolean;
}

export type TaskStatus = "saving" | "error";

export interface ClientTask {
  id: string;
  text: string;
  completed?: boolean;
  /** Matches Priority.id in lib/priority (1-4). */
  priority?: number;
  deadline?: string | null;
  subtasks?: Subtask[];
  /** Optimistic-update indicator set client-side while a save is in flight or has failed. */
  _status?: TaskStatus;
}

// ---------------------------------------------------------------------------
// UI components — matching the real Icon.js / RemainingTime.js
// ---------------------------------------------------------------------------

export type IconName =
  | "menu"
  | "close"
  | "search"
  | "sun"
  | "moon"
  | "pin"
  | "eye"
  | "pencil"
  | "trash"
  | "download"
  | "plus"
  | "calendar"
  | "check"
  | "chevronLeft"
  | "mail"
  | "lock"
  | "eyeOff";

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export interface RemainingTimeProps {
  targetDate?: string | null;
}

// ---------------------------------------------------------------------------
// TaskDetails callback signatures, matching how page.js wires them up
// (updateTaskPriority, updateTaskDeadline, toggleComplete, etc. from useTasks).
// ---------------------------------------------------------------------------

export type OnUpdatePriority = (taskId: string, priority: number) => void;
export type OnUpdateDeadline = (taskId: string, deadline: string | null) => void;
export type OnToggleComplete = (taskId: string) => void;
export type OnDeleteTask = (taskId: string) => void;
export type OnAddSubtask = (taskId: string, text: string) => void;
export type OnToggleSubtask = (taskId: string, subtaskId: string) => void;
export type OnDeleteSubtask = (taskId: string, subtaskId: string) => void;