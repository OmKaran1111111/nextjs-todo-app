"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import useTasks from "@/hooks/useTasks";
import "./page.css";

const TaskList = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const {
    tasks,
    isLoading,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleClose = () => {
    router.push("/");
  };

  const handleDeleteTask = (idToDelete) => {
    deleteTask(idToDelete);
    if (selectedTaskId === idToDelete) setSelectedTaskId(null);
  };

  if (isLoading) {
    return null;
  }

  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.completed || false) - Number(b.completed || false),
  );

  const highestPriorityTask =
    [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => (a.priority || 4) - (b.priority || 4))[0] || tasks[0];
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || highestPriorityTask;

  const renderTaskItem = (task, onSelectName) => (
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

        <div className="task-meta">
          <span className="datepicker-wrapper">
            📅
            <input
              type="date"
              className="datepicker-input"
              value={task.deadline || ""}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) =>
                updateTaskDeadline(task.id, e.target.value)
              }
            />
          </span>
          <span className="deadline-text">
            {task.deadline}
          </span>
          <RemainingTime targetDate={task.deadline} />
        </div>
      </div>

      <div>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) =>
            updateTaskPriority(task.id, newPriority)
          }
        />
        <button
          onClick={() => handleDeleteTask(task.id)}
          className="delete-task-btn"
        >
          ✕
        </button>
      </div>
    </li>
  );

  if (isDesktop) {
    return (
      <div
        className="desktop-container"
        onClick={handleClose}
      >
        <div
          className="desktop-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sidebar">
            <div className="heading-section">
              <h3 className="section-title">All Tasks</h3>
              <button
                onClick={handleClose}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            {sortedTasks.length === 0 ? (
              <p className="empty-message">
                No tasks added yet!
              </p>
            ) : (
              <ul className="desktop-list">
                {sortedTasks.map((task) =>
                  renderTaskItem(task, (t) => setSelectedTaskId(t.id)),
                )}
              </ul>
            )}
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
    <div
      className="mobile-overlay"
      onClick={handleClose}
    >
      <div
        className="mobile-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="heading-section">
          <h3 className="section-title">All Tasks</h3>
          <button
            className="close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <ul className="mobile-list">
          {sortedTasks.length === 0 ? (
            <p className="empty-message">
              No tasks added yet!
            </p>
          ) : (
            sortedTasks.map((task) =>
              renderTaskItem(task, (t) => router.push(`/tasks/${t.id}`)),
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;