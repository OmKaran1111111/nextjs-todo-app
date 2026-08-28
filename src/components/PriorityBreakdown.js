import { PRIORITIES, TONE_DOT } from "@/lib/priority";

const PriorityBreakdown = ({ tasks }) => {
  const incomplete = tasks.filter((task) => !task.completed);
  const counts = incomplete.reduce((acc, task) => {
    const p = task.priority || 4;
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className="w-full flex flex-col gap-3 rounded-xl bg-bg-elevated border border-border shadow-card p-4">
      <span className="text-sm font-bold text-heading">
        Open Tasks by Priority
      </span>

      {incomplete.length === 0 ? (
        <p className="text-xs text-muted text-center py-2">
          Nothing pending — you&apos;re all caught up!
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {PRIORITIES.map((p) => {
            const count = counts[p.id] || 0;
            const percent = (count / maxCount) * 100;
            return (
              <div key={p.id} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[p.tone]}`} />
                <span className="text-[11px] text-muted w-[78px] shrink-0">
                  {p.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${TONE_DOT[p.tone]}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-heading w-4 text-right shrink-0">
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
