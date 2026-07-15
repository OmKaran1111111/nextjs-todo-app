import styles from "./components.module.css";

const InfoBoxes = ({
  totalTasks,
  completedTasks,
  remainingTasks,
  remainingOnTime,
  remainingOverdue,
}) => {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoBox}>
        <span className={styles.textTotal}>
          {totalTasks}
        </span>
        <span className={styles.textLabel}>
          Total Tasks
        </span>
      </div>

      <div className={styles.infoBox}>
        <span className={styles.textCompleted}>
          {completedTasks}
        </span>
        <span className={styles.textLabel}>
          Completed
        </span>
      </div>

      <div className={styles.infoBox}>
        <span className={styles.textRemaining}>
          {remainingTasks}
        </span>
        <span className={styles.textLabel}>
          Remaining
        </span>
      </div>

      <div className={styles.subGrid}>
        <div className={styles.subBoxSuccess}>
          <span className={styles.textSubSuccess}>
            {remainingOnTime}
          </span>
          <span className={styles.textSubLabel}>
            Not Overdue
          </span>
        </div>
        <div className={styles.subBoxDanger}>
          <span className={styles.textSubDanger}>
            {remainingOverdue}
          </span>
          <span className={styles.textSubLabel}>
            Overdue
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoBoxes;