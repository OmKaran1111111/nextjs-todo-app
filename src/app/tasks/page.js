"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import RemainingTime from "@/components/RemainingTime";
import Toast from "@/components/Toast";
import TaskDetails from "@/components/TaskDetails";
import PriorityDropdown from "@/components/PriorityDropdown";
import { TaskListSkeleton } from "@/components/Skeleton";
import useTasks from "@/hooks/useTasks";
import { useSearch } from "@/components/SearchContext";
import "./page.css";

const SORT_OPTIONS = [
  { key: "priority-asc", label: "Priority (Highest first)", id: "priority", desc: false },
  { key: "priority-desc", label: "Priority (Least first)", id: "priority", desc: true },
  { key: "deadline-asc", label: "Deadline (earliest first)", id: "deadline", desc: false },
  { key: "deadline-desc", label: "Deadline (Latest first)", id: "deadline", desc: true },
  { key: "text-asc", label: "Task Name (A → Z)", id: "text", desc: false },
  { key: "text-desc", label: "Task Name (Z → A)", id: "text", desc: true },
];

const PRIORITY_META = {
  1: { label: "Priority 1", emoji: "🔴", tone: "danger" },
  2: { label: "Priority 2", emoji: "🟠", tone: "warning" },
  3: { label: "Priority 3", emoji: "🔵", tone: "info" },
  4: { label: "No Priority", emoji: "⚪", tone: "muted" },
};

const PRIORITY_OPTIONS = [
  { id: 1, label: "Priority 1", emoji: "🔴" },
  { id: 2, label: "Priority 2", emoji: "🟠" },
  { id: 3, label: "Priority 3", emoji: "🔵" },
  { id: 4, label: "Priority 4 (None)", emoji: "⚪" },
];

const EditTaskForm = ({ task, onSave, onCancel }) => {
  const [priority, setPriority] = useState(task?.priority || 4);
  const [deadline, setDeadline] = useState(task?.deadline || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setPriority(task.priority || 4);
      setDeadline(task.deadline || "");
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(task.id, priority, deadline);
    setIsSaving(false);
  };

  return (
    <form className="edit-form-container" onSubmit={handleSubmit}>
      <h4 className="side-panel-title">Edit Task</h4>
      <p className="side-panel-subtitle">{task.text}</p>

      <label className="field-label" htmlFor="priority">
        Priority
      </label>
      <div className="priority-grid">
        {PRIORITY_OPTIONS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`priority-option ${
              priority === p.id ? "priority-option-active" : ""
            }`}
            onClick={() => setPriority(p.id)}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="deadline">
        Deadline
      </label>
      <input
        id="deadline"
        type="date"
        className="date-input"
        value={deadline || ""}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <div className="actions-row">
        <button
          type="button"
          className="cancel-btn"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button type="submit" className="save-btn" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

const TaskList = () => {
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
  } = useTasks();

  const [sorting, setSorting] = useState([{ id: "priority", desc: false }]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

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

  const [inputValue, setInputValue] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(4);
  const [deadline, setDeadline] = useState(null);

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

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportMenuOpen]);

  const escapeCsvValue = (value) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const downloadCSV = (list, filename) => {
    const headers = ["Task ID", "Task Name", "Priority", "Deadline", "Completed", "Subtasks"];
    const rows = list.map((t) => [
      t.id,
      t.text,
      (PRIORITY_META[t.priority || 4] || PRIORITY_META[4]).label,
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
    setExportMenuOpen(false);
  };

  const handleExportFiltered = () => {
    downloadCSV(filteredTasks, `tasks-filtered-${new Date().toISOString().slice(0, 10)}.csv`);
    setExportMenuOpen(false);
  };

  const handleView = (task) => {
    setActiveTaskId(task.id);
    setSidePanelMode("view");
  };

  const handleEdit = (task) => {
    setActiveTaskId(task.id);
    setSidePanelMode("edit");
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await addTask({
      text: inputValue,
      priority: selectedPriority,
      deadline,
    });

    setInputValue("");
    setSelectedPriority(4);
    setDeadline(null);
  };

  const handleSaveEdit = async (taskId, newPriority, newDeadline) => {
    const tasksToRun = [];
    if (newPriority !== (activeTask.priority || 4)) {
      tasksToRun.push(updateTaskPriority(taskId, newPriority));
    }
    if (newDeadline !== (activeTask.deadline || "")) {
      tasksToRun.push(updateTaskDeadline(taskId, newDeadline || null));
    }
    await Promise.all(tasksToRun);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Task ID",
        cell: ({ getValue }) => (
          <span className="task-id-cell" title={getValue()}>
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
            <div className="task-name-cell">
              <span className={row.original.completed ? "task-name-completed" : ""}>
                {getValue()}
              </span>
              {subtasks.length > 0 && (
                <span className="subtask-count-chip">
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
          const meta = PRIORITY_META[getValue() || 4] || PRIORITY_META[4];
          return (
            <span className={`priority-badge priority-badge-${meta.tone}`}>
              {meta.emoji} {meta.label}
            </span>
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
            <div className="deadline-cell">
              <span className="deadline-date">📅 {getValue()}</span>
              <RemainingTime targetDate={getValue()} />
            </div>
          ) : (
            <span className="no-deadline">No deadline</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              type="button"
              className="action-btn action-btn-view"
              onClick={() => handleView(row.original)}
              title="View task"
            >
              👁 View
            </button>
            {isAdmin && (
              <button
                type="button"
                className="action-btn action-btn-edit"
                onClick={() => handleEdit(row.original)}
                title="Edit task"
              >
                ✎ Edit
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className="action-btn action-btn-delete"
                onClick={() => setDeleteTarget(row.original)}
                title="Delete task"
              >
                🗑 Delete
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
      <div className="tasks-page-wrap">
        <div className="tasks-panel">
          <div className="tasks-header-row">
            <div>
              <h3 className="section-title">Tasks</h3>
            </div>
          </div>
          <TaskListSkeleton />
        </div>
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="desktop-container">
      <div className={`desktop-content ${sidePanelMode ? "layout-split" : ""}`}>
        
        <div className="table-area">
          <div className="tasks-panel">
            <div className="tasks-header-row">
              <div>
                <h3 className="section-title">Tasks</h3>
                <span className="tasklist-count">
                  {filteredTasks.length} {searchQuery ? "filtered" : "total"}
                </span>
              </div>
              <div className="header-actions">
                <div className="sort-menu-wrapper">
                  <label htmlFor="task-sort-select" className="sort-menu-label">
                    Sort
                  </label>
                  <select
                    id="task-sort-select"
                    className="sort-menu-select"
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
                <div className="export-menu-wrapper" ref={exportMenuRef}>
                  <button
                    type="button"
                    className="export-header-btn"
                    onClick={() => setExportMenuOpen((v) => !v)}
                  >
                    ⬇ Export
                  </button>
                  {exportMenuOpen && (
                    <div className="export-dropdown-menu">
                      <button type="button" onClick={handleExportAll}>
                        All tasks ({tasks.length})
                      </button>
                      <button type="button" onClick={handleExportFiltered}>
                        Filtered / visible tasks ({filteredTasks.length})
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="add-task-header-btn"
                  onClick={() => {
                    setActiveTaskId(null);
                    setSidePanelMode("add");
                  }}
                >
                  + Add Task
                </button>
              </div>
            </div>

            <div className="task-table-wrapper">
              <table className="task-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="empty-row">
                        {searchQuery ? "No matching tasks found." : "No tasks added yet!"}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className={row.original.completed ? "row-completed" : ""}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
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
          <div className="sticky-details" ref={panelRef}>
            <div className="side-panel-header">
              <button className="close-btn" onClick={() => setSidePanelMode(null)}>✕</button>
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
              <form onSubmit={handleAddTaskSubmit} className="add-task-form">
                <h4 className="side-panel-title">Create a New Task</h4>
                <input
                  type="text"
                  placeholder="Enter a new task..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="task-input"
                />
                <div className="date-picker-wrapper">
                  <span className="date-icon-wrapper">
                    📅
                    <input
                      type="date"
                      className="date-input-hidden"
                      value={deadline || ""}
                      onClick={(e) => e.target.showPicker()}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </span>
                  {deadline ? (
                    <span className="deadline-text-danger">{deadline}</span>
                  ) : (
                    <span className="deadline-text-faint">No deadline set</span>
                  )}
                </div>
                <div className="form-bottom-row">
                  <div className="priority-wrapper">
                    <PriorityDropdown
                      currentPriority={selectedPriority}
                      onSelect={setSelectedPriority}
                    />
                    <span className="priority-label">Priority</span>
                  </div>
                  <button type="submit" className="add-task-btn">
                    Add Task
                  </button>
                </div>
              </form>
            )}

            {sidePanelMode === "edit" && activeTask && (
              <EditTaskForm 
                task={activeTask}
                onSave={handleSaveEdit}
                onCancel={() => setSidePanelMode("view")}
              />
            )}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="delete-modal-overlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="delete-modal-title">Delete this task?</h4>
            <p className="delete-modal-body">
              “{deleteTarget.text || "This task"}” will be permanently deleted. This can&apos;t be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-modal-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={error} onDismiss={clearError} />
    </div>
  );
};

export default TaskList;