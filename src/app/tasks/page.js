"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import RemainingTime from "@/components/RemainingTime";
import Toast from "@/components/Toast";
import TaskDetails from "@/components/TaskDetails";
import PriorityDropdown from "@/components/PriorityDropdown";
import { TaskListSkeleton } from "@/components/Skeleton";
import useIsDesktop from "@/hooks/useIsDesktop";
import useTasks from "@/hooks/useTasks";
import "./page.css";

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
  const router = useRouter();
  const isDesktop = useIsDesktop();
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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Side panel state (for view/add/edit)
  const [sidePanelMode, setSidePanelMode] = useState(null); 
  const [activeTask, setActiveTask] = useState(null);

  // Add Task form state for side panel
  const [inputValue, setInputValue] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(4);
  const [deadline, setDeadline] = useState(null);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((task) =>
      task.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const handleView = (task) => {
    if (isDesktop) {
      setActiveTask(task);
      setSidePanelMode("view");
    } else {
      router.push(`/tasks/${task.id}`);
    }
  };

  const handleEdit = (task) => {
    if (isDesktop) {
      setActiveTask(task);
      setSidePanelMode("edit");
    } else {
      router.push(`/tasks/${task.id}/edit`);
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    if (isDesktop) {
      setActiveTask(null);
      setSidePanelMode("add");
    } else {
      router.push("/tasks/new");
    }
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
    setSidePanelMode(null);
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
    setSidePanelMode("view");
  };

  const columns = useMemo(
    () => [
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
            <button
              type="button"
              className="action-btn action-btn-edit"
              onClick={() => handleEdit(row.original)}
              title="Edit task"
            >
              ✎ Edit
            </button>
            <button
              type="button"
              className="action-btn action-btn-delete"
              onClick={() => setDeleteTarget(row.original)}
              title="Delete task"
            >
              🗑 Delete
            </button>
          </div>
        ),
      },
    ],
    [isDesktop, router]
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteTask(deleteTarget.id);
    if (activeTask?.id === deleteTarget.id) {
      setSidePanelMode(null);
      setActiveTask(null);
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
        
        {/* Left Side: Table List */}
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
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  className="search-input"
                />
                <a href="/tasks/new" className="add-task-top-btn" onClick={handleAddClick}>
                  + Add Task
                </a>
              </div>
            </div>

            <div className="task-table-wrapper">
              <table className="task-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sortDir = header.column.getIsSorted();
                        return (
                          <th
                            key={header.id}
                            className={canSort ? "sortable-th" : ""}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="sort-indicator">
                                {sortDir === "asc" ? " ↑" : sortDir === "desc" ? " ↓" : ""}
                              </span>
                            )}
                          </th>
                        );
                      })}
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

            {rows.length > 0 && (
              <div className="table-pagination">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  ← Prev
                </button>
                <span>
                  Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  Next →
                </button>
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    setPagination((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))
                  }
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sticky Split Pane */}
        {sidePanelMode && isDesktop && (
          <div className="sticky-details">
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