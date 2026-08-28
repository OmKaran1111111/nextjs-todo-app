const StatTile = ({ value, label, valueClassName, containerClassName }) => (
  <div
    className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border p-4 min-h-[90px] ${containerClassName}`}
  >
    <span className={`text-2xl font-bold ${valueClassName}`}>{value}</span>
    <span className="text-xs text-muted text-center leading-tight">
      {label}
    </span>
  </div>
);

const InfoBoxes = ({ totalTasks, completedTasks, remainingTasks, remainingOverdue }) => {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        value={totalTasks}
        label="Total Tasks"
        valueClassName="text-heading"
        containerClassName="bg-bg-elevated border-border shadow-card"
      />
      <StatTile
        value={completedTasks}
        label="Completed"
        valueClassName="text-success"
        containerClassName="bg-bg-elevated border-border shadow-card"
      />
      <StatTile
        value={remainingTasks}
        label="Remaining"
        valueClassName="text-info"
        containerClassName="bg-bg-elevated border-border shadow-card"
      />
      <StatTile
        value={remainingOverdue}
        label="Overdue"
        valueClassName="text-danger"
        containerClassName="bg-danger-soft border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)]"
      />
    </div>
  );
};

export default InfoBoxes;
