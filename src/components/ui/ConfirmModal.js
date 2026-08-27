export function ConfirmModal({ title, body, confirmLabel = "Confirm", cancelLabel = "Cancel", isBusy, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4 [animation:fadeIn_0.15s_ease-out]"
      onClick={() => !isBusy && onCancel()}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-popover)] [animation:scaleUp_0.15s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-[0.6rem] text-[1.05rem] text-[var(--color-heading)]">{title}</h4>
        <p className="m-0 mb-5 text-[0.9rem] leading-[1.4] text-[var(--color-muted)]">{body}</p>
        <div className="flex justify-end gap-[0.6rem]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="cursor-pointer rounded-[0.55rem] border border-[var(--color-border)] bg-transparent px-4 py-2 text-[0.85rem] font-semibold text-[var(--color-body)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="cursor-pointer rounded-[0.55rem] border border-[var(--color-danger)] bg-[var(--color-danger)] px-4 py-2 text-[0.85rem] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
