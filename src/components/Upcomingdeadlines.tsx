import type useTasks from "@/hooks/useTasks";

/*
 * UpcomingDeadlineTask mirrors the shape returned by useTasks rather than a
 * hand-written interface with its own optionality, so passing `tasks` from
 * useTasks() directly always type-checks.
 */
export type UpcomingDeadlineTask = Pick<
  ReturnType<typeof useTasks>["tasks"][number],
  "id" | "text" | "completed" | "deadline"
>;

interface UpcomingDeadlinesProps {
  tasks: UpcomingDeadlineTask[];
}

const UpcomingDeadlines = ({ tasks }: UpcomingDeadlinesProps) => {
  const upcoming = tasks
    .filter((t) => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime())
    .slice(0, 5);

  return (
    <div className="w-full flex flex-col gap-3 rounded-xl bg-bg-elevated border border-border shadow-card p-4">
      <span className="text-sm font-bold text-heading">
        Upcoming Deadlines
      </span>

      {upcoming.length === 0 ? (
        <p className="text-xs text-muted text-center py-2">
          No upcoming deadlines!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((task) => (
            <div
              key={task.id}
              className="flex flex-col border-b border-border-soft pb-2 last:border-0 last:pb-0"
            >
              <span className="text-[13px] font-semibold text-heading overflow-hidden text-ellipsis whitespace-nowrap">
                {task.text}
              </span>
              <span className="text-[11px] text-muted">
                {new Date(task.deadline as string).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;