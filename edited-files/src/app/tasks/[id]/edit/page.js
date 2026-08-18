"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { TaskDetailsSkeleton } from "@/components/Skeleton";
import useTasks from "@/hooks/useTasks";
import styles from "./page.module.css";
import PageShell from "@/components/PageShell";

const PRIORITY_OPTIONS = [
  { id: 1, label: "Priority 1", emoji: "🔴" },
  { id: 2, label: "Priority 2", emoji: "🟠" },
  { id: 3, label: "Priority 3", emoji: "🔵" },
  { id: 4, label: "Priority 4 (None)", emoji: "⚪" },
];

const EditTaskPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const {
    tasks,
    isLoading,
    error,
    clearError,
    updateTaskPriority,
    updateTaskDeadline,
  } = useTasks();

  const task = tasks.find((t) => String(t.id) === String(id));

  const [priority, setPriority] = useState(4);
  const [deadline, setDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setPriority(task.priority || 4);
      setDeadline(task.deadline || "");
    }
  }, [task?.id]);

  const handleCancel = () => router.push("/tasks");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!task) return;
    setIsSaving(true);

    const tasksToRun = [];
    if (priority !== (task.priority || 4)) {
      tasksToRun.push(updateTaskPriority(task.id, priority));
    }
    if (deadline !== (task.deadline || "")) {
      tasksToRun.push(updateTaskDeadline(task.id, deadline || null));
    }
    await Promise.all(tasksToRun);

    setIsSaving(false);
    router.push("/tasks");
  };

  if (isLoading) {
    return (
      <PageShell center>
        <div className={styles.card}>
          <TaskDetailsSkeleton />
        </div>
      </PageShell>
    );
  }

  if (!task) {
    return (
      <PageShell center>
        <div className={styles.card}>
          <h3 className={styles.title}>Task not found</h3>
          <p className={styles.subtitle}>
            This task may have already been deleted.
          </p>
          <button className={styles.cancelBtn} onClick={handleCancel}>
            Back to Tasks
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell center>
      <form className={styles.card} onSubmit={handleSave}>
        <div className={styles.headerRow}>
          <div>
            <h3 className={styles.title}>Edit Task</h3>
            <p className={styles.subtitle}>{task.text}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <label className={styles.fieldLabel} htmlFor="priority">
          Priority
        </label>
        <div className={styles.priorityGrid}>
          {PRIORITY_OPTIONS.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`${styles.priorityOption} ${
                priority === p.id ? styles.priorityOptionActive : ""
              }`}
              onClick={() => setPriority(p.id)}
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <label className={styles.fieldLabel} htmlFor="deadline">
          Deadline
        </label>
        <input
          id="deadline"
          type="date"
          className={styles.dateInput}
          value={deadline || ""}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      <Toast message={error} onDismiss={clearError} />
    </PageShell>
  );
};

export default EditTaskPage;
