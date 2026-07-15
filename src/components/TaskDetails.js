"use client";

import { useState } from "react";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import styles from "./components.module.css";

const PRIORITY_INFO = {
  1: { label: "Priority 1 · Urgent", colorClass: styles.colorDanger },
  2: { label: "Priority 2 · High", colorClass: styles.colorWarning },
  3: { label: "Priority 3 · Medium", colorClass: styles.colorInfo },
  4: { label: "Priority 4 · None", colorClass: styles.colorFaint },
};

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
      <div className={styles.noTask}>
        No tasks yet — add one to see its details here.
      </div>
    );
  }

  const priorityInfo = PRIORITY_INFO[task.priority || 4];

  return (
    <div className={styles.taskDetailsContainer}>
      {onBack && (
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
      )}

      <div className={styles.taskDetailsHeader}>
        <h2
          className={`${styles.taskDetailsTitle} ${
            task.completed ? styles.titleCompleted : styles.titleActive
          }`}
        >
          {task.text}
        </h2>
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className={styles.deleteButton}
        >
          ✕
        </button>
      </div>

      <label className={styles.completeLabel}>
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task.id)}
          className={styles.checkbox}
        />
        <span className={styles.checkboxText}>
          {task.completed ? "Completed" : "Mark as complete"}
        </span>
      </label>

      <div className={styles.priorityRow}>
        <span className={styles.labelText}>Priority</span>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) => onUpdatePriority(task.id, newPriority)}
        />
        <span className={`${styles.priorityVal} ${priorityInfo.colorClass}`}>
          {priorityInfo.label}
        </span>
      </div>

      <div className={styles.deadlineRow}>
        <span className={styles.labelText}>Deadline</span>
        <span className={styles.dateIconWrapper}>
          📅
          <input
            type="date"
            className={styles.hiddenDatePicker}
            value={task.deadline || ""}
            onClick={(e) => e.target.showPicker()}
            onChange={(e) => onUpdateDeadline(task.id, e.target.value)}
          />
        </span>
        <span className={styles.dateText}>
          {task.deadline || "No deadline set"}
        </span>
        <RemainingTime targetDate={task.deadline} />
      </div>

      <div className={styles.subtaskWrapper}>
        <span className={styles.subtaskLabel}>Subtasks</span>

        <ul className={styles.subtaskList}>
          {(task.subtasks || []).length === 0 ? (
            <li className={styles.subtaskEmpty}>No subtasks yet</li>
          ) : (
            (task.subtasks || []).map((subtask) => (
              <li key={subtask.id} className={styles.subtaskItem}>
                <input
                  type="checkbox"
                  checked={subtask.completed || false}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                  className={styles.subtaskCheckbox}
                />
                <span
                  className={`${styles.subtaskText} ${
                    subtask.completed
                      ? styles.subtaskTextCompleted
                      : styles.subtaskTextActive
                  }`}
                >
                  {subtask.text}
                </span>
                <button
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className={styles.subtaskDeleteButton}
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
          className={styles.subtaskForm}
        >
          <input
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            placeholder="Add a subtask..."
            className={styles.subtaskInput}
          />
          <button type="submit" className={styles.subtaskSubmitButton}>
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;