const block = "inline-block bg-surface-muted rounded-md animate-pulse";

export const TaskListSkeleton = ({ rows = 6 }) => (
  <ul className="list-none p-0 m-0 flex flex-col gap-2.5" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <li key={i} className="flex items-center gap-3">
        <span className={`${block} w-[18px] h-[18px] rounded-[4px] shrink-0`} />
        <span className={`${block} h-3.5 flex-1`} />
        <span className={`${block} w-[60px] h-5 rounded-full shrink-0`} />
      </li>
    ))}
  </ul>
);

export const TaskDetailsSkeleton = () => (
  <div className="flex flex-col gap-3.5 py-2" aria-hidden="true">
    <span className={`${block} h-[22px] w-[70%]`} />
    <span className={`${block} h-3.5 w-full`} />
    <span className={`${block} h-3.5 w-full`} style={{ width: "60%" }} />
  </div>
);
