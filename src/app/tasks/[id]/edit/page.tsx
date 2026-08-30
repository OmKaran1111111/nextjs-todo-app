"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { TaskDetailsSkeleton } from "@/components/Skeleton";
import useTasks from "@/hooks/useTasks";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PRIORITIES, TONE_DOT } from "@/lib/priority";

/*
 * Task is derived directly from useTasks' real return type instead of a
 * hand-written interface, so it always matches the hook exactly.
 */
type Task = ReturnType<typeof useTasks>["tasks"][number];

const PRIORITY_OPTIONS = PRIORITIES;

const editHeadingClasses = "m-0 mb-1 text-xl font-bold text-[var(--color-heading)]";
const editSubtitleClasses = "m-0 text-sm break-words text-[var(--color-faint)]";
const fieldLabelClasses = "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase";
const cancelBtnClasses = "cursor-pointer rounded-[0.6rem] border border-[var(--color-border)] bg-transparent px-[1.1rem] py-[0.55rem] text-[0.88rem] font-semibold text-[var(--color-body)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60";
const saveBtnClasses = "cursor-pointer rounded-[0.6rem] border border-[var(--color-primary)] bg-[var(--color-primary)] px-[1.1rem] py-[0.55rem] text-[0.88rem] font-semibold text-[var(--color-primary-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60";

const EditTaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    tasks,
    isLoading,
    error,
    clearError,
    updateTaskPriority,
    updateTaskDeadline,
  } = useTasks();

  const task: Task | undefined = tasks.find((t) => String(t.id) === String(id));

  const [priority, setPriority] = useState<number>(4);
  const [deadline, setDeadline] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setPriority(task.priority || 4);
      setDeadline(task.deadline || "");
    }
  }, [task?.id]);

  const handleCancel = () => router.push("/tasks");

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!task) return;
    setIsSaving(true);

    const tasksToRun: Promise<unknown>[] = [];
    if (priority !== (task.priority || 4)) {
      tasksToRun.push(Promise.resolve(updateTaskPriority(task.id, priority)));
    }
    if (deadline !== (task.deadline || "")) {
      tasksToRun.push(Promise.resolve(updateTaskDeadline(task.id, deadline || null)));
    }
    await Promise.all(tasksToRun);

    setIsSaving(false);
    router.push("/tasks");
  };

  if (isLoading) {
    return (
      <main className="page-shell page-shell--roomy">
        <div className="page-shell-inner page-shell-inner--center">
          <Card className="max-w-[480px]">
            <TaskDetailsSkeleton />
          </Card>
        </div>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="page-shell page-shell--roomy">
        <div className="page-shell-inner page-shell-inner--center">
          <Card className="max-w-[480px]">
            <h3 className={editHeadingClasses}>Task not found</h3>
            <p className={editSubtitleClasses}>
              This task may have already been deleted.
            </p>
            <button className={`${cancelBtnClasses} mt-6`} onClick={handleCancel}>
              Back to Tasks
            </button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell page-shell--roomy">
      <div className="page-shell-inner page-shell-inner--center">
        <form onSubmit={handleSave}>
          <Card className="max-w-[480px]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className={editHeadingClasses}>Edit Task</h3>
                <p className={editSubtitleClasses}>{task.text}</p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-surface-muted)] text-[var(--color-heading)] transition-all duration-200 hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                onClick={handleCancel}
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <label className={fieldLabelClasses} htmlFor="priority">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-[0.6rem]">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-[0.65rem] border px-3 py-[0.6rem] text-[0.85rem] transition-all duration-150 ease-out ${
                    priority === p.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-body)] hover:border-[var(--color-primary)]"
                  }`}
                  onClick={() => setPriority(p.id)}
                >
                  <span className={`h-2 w-2 rounded-full ${TONE_DOT[p.tone]}`} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <label className={fieldLabelClasses} htmlFor="deadline">
              Deadline
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-[0.6rem] text-[0.9rem] text-[var(--color-body)]"
              value={deadline || ""}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <div className="mt-7 flex justify-end gap-[0.6rem]">
              <button
                type="button"
                className={cancelBtnClasses}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className={saveBtnClasses} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </Card>
        </form>

        <Toast message={error} onDismiss={clearError} />
      </div>
    </main>
  );
};

export default EditTaskPage;