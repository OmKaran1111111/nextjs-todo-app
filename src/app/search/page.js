"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import { TOPBAR_HEIGHT } from "@/components/topbar";

const Search_Task = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return [];
    const storedTasks = localStorage.getItem("todo_tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleClose = () => {
    router.push("/");
  };

  const handleUpdateTaskDeadline = (taskId, newDeadline) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task,
      ),
    );
  };

  const filteredTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.text.toLowerCase().includes(searchInput.trim().toLowerCase()),
  );

  const handleUpdateTaskPriority = (taskId, newPriority) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task,
      ),
    );
  };

  return (
    <>
      <div
        className="fixed left-0 right-0 bottom-0 bg-transparent backdrop-blur-[16px] 
      backdrop-saturate-200 flex flex-col items-center z-[500] 
      animate-[fadeIn_0.25s_ease-out] py-[5vh] sm:py-[8vh] px-5"
        style={{ top: TOPBAR_HEIGHT }}
        onClick={handleClose}
      >
        {/* .todo-container inlined: transparent glass panel, distinct from the
            page-level backdrop-blur above via a lighter blur + saturation mix */}
        <div
          className="w-full max-w-2xl flex flex-col bg-white/10 backdrop-blur-2xl 
          backdrop-saturate-150 border border-white/20 rounded-3xl 
          shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 sm:p-7 max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center w-full mb-3 px-1">
            <h3 className="text-xl font-bold text-[#dae5f4]">Search Tasks</h3>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full 
            bg-black/[0.04] text-base text-[var(--text-main)] transition-all 
            duration-200 hover:bg-red-500/15 hover:text-red-500 cursor-pointer"
              onClick={handleClose}
            >
              ✕
            </button>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl 
              px-4 py-2.5 text-[#dae5f4] placeholder:text-[#7a8aa0] 
              focus:outline-none focus:border-white/30 backdrop-blur-md"
            />
          </form>
          <ul className="list-none mt-0.5 overflow-y-auto flex-1 min-h-0">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-center 
              relative p-[16px_45px] sm:p-[20px_55px] mb-3.5 rounded-2xl min-h-[80px] 
              sm:min-h-[95px] backdrop-blur-xl backdrop-saturate-200 border 
              border-white/45 shadow-[0_20px_40px_rgba(0,0,0,0.07),
              0_6px_12px_rgba(0,0,0,0.03),inset_1px_1px_1px_rgba(255,255,255,0.65),
              inset_-1px_-1px_2px_rgba(0,0,0,0.1)] transition-[transform,background-color,
              box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
              hover:-translate-y-1 hover:bg-white/32 
              hover:shadow-[0_30px_60px_rgba(0,0,0,0.12),0_12px_20px_rgba(0,0,0,0.05),
              inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col items-center justify-center flex-1">
                  <div
                    className={`font-bold text-center text-lg sm:text-[25px] break-words ${
                      task.completed
                        ? "text-[#888] line-through [text-shadow:0_1px_1px_rgba(246,165,165,0.4)]"
                        : "text-[#dae5f4]"
                    }`}
                  >
                    {task.text}
                  </div>
                  <div className="mt-[4px]">
                    <span className="inline-block relative cursor-pointer">
                      📅
                      <input
                        type="date"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        value={task.deadline || ""}
                        onClick={(e) => e.target.showPicker()}
                        onChange={(e) =>
                          handleUpdateTaskDeadline(task.id, e.target.value)
                        }
                      />
                    </span>
                    <span className="text-[0.85rem] text-[#ff6565] ml-1">
                      {task.deadline}
                    </span>
                    <RemainingTime targetDate={task.deadline} />
                  </div>
                </div>
                <div>
                  <PriorityDropdown
                    currentPriority={task.priority || 4}
                    onSelect={(newPriority) =>
                      handleUpdateTaskPriority(task.id, newPriority)
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
        </div>
      </div>
    </>
  );
};

export default Search_Task;