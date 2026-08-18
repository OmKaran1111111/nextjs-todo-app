/**
 * Global page container used by every page in the app (Dashboard, Devices,
 * Manage_Users, Roles, the task list, task detail, task edit, ...). Owns the
 * top/bottom padding rhythm, max-width, and a few layout variants (styles
 * live in globals.css as .page-shell*) so individual pages don't redeclare
 * .container/.inner in their own CSS modules.
 *
 * @param {React.ReactNode} children
 * @param {"roomy"|"cozy"} [padding] - "roomy" (90px/60px, admin-style list
 *   pages) or "cozy" (75px/70px, task app pages). Defaults to "roomy".
 * @param {string} [maxWidth] - override the default 1180px inner max-width,
 *   e.g. "72rem", "42rem". Ignored when `fluid` or `center` is set.
 * @param {boolean} [fluid] - inner content spans the full width with no
 *   max-width/auto-margin, for pages that build their own grid (Dashboard).
 * @param {boolean} [center] - flex-center the children, for a single
 *   centered card layout (e.g. an edit form with nothing beside it).
 * @param {boolean} [split] - enable the responsive two-column layout used
 *   when a side panel (add/edit form) is open next to the main content.
 * @param {boolean} [fullHeight] - add min-height: 100vh to the outer wrapper.
 * @param {"main"|"div"|"section"} [as] - element to render as the outer wrapper.
 * @param {...*} rest - any other props (e.g. onClick) are passed to the outer wrapper.
 */
export default function PageShell({
  children,
  padding = "roomy",
  maxWidth,
  fluid = false,
  center = false,
  split = false,
  fullHeight = false,
  as: Tag = "main",
  ...rest
}) {
  const paddingClass =
    padding === "cozy" ? "page-shell--cozy" : "page-shell--roomy";
  const innerClass = [
    fluid
      ? "page-shell-inner--fluid"
      : center
        ? "page-shell-inner--center"
        : "page-shell-inner",
    split ? "page-shell-inner--split" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={`page-shell ${paddingClass} ${fullHeight ? "page-shell--full-height" : ""}`}
      {...rest}
    >
      <div
        className={innerClass}
        style={!fluid && !center && maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </Tag>
  );
}
