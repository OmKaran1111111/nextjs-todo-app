/**
 * Shared "eyebrow / title / subtitle" header block used at the top of
 * pages (styles live in globals.css as .page-header*). Was previously
 * copy-pasted (and mostly unused/dead) in individual page.module.css files.
 *
 * @param {string} [eyebrow] - small label above the title, e.g. "Manage users".
 * @param {React.ReactNode} title
 * @param {React.ReactNode} [subtitle]
 */
export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="page-header">
      {eyebrow && <p className="page-header-eyebrow">{eyebrow}</p>}
      <h1 className="page-header-title">{title}</h1>
      {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
    </div>
  );
}
