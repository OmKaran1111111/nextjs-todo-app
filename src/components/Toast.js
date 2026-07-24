"use client";

import styles from "./components.module.css";

const Toast = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className={styles.toast} role="alert">
      <span className={styles.toastMessage}>{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className={styles.toastDismiss}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
