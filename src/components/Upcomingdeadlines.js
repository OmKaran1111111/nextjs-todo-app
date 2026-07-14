import React from "react";

const UpcomingDeadlines = ({ tasks }) => {
  // Filter for incomplete tasks with a deadline, sort by closest date, and take the top 5
  const upcoming = tasks
    .filter((t) => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div
      className="w-full max-w-[300px] flex flex-col gap-3 rounded-xl bg-white/14 
      backdrop-blur-[8px] backdrop-saturate-[200%] border border-white/25 
      shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),_inset_-1px_-1px_2px_rgba(255,255,255,0.3)] 
      p-4"
    >
      <span className="text-sm font-bold text-[#dae5f4]">
        Upcoming Deadlines
      </span>

      {upcoming.length === 0 ? (
        <p className="text-[12px] text-[#a9b8cc] text-center py-2">
          No upcoming deadlines!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((task) => (
            <div
              key={task.id}
              className="flex flex-col border-b border-white/10 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-[13px] text-[#dae5f4] font-semibold truncate">
                {task.text}
              </span>
              <span className="text-[11px] text-[#a9b8cc]">
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