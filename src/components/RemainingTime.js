import styles from "./components.module.css";

const RemainingTime = ({ targetDate }) => {
  if (!targetDate) return null;

  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return <span className={styles.timeUp}>Time's up!</span>;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);

  return (
    <span className={styles.badge}>
      <span className={styles.dot} />
      <span>
        {days}d {hours}h {minutes}m <span className={styles.suffix}>left</span>
      </span>
    </span>
  );
};

export default RemainingTime;