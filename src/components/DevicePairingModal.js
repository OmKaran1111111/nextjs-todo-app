"use client";

import { useState, useEffect } from "react";
import { generatePairingCodeAction } from "@/app/actions";

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
    <div
      className="fixed inset-0 z-[1000] bg-[rgba(15,23,42,0.45)] backdrop-blur-[2px] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[360px] rounded-[1.25rem] bg-bg-elevated border border-border shadow-card-lg py-8 px-7 pb-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-lg border-0 bg-surface-muted text-muted cursor-pointer flex items-center justify-center hover:bg-border"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-heading m-0 mb-2">Connect a new device</h2>
        <p className="text-sm text-muted m-0 mb-5 leading-snug">
          On your phone or desktop app, choose "Log in with a pairing code" and enter this code.
        </p>

        {loading && <p className="text-sm text-faint">Generating code…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        {code && (
          <>
            <div className="text-[2.1rem] font-bold tracking-[0.35em] text-heading py-3.5 px-2 rounded-2xl bg-surface-muted border border-border">
              {code}
            </div>
            <p className="mt-3 text-xs text-faint">
              {formatExpiry(expiresAt)} · single use
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DevicePairingModal;
