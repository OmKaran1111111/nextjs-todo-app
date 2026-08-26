"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const PriorityDropdown = ({ currentPriority, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const priorities = [
    { id: 1, label: "Priority 1", emoji: "🔴" },
    { id: 2, label: "Priority 2", emoji: "🟠" },
    { id: 3, label: "Priority 3", emoji: "🔵" },
    { id: 4, label: "Priority 4 (None)", emoji: "⚪" },
  ];

  const currentOption =
    priorities.find((p) => p.id === currentPriority) || priorities[3];

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 220;

    const spaceRight = window.innerWidth - triggerRect.right;
    const spaceLeft = triggerRect.left;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    const openToRight = spaceRight >= menuWidth || spaceRight >= spaceLeft;
    const openBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

    let left = openToRight
      ? Math.max(8, Math.min(triggerRect.left, window.innerWidth - menuWidth - 8))
      : Math.max(8, Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - 8));

    let top = openBelow
      ? triggerRect.bottom + 4
      : triggerRect.top - menuHeight - 4;

    setMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
      zIndex: 9999,
    });
  };

  const openMenu = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center p-2 text-xl bg-transparent rounded-full border-none outline-none transition-transform transition-colors duration-150 cursor-pointer hover:scale-110 hover:bg-surface-hover"
        onClick={openMenu}
        title={`Current: ${currentOption.label}`}
      >
        {currentOption.emoji}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="overflow-hidden rounded-lg border border-border bg-surface-strong backdrop-blur-2xl py-1 shadow-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-1 px-3 border-b border-border-soft mb-1">
              <span className="text-xs font-semibold text-muted">Set Priority</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted bg-transparent border-none transition-colors duration-150 cursor-pointer hover:bg-surface-hover hover:text-danger"
                onClick={() => setIsOpen(false)}
                aria-label="Close priority dropdown"
              >
                ✕
              </button>
            </div>
            {priorities.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`w-full flex items-center gap-3 py-3 px-4 sm:py-2 text-sm border-none bg-transparent transition-colors duration-150 cursor-pointer text-left ${
                  currentPriority === p.id
                    ? "bg-surface-hover font-medium text-heading"
                    : "text-body hover:bg-surface-hover"
                }`}
                onClick={() => {
                  onSelect(p.id);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg">{p.emoji}</span>
                <span>{p.label}</span>
                {currentPriority === p.id && (
                  <span className="ml-auto text-danger font-bold">✓</span>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default PriorityDropdown;
