import styles from "./components.module.css";

const PRIORITY_META = {
  1: { label: "Priority 1", emoji: "🔴", color: "var(--color-danger)" },
  2: { label: "Priority 2", emoji: "🟠", color: "var(--color-warning)" },
  3: { label: "Priority 3", emoji: "🔵", color: "var(--color-info)" },
  4: { label: "No Priority", emoji: "⚪", color: "var(--color-faint)" },
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
    <div className={styles.pbContainer}>
      <span className={styles.pbTitle}>
        Open Tasks by Priority
      </span>

      {incomplete.length === 0 ? (
        <p className={styles.pbEmptyText}>
          Nothing pending — you&apos;re all caught up!
        </p>
      ) : (
        <div className={styles.pbList}>
          {[1, 2, 3, 4].map((p) => {
            const count = counts[p] || 0;
            const meta = PRIORITY_META[p];
            const percent = (count / maxCount) * 100;
            return (
              <div key={p} className={styles.pbItem}>
                <span className={styles.pbEmoji}>{meta.emoji}</span>
                <span className={styles.pbLabel}>
                  {meta.label}
                </span>
                <div className={styles.pbBarBg}>
                  <div
                    className={styles.pbBarFill}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
                <span className={styles.pbCount}>
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