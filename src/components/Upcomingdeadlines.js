import React from "react";

const UpcomingDeadlines = ({ tasks }) => {
  const upcoming = tasks
    .filter((t) => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="w-full max-w-[300px] flex flex-col gap-3 rounded-xl bg-surface backdrop-blur-[8px] [backdrop-filter:blur(8px)_saturate(200%)] border border-border shadow-card p-4">
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
                {new Date(task.deadline).toLocaleDateString(undefined, {
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
