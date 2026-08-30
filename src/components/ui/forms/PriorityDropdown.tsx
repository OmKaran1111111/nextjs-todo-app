"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PRIORITIES, TONE_DOT, getPriority } from "@/lib/priority";
import { Icon } from "@/components/ui/Icon";
import type { Priority } from "@/lib/types";

interface PriorityDropdownProps {
  currentPriority: number;
  onSelect: (priorityId: number) => void;
}

const PriorityDropdown = ({ currentPriority, onSelect }: PriorityDropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [origin, setOrigin] = useState<string>("center");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const prevPriorityRef = useRef<number>(currentPriority);

  const currentOption: Priority = getPriority(currentPriority);

  useEffect(() => {
    if (prevPriorityRef.current === currentPriority) return;
    prevPriorityRef.current = currentPriority;
    const dot = triggerRef.current?.querySelector<HTMLElement>("[data-priority-dot]");
    if (!dot) return;
    dot.classList.remove("overdrive-pop");
    void dot.offsetWidth;
    dot.classList.add("overdrive-pop");
  }, [currentPriority]);

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

    const originX = ((triggerRect.left + triggerRect.width / 2 - left) / menuWidth) * 100;
    const originY = openBelow ? 0 : 100;
    setOrigin(`${Math.max(0, Math.min(100, originX))}% ${originY}%`);

    setMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
      zIndex: 9999,
    });
  };

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
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
        className="inline-flex items-center justify-center h-8 w-8 bg-transparent rounded-full border-none outline-none transition-colors duration-150 cursor-pointer hover:bg-surface-hover"
        onClick={openMenu}
        title={`Current: ${currentOption.label}`}
      >
        <span
          data-priority-dot
          className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[currentOption.tone]}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ ...menuStyle, transformOrigin: origin }}
            className="overdrive-menu-in overflow-hidden rounded-lg border border-border bg-bg-elevated py-1 shadow-popover"
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
                <Icon name="close" size={14} />
              </button>
            </div>
            {PRIORITIES.map((p: Priority) => (
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
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[p.tone]}`} />
                <span>{p.label}</span>
                {currentPriority === p.id && (
                  <span className="ml-auto text-primary">
                    <Icon name="check" size={14} />
                  </span>
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