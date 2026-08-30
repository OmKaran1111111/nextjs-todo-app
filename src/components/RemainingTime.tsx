interface RemainingTimeProps {
  targetDate?: string | number | Date | null;
}

const RemainingTime = ({ targetDate }: RemainingTimeProps) => {
  if (!targetDate) return null;

  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return <span className="text-danger font-bold">Time&apos;s up!</span>;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft py-0.5 px-2.5 text-xs md:text-sm font-semibold text-warning ml-2 transition-all duration-150">
      <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
      <span>
        {days}d {hours}h {minutes}m{" "}
        <span className="hidden sm:inline">left</span>
      </span>
    </span>
  );
};

export default RemainingTime;