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
        className="inline-flex items-center justify-center p-2 text-xl bg-transparent rounded-full outline-none transition-transform duration-150 hover:scale-110 hover:bg-slate-200/50 cursor-pointer"
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
            className="overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-3 py-1 border-b border-slate-100 mb-1">
              <span className="text-xs font-semibold text-slate-500">Set Priority</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400
                 transition-colors hover:bg-slate-100 hover:text-red-500 cursor-pointer"
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
                className={`w-full flex items-center gap-3 px-4 py-3 sm:py-2 text-sm transition-colors duration-150 cursor-pointer
                  ${
                    currentPriority === p.id
                      ? "bg-slate-50 font-medium text-slate-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                onClick={() => {
                  onSelect(p.id);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg">{p.emoji}</span>
                <span>{p.label}</span>
                {currentPriority === p.id && (
                  <span className="ml-auto text-red-500 font-bold">✓</span>
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