const InfoBoxes = ({
  totalTasks,
  completedTasks,
  remainingTasks,
  remainingOnTime,
  remainingOverdue,
}) => {
  const boxClasses =
    "flex flex-col items-center justify-center gap-1 rounded-xl bg-white/14 " +
    "backdrop-blur-[8px] backdrop-saturate-[200%] border border-white/25 " +
    "shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),_inset_-1px_-1px_2px_rgba(255,255,255,0.3)] " +
    "p-4 min-h-[90px] ";

  return (
    <div className="w-full max-w-[300px] grid grid-cols-2 grid-rows-2 gap-3 self-center mx-auto md:mx-0">
      <div className={boxClasses}>
        <span className="text-2xl font-bold text-[#dae5f4]">
          {totalTasks}
        </span>
        <span className="text-[12px] text-[#a9b8cc] text-center leading-tight">
          Total Tasks
        </span>
      </div>

      <div className={boxClasses}>
        <span className="text-2xl font-bold text-[#22C55E]">
          {completedTasks}
        </span>
        <span className="text-[12px] text-[#a9b8cc] text-center leading-tight">
          Completed
        </span>
      </div>

      <div className={boxClasses}>
        <span className="text-2xl font-bold text-[#3B82F6]">
          {remainingTasks}
        </span>
        <span className="text-[12px] text-[#a9b8cc] text-center leading-tight">
          Remaining
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-xl 
          bg-[#22C55E]/15 border border-[#22C55E]/40 p-2 min-h-[90px]"
        >
          <span className="text-lg font-bold text-[#22C55E]">
            {remainingOnTime}
          </span>
          <span className="text-[10px] text-[#dae5f4] text-center leading-tight">
            Not Overdue
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-xl 
          bg-[#EF4444]/15 border border-[#EF4444]/40 p-2 min-h-[90px]"
        >
          <span className="text-lg font-bold text-[#EF4444]">
            {remainingOverdue}
          </span>
          <span className="text-[10px] text-[#dae5f4] text-center leading-tight">
            Overdue
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoBoxes;