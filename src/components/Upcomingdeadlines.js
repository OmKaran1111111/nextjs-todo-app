import React from "react";
import styles from "./components.module.css";

const UpcomingDeadlines = ({ tasks }) => {
  const upcoming = tasks
    .filter((t) => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className={styles.upcomingContainer}>
      <span className={styles.upcomingTitle}>
        Upcoming Deadlines
      </span>

      {upcoming.length === 0 ? (
        <p className={styles.upcomingEmptyText}>
          No upcoming deadlines!
        </p>
      ) : (
        <div className={styles.upcomingList}>
          {upcoming.map((task) => (
            <div key={task.id} className={styles.upcomingItem}>
              <span className={styles.upcomingTaskText}>
                {task.text}
              </span>
              <span className={styles.upcomingDateText}>
                {new Date(task.deadline).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;