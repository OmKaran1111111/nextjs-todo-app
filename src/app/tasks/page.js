"use client";

import { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import RemainingTime from "@/components/RemainingTime";
import Toast from "@/components/Toast";
import TaskDetails from "@/components/TaskDetails";
import { TaskListSkeleton } from "@/components/Skeleton";
import useTasks from "@/hooks/useTasks";
import { useSearch } from "@/components/SearchContext";
import DynamicForm from "@/components/DynamicForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PillBadge } from "@/components/ui/Badge";
import { PrimaryButton, ActionButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PRIORITIES, TONE_BADGE, TONE_DOT, getPriority } from "@/lib/priority";

const SORT_OPTIONS = [
  { key: "priority-asc", label: "Priority (Highest first)", id: "priority", desc: false },
  { key: "priority-desc", label: "Priority (Least first)", id: "priority", desc: true },
  { key: "deadline-asc", label: "Deadline (earliest first)", id: "deadline", desc: false },
  { key: "deadline-desc", label: "Deadline (Latest first)", id: "deadline", desc: true },
  { key: "text-asc", label: "Task Name (A → Z)", id: "text", desc: false },
  { key: "text-desc", label: "Task Name (Z → A)", id: "text", desc: true },
];

const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({ value: p.id, label: p.label, dotTone: TONE_DOT[p.tone] }));

const COLUMN_LABELS = {
  id: "Task ID",
  text: "Task Name",
  priority: "Priority",
  deadline: "Deadline",
  actions: "Actions",
};

// Cell text/layout — kept as class strings so the mobile "stacked card" rules
// (border/background/before:content) live right next to the desktop rules.
const cellBase =
  "flex items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-[0.85rem] py-[0.55rem] align-middle text-[0.82rem] text-[var(--color-body)] before:flex-shrink-0 before:text-left before:text-[0.7rem] before:font-semibold before:tracking-wide before:text-[var(--color-faint)] before:uppercase before:content-[attr(data-label)] sm:table-cell sm:before:content-none sm:[&:not(:last-child)]:border-b sm:group-last:border-b-0";

const actionHover = {
  view: "hover:border-[var(--color-info)] hover:text-[var(--color-info)]",
  edit: "hover:border-[var(--color-warning)] hover:text-[var(--color-warning)]",
  delete: "hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]",
};

const TaskList = () => {
  const searchParams = useSearchParams();
  const viewUserId = searchParams.get("userId");
  const viewUserName = searchParams.get("name");

  const {
    tasks,
    isLoading,
    error,
    clearError,
    addTask,
    deleteTask,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks(viewUserId);

  const [sorting, setSorting] = useState([{ id: "priority", desc: false }]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { searchTerm: searchQuery, setSearchTerm: setSearchQuery, addTaskSignal } = useSearch();
  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === "admin";

  const [sidePanelMode, setSidePanelMode] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const activeTask = useMemo(
    () => (activeTaskId ? tasks.find((t) => t.id === activeTaskId) || null : null),
    [tasks, activeTaskId]
  );
  const panelRef = useRef(null);

  useEffect(() => {
    if (sidePanelMode) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sidePanelMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") {
      setActiveTaskId(null);
      setSidePanelMode("add");
      window.history.replaceState(null, "", "/tasks");
    }
  }, []);

  useEffect(() => {
    if (addTaskSignal > 0) {
      setActiveTaskId(null);
      setSidePanelMode("add");
    }
  }, [addTaskSignal]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((task) =>
      task.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const escapeCsvValue = (value) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const downloadCSV = (list, filename) => {
    const headers = ["Task ID", "Task Name", "Priority", "Deadline", "Completed", "Subtasks"];
    const rows = list.map((t) => [
      t.id,
      t.text,
      (getPriority(t.priority || 4)).label,
      t.deadline || "",
      t.completed ? "Yes" : "No",
      (t.subtasks || []).length,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    downloadCSV(tasks, `tasks-all-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleView = (task) => {
    setActiveTaskId(task.id);
    setSidePanelMode("view");
  };

  const handleEdit = (task) => {
    setActiveTaskId(task.id);
    setSidePanelMode("edit");
  };

  const handleAddTaskSubmit = async (values) => {
    if (!values.text?.trim()) return { error: "Enter a task name." };

    await addTask({
      text: values.text,
      priority: Number(values.priority) || 4,
      deadline: values.deadline || null,
    });
  };

  const handleSaveEdit = async (values) => {
    const newPriority = Number(values.priority) || 4;
    const newDeadline = values.deadline || "";
    const tasksToRun = [];
    if (newPriority !== (activeTask.priority || 4)) {
      tasksToRun.push(updateTaskPriority(activeTask.id, newPriority));
    }
    if (newDeadline !== (activeTask.deadline || "")) {
      tasksToRun.push(updateTaskDeadline(activeTask.id, newDeadline || null));
    }
    await Promise.all(tasksToRun);
    setSidePanelMode("view");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Task ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-[0.82rem] tracking-wide text-[var(--color-muted)]" title={getValue()}>
            #{String(getValue()).slice(0, 8).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "text",
        header: "Task Name",
        cell: ({ getValue, row }) => {
          const subtasks = row.original.subtasks || [];
          return (
            <div className="flex flex-col items-end gap-1 text-right sm:items-start sm:text-left">
              <span
                className={
                  row.original.completed
                    ? "font-semibold text-[var(--color-faint)] line-through"
                    : "font-semibold text-[var(--color-heading)]"
                }
              >
                {getValue()}
              </span>
              {subtasks.length > 0 && (
                <span className="text-[0.75rem] text-[var(--color-faint)]">
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length} subtasks
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        sortingFn: (a, b) => (a.original.priority || 4) - (b.original.priority || 4),
        cell: ({ getValue }) => {
          const meta = getPriority(getValue() || 4);
          return (
            <PillBadge className={TONE_BADGE[meta.tone]}>
              <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${TONE_DOT[meta.tone]}`} />
              {meta.label}
            </PillBadge>
          );
        },
      },
      {
        accessorKey: "deadline",
        header: "Deadline",
        sortingFn: (a, b) =>
          new Date(a.original.deadline || 0) - new Date(b.original.deadline || 0),
        cell: ({ getValue }) =>
          getValue() ? (
            <div className="flex flex-col items-end gap-[0.2rem] sm:items-start">
              <span className="flex items-center gap-1 text-[0.78rem] text-[var(--color-body)]">
                <Icon name="calendar" size={13} className="text-[var(--color-faint)]" /> {getValue()}
              </span>
              <RemainingTime targetDate={getValue()} />
            </div>
          ) : (
            <span className="text-[0.78rem] text-[var(--color-faint)]">No deadline</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap justify-end gap-[0.35rem] sm:justify-start">
            <button
              type="button"
              className={`inline-flex cursor-pointer items-center gap-1 rounded-[0.45rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-[0.28rem] text-[0.72rem] text-[var(--color-body)] transition-all duration-150 ease-out ${actionHover.view}`}
              onClick={() => handleView(row.original)}
              title="View task"
            >
              <Icon name="eye" size={14} />
              <span className="hidden xl:inline">View</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-1 rounded-[0.45rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-[0.28rem] text-[0.72rem] text-[var(--color-body)] transition-all duration-150 ease-out ${actionHover.edit}`}
                onClick={() => handleEdit(row.original)}
                title="Edit task"
              >
                <Icon name="pencil" size={14} />
                <span className="hidden xl:inline">Edit</span>
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-1 rounded-[0.45rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-[0.28rem] text-[0.72rem] text-[var(--color-body)] transition-all duration-150 ease-out ${actionHover.delete}`}
                onClick={() => setDeleteTarget(row.original)}
                title="Delete task"
              >
                <Icon name="trash" size={14} />
                <span className="hidden xl:inline">Delete</span>
              </button>
            )}
          </div>
        ),
      },
    ],
    [isAdmin]
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteTask(deleteTarget.id);
    if (activeTask?.id === deleteTarget.id) {
      setSidePanelMode(null);
      setActiveTaskId(null);
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-5 pt-[90px] pb-[60px]">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-[0.85rem] flex flex-wrap items-center justify-between gap-3">
            <h3 className="mb-[0.2rem] text-base font-bold text-heading">Tasks</h3>
          </div>
          <TaskListSkeleton />
        </div>
      </div>
    );
  }

  const rows = table.getRowModel().rows;
  const splitOpen = Boolean(sidePanelMode);

  return (
    <div className="min-h-screen px-5 pt-[90px] pb-[60px]">
      <div
        className={`mx-auto max-w-[1100px] transition-[max-width] duration-300 ease-in-out md:items-start md:gap-7 ${
          splitOpen ? "md:flex md:max-w-[1500px]" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="w-full">
            <div className="mb-[0.85rem] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="mb-[0.2rem] text-base font-bold text-heading">
                  {viewUserId ? `Tasks — ${viewUserName || "user"}` : "Tasks"}
                </h3>
                <span className="text-xs text-faint">
                  {filteredTasks.length} {searchQuery ? "filtered" : "total"}
                </span>
                {viewUserId && (
                  <Link
                    href="/Manage_Users"
                    className="mt-[0.3rem] block text-[0.8rem] text-[var(--color-primary)] no-underline hover:underline"
                  >
                    ← Back to Manage Users
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-[0.4rem]">
                  <label htmlFor="task-sort-select" className="text-[0.8rem] font-semibold text-[var(--color-faint)]">
                    Sort
                  </label>
                  <select
                    id="task-sort-select"
                    className="h-10 cursor-pointer rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[0.6rem] text-[0.85rem] text-[var(--color-body)] focus:border-[var(--color-primary)] focus:outline-none"
                    value={
                      SORT_OPTIONS.find(
                        (o) => o.id === sorting[0]?.id && o.desc === sorting[0]?.desc
                      )?.key || ""
                    }
                    onChange={(e) => {
                      const opt = SORT_OPTIONS.find((o) => o.key === e.target.value);
                      if (opt) setSorting([{ id: opt.id, desc: opt.desc }]);
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <ActionButton tone="neutral" type="button" onClick={handleExportAll} className="!py-2 !text-[0.88rem]">
                  <Icon name="download" size={14} className="mr-1 inline-block align-[-2px]" /> Export
                </ActionButton>
                <PrimaryButton
                  type="button"
                  className="!mt-0 !py-2"
                  onClick={() => {
                    setActiveTaskId(null);
                    setSidePanelMode("add");
                  }}
                >
                  <Icon name="plus" size={14} className="mr-1 inline-block align-[-2px]" /> Add Task
                </PrimaryButton>
              </div>
            </div>

            <div
              className={`w-full max-h-[60vh] overflow-y-auto rounded-[0.85rem] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)] max-sm:overflow-visible max-sm:border-none max-sm:bg-transparent max-sm:shadow-none sm:overflow-x-auto ${
                splitOpen ? "[&_table]:min-w-[420px] [&_th]:px-[0.6rem] [&_th]:py-[0.45rem] [&_th]:text-[0.78rem] [&_td]:px-[0.6rem] [&_td]:py-[0.45rem] [&_td]:text-[0.78rem]" : "[&_table]:min-w-[540px]"
              }`}
            >
              <table className="w-full border-collapse max-sm:block max-sm:w-full">
                <thead className="max-sm:hidden">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="sticky top-0 border-b border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-[0.85rem] py-[0.55rem] text-left text-[0.72rem] font-semibold tracking-wide text-[var(--color-faint)] uppercase whitespace-nowrap"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="max-sm:block max-sm:w-full">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-7 text-center text-[var(--color-faint)]">
                        {searchQuery ? "No matching tasks found." : "No tasks added yet!"}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`group max-sm:mb-3 max-sm:block max-sm:w-full max-sm:rounded-[0.85rem] max-sm:border max-sm:border-[var(--color-border)] max-sm:bg-[var(--color-bg-elevated)] max-sm:px-[0.85rem] max-sm:py-[0.35rem] max-sm:shadow-[var(--shadow-card)] max-sm:last:mb-0 sm:hover:bg-[var(--color-surface-hover)] ${
                          row.original.completed ? "opacity-50" : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            data-label={COLUMN_LABELS[cell.column.id] || ""}
                            className={cellBase}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {sidePanelMode && (
          <div
            ref={panelRef}
            className="w-full [animation:fadeIn_0.25s_ease-out] md:sticky md:top-[100px] md:max-h-[calc(100vh-130px)] md:w-[420px] md:flex-shrink-0 md:overflow-y-auto"
          >
            <div className="mb-2 flex justify-end">
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-surface-muted)] text-[var(--color-heading)] transition-all duration-200 hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                onClick={() => setSidePanelMode(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {sidePanelMode === "view" && activeTask && (
              <TaskDetails
                task={activeTask}
                onUpdatePriority={updateTaskPriority}
                onUpdateDeadline={updateTaskDeadline}
                onToggleComplete={toggleComplete}
                onDelete={(id) => setDeleteTarget({ id })}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
              />
            )}

            {sidePanelMode === "add" && (
              <div className="my-[0.625rem] flex w-full flex-col gap-3">
                <h4 className="m-0 mb-1 text-xl font-bold text-[var(--color-heading)]">
                  Create a New Task
                </h4>
                <DynamicForm
                  variant="task"
                  onSubmit={handleAddTaskSubmit}
                  submitLabel="Add Task"
                  fields={[
                    { type: "text", name: "text", placeholder: "Enter a new task...", required: true },
                    {
                      type: "priority",
                      name: "priority",
                      label: "Priority",
                      defaultValue: 4,
                      options: PRIORITY_OPTIONS,
                    },
                    { type: "date", name: "deadline", label: "Deadline" },
                  ]}
                />
              </div>
            )}

            {sidePanelMode === "edit" && activeTask && (
              <div className="rounded-[1.25rem] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-lg)]">
                <h4 className="m-0 mb-1 text-xl font-bold text-[var(--color-heading)]">Edit Task</h4>
                <p className="m-0 text-sm break-words text-[var(--color-faint)]">{activeTask.text}</p>
                <DynamicForm
                  key={activeTask.id}
                  variant="task"
                  onSubmit={handleSaveEdit}
                  submitLabel="Save Changes"
                  cancelLabel="Cancel"
                  onCancel={() => setSidePanelMode("view")}
                  fields={[
                    {
                      type: "priority",
                      name: "priority",
                      label: "Priority",
                      defaultValue: activeTask.priority || 4,
                      options: PRIORITY_OPTIONS,
                    },
                    { type: "date", name: "deadline", label: "Deadline", defaultValue: activeTask.deadline || "" },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete this task?"
          body={`"${deleteTarget.text || "This task"}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          isBusy={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast message={error} onDismiss={clearError} />
    </div>
  );
};

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TaskList />
    </Suspense>
  );
}