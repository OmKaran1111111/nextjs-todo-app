import styles from "./components.module.css";

export const TaskListSkeleton = ({ rows = 6 }) => (
  <ul className={styles.skeletonList} aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <li key={i} className={styles.skeletonRow}>
        <span className={`${styles.skeletonBlock} ${styles.skeletonCheckbox}`} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonText}`} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonPill}`} />
      </li>
    ))}
  </ul>
);

export const TaskDetailsSkeleton = () => (
  <div className={styles.skeletonDetails} aria-hidden="true">
    <span className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
    <span className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
    <span className={`${styles.skeletonBlock} ${styles.skeletonLine}`} style={{ width: "60%" }} />
  </div>
);
