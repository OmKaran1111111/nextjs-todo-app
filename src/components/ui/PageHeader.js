export function PageHeader({ title, subtitle, meta, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="m-0 text-base font-bold text-heading">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action || (meta && <span className="text-xs text-faint">{meta}</span>)}
    </div>
  );
}
