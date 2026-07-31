"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import useTasks from "@/hooks/useTasks";
import "./page.css";

const SORT_OPTIONS = [
  { id: "priority", label: "Priority" },
  { id: "deadline", label: "Deadline" },
  { id: "text", label: "Name" },
];

const TaskList = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const {
    tasks,
    isLoading,
    error,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [sorting, setSorting] = useState([{ id: "priority", desc: false }]);
  const [expanded, setExpanded] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Columns exist purely so TanStack can sort/paginate/expand the data —
  // the actual card markup below is rendered by hand, matching your original styling.
  const columns = useMemo(
    () => [
      { accessorKey: "id" },
      { accessorKey: "text" },
      {
        accessorKey: "priority",
        sortingFn: (a, b) => (a.original.priority || 4) - (b.original.priority || 4),
      },
      {
        accessorKey: "deadline",
        sortingFn: (a, b) =>
          new Date(a.original.deadline || 0) - new Date(b.original.deadline || 0),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting, expanded, pagination },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getRowCanExpand: (row) => !!row.original.subtasks?.length,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDeleteTask = (idToDelete) => {
    deleteTask(idToDelete);
    if (selectedTaskId === idToDelete) setSelectedTaskId(null);
  };

  if (isLoading) {
    return null;
  }

  const currentSort = sorting[0];

  const toggleSort = (columnId) => {
    setSorting((prev) => {
      const current = prev[0];
      if (current?.id === columnId) {
        return [{ id: columnId, desc: !current.desc }];
      }
      return [{ id: columnId, desc: false }];
    });
  };

  const rows = table.getRowModel().rows;

  const highestPriorityTask =
    [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => (a.priority || 4) - (b.priority || 4))[0] || tasks[0];
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || highestPriorityTask;

  const renderTaskItem = (row, onSelectName) => {
    const task = row.original;
    return (
      <li
        key={task.id}
        className={`task-item ${task.completed ? "completed" : ""}`}
      >
        <div className="task-content-wrapper">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.completed || false}
            onChange={() => toggleComplete(task.id)}
          />
          <div
            onClick={() => onSelectName(task)}
            className={`task-title ${task.completed ? "completed" : ""}`}
          >
            {task.text}
          </div>

          {task.subtasks?.length > 0 && (
            <button className="subtask-toggle" onClick={() => row.toggleExpanded()}>
              <span
                className="subtask-toggle-chevron"
                style={{ transform: row.getIsExpanded() ? "rotate(90deg)" : "none" }}
              >
                ▸
              </span>
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
            </button>
          )}

          <div className="task-meta">
            <span className="datepicker-wrapper">
              📅
              <input
                type="date"
                className="datepicker-input"
                value={task.deadline || ""}
                onClick={(e) => e.target.showPicker()}
                onChange={(e) => updateTaskDeadline(task.id, e.target.value)}
              />
            </span>
            <span className="deadline-text">{task.deadline}</span>
            <RemainingTime targetDate={task.deadline} />
          </div>

          {row.getIsExpanded() && (
            <ul className="subtask-inline-list">
              {task.subtasks.map((s) => (
                <li key={s.id} className={s.completed ? "subtask-inline-done" : ""}>
                  {s.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <PriorityDropdown
            currentPriority={task.priority || 4}
            onSelect={(newPriority) => updateTaskPriority(task.id, newPriority)}
          />
          <button onClick={() => handleDeleteTask(task.id)} className="delete-task-btn">
            ✕
          </button>
        </div>
      </li>
    );
  };

  const sortBar = (
    <div className="sort-bar">
      <span className="sort-bar-label">Sort by</span>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          className={`sort-chip ${currentSort?.id === opt.id ? "sort-chip-active" : ""}`}
          onClick={() => toggleSort(opt.id)}
        >
          {opt.label}
          {currentSort?.id === opt.id ? (currentSort.desc ? " ↓" : " ↑") : ""}
        </button>
      ))}
    </div>
  );

  const paginationBar = (
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
  );

  if (isDesktop) {
    return (
      <div className="desktop-container">
        <div className="desktop-content">
          <div className="sidebar">
            <div className="heading-section">
              <h3 className="section-title">All Tasks</h3>
              <span className="tasklist-count">{tasks.length} total</span>
            </div>

            {error && <p className="tasklist-error">{error}</p>}

            {sortBar}

            {rows.length === 0 ? (
              <p className="empty-message">No tasks added yet!</p>
            ) : (
              <ul className="desktop-list">
                {rows.map((row) => renderTaskItem(row, (t) => setSelectedTaskId(t.id)))}
              </ul>
            )}

            {rows.length > 0 && paginationBar}
          </div>

          <div className="sticky-details">
            <TaskDetails
              task={selectedTask}
              onUpdatePriority={updateTaskPriority}
              onUpdateDeadline={updateTaskDeadline}
              onToggleComplete={toggleComplete}
              onDelete={handleDeleteTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page-wrap">
      <div className="mobile-panel">
        <div className="heading-section">
          <h3 className="section-title">All Tasks</h3>
          <span className="tasklist-count">{tasks.length} total</span>
        </div>

        {error && <p className="tasklist-error">{error}</p>}

        {sortBar}

        <ul className="mobile-list">
          {rows.length === 0 ? (
            <p className="empty-message">No tasks added yet!</p>
          ) : (
            rows.map((row) => renderTaskItem(row, (t) => router.push(`/tasks/${t.id}`)))
          )}
        </ul>

        {rows.length > 0 && paginationBar}
      </div>
    </div>
  );
};

export default TaskList;