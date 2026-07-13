const RemainingTime = ({ targetDate }) => {
  if (!targetDate) return null;

  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return <span className="text-[red] font-bold">Time's up!</span>;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);

  return (
  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 
    py-0.5 text-xs font-semibold text-amber-500 md:text-sm md:px-3 md:py-1 ml-2 transition-all">
    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
    <span>
      {days}d {hours}h {minutes}m <span className="hidden sm:inline">left</span>
    </span>
  </span>
);
};

export default RemainingTime;