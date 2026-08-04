"use client";

import { useState, useEffect } from "react";
import { generatePairingCodeAction } from "@/app/actions";
import styles from "./components.module.css";

function formatExpiry(expiresAt) {
  const minutes = Math.max(0, Math.round((new Date(expiresAt) - Date.now()) / 60000));
  return `Expires in ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

const DevicePairingModal = ({ onClose }) => {
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generatePairingCodeAction()
      .then((result) => {
        setCode(result.code);
        setExpiresAt(result.expiresAt);
      })
      .catch(() => setError("Could not generate a pairing code. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className={styles.title}>Connect a new device</h2>
        <p className={styles.subtitle}>
          On your phone or desktop app, choose "Log in with a pairing code" and enter this code.
        </p>

        {loading && <p className={styles.helperText}>Generating code…</p>}
        {error && <p className={styles.errorText}>{error}</p>}

        {code && (
          <>
            <div className={styles.codeDisplay}>{code}</div>
            <p className={styles.expiryText}>{formatExpiry(expiresAt)} · single use</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DevicePairingModal;
