const InfoBoxes = ({
  totalTasks,
  completedTasks,
  remainingTasks,
  remainingOnTime,
  remainingOverdue,
}) => {
  const boxClasses =
    "flex flex-col items-center justify-center gap-1 rounded-xl bg-surface " +
    "backdrop-blur-[8px] backdrop-saturate-[200%] border border-border " +
    "shadow-card p-4 min-h-[90px] ";

  return (
    <div className="w-full max-w-[300px] grid grid-cols-2 grid-rows-2 gap-3 self-center mx-auto md:mx-0">
      <div className={boxClasses}>
        <span className="text-2xl font-bold text-heading">
          {totalTasks}
        </span>
        <span className="text-[12px] text-muted text-center leading-tight">
          Total Tasks
        </span>
      </div>

      <div className={boxClasses}>
        <span className="text-2xl font-bold text-success">
          {completedTasks}
        </span>
        <span className="text-[12px] text-muted text-center leading-tight">
          Completed
        </span>
      </div>

      <div className={boxClasses}>
        <span className="text-2xl font-bold text-info">
          {remainingTasks}
        </span>
        <span className="text-[12px] text-muted text-center leading-tight">
          Remaining
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-xl 
          bg-success-soft border border-success/40 p-2 min-h-[90px]"
        >
          <span className="text-lg font-bold text-success">
            {remainingOnTime}
          </span>
          <span className="text-[10px] text-heading text-center leading-tight">
            Not Overdue
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-xl 
          bg-danger-soft border border-danger/40 p-2 min-h-[90px]"
        >
          <span className="text-lg font-bold text-danger">
            {remainingOverdue}
          </span>
          <span className="text-[10px] text-heading text-center leading-tight">
            Overdue
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoBoxes;
