const PRIORITY_META = {
  1: { label: "Priority 1", emoji: "🔴", color: "var(--color-danger)" },
  2: { label: "Priority 2", emoji: "🟠", color: "var(--color-warning)" },
  3: { label: "Priority 3", emoji: "🔵", color: "var(--color-info)" },
  4: { label: "No Priority", emoji: "⚪", color: "var(--color-faint)" },
};

const PriorityBreakdown = ({ tasks }) => {
  const incomplete = tasks.filter((task) => !task.completed);
  const counts = incomplete.reduce((acc, task) => {
    const p = task.priority || 4;
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div
      className="w-full max-w-[300px] flex flex-col gap-3 rounded-xl bg-surface 
      backdrop-blur-[8px] backdrop-saturate-[200%] border border-border 
      shadow-card p-4"
    >
      <span className="text-sm font-bold text-heading">
        Open Tasks by Priority
      </span>

      {incomplete.length === 0 ? (
        <p className="text-[12px] text-muted text-center py-2">
          Nothing pending — you&apos;re all caught up!
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4].map((p) => {
            const count = counts[p] || 0;
            const meta = PRIORITY_META[p];
            const percent = (count / maxCount) * 100;
            return (
              <div key={p} className="flex items-center gap-2">
                <span className="text-sm w-5 shrink-0">{meta.emoji}</span>
                <span className="text-[11px] text-muted w-[70px] shrink-0">
                  {meta.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
                <span className="text-[12px] font-bold text-heading w-4 text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriorityBreakdown;
