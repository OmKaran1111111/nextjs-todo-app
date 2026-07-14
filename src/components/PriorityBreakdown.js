const PRIORITY_META = {
  1: { label: "Priority 1", emoji: "🔴", color: "#EF4444" },
  2: { label: "Priority 2", emoji: "🟠", color: "#F59E0B" },
  3: { label: "Priority 3", emoji: "🔵", color: "#3B82F6" },
  4: { label: "No Priority", emoji: "⚪", color: "#94A3B8" },
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
      className="w-full max-w-[300px] flex flex-col gap-3 rounded-xl bg-white/14 
      backdrop-blur-[8px] backdrop-saturate-[200%] border border-white/25 
      shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),_inset_-1px_-1px_2px_rgba(255,255,255,0.3)] 
      p-4"
    >
      <span className="text-sm font-bold text-[#dae5f4]">
        Open Tasks by Priority
      </span>

      {incomplete.length === 0 ? (
        <p className="text-[12px] text-[#a9b8cc] text-center py-2">
          Nothing pending — you&apos;re all caught up!
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4].map((p) => {
            const count = counts[p] || 0;
            const meta = PRIORITY_META[p];
            return (
              <div key={p} className="flex items-center gap-2">
                <span className="text-sm w-5 shrink-0">{meta.emoji}</span>
                <span className="text-[11px] text-[#a9b8cc] w-[70px] shrink-0">
                  {meta.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
                <span className="text-[12px] font-bold text-[#dae5f4] w-4 text-right shrink-0">
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