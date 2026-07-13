"use client";

import { useState, useEffect } from "react";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import { TOPBAR_HEIGHT } from "@/components/topbar";
import { FOOTER_HEIGHT } from "@/components/footer";

const TaskList = ({ Tasks, setTasks, onClose }) => {
  const handleDeleteTask = (idToDelete) => {
    setTasks(Tasks.filter((Task) => Task.id !== idToDelete));
  };

  const handleUpdateTaskPriority = (taskId, newPriority) => {
    setTasks(
      Tasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task,
      ),
    );
  };

  const handleUpdateTaskDeadline = (taskId, newDeadline) => {
    setTasks(
      Tasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task,
      ),
    );
  };

  const handleToggleComplete = (taskId) => {
    setTasks(
      Tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null,
            }
          : task,
      ),
    );
  };

  const sortedTasks = [...Tasks].sort(
    (a, b) => Number(a.completed || false) - Number(b.completed || false),
  );

  return (
    <div
      className="fixed inset-0 bg-white/10 backdrop-blur-[16px] 
      backdrop-saturate-200 flex flex-col items-center z-[10000] 
      animate-[fadeIn_0.25s_ease-out] py-[5vh] sm:py-[8vh] px-5"
      onClick={onClose}
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
          <h3 className="text-xl font-bold text-[#dae5f4]">All Tasks</h3>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full 
            bg-black/[0.04] text-base text-[var(--text-main)] transition-all 
            duration-200 hover:bg-red-500/15 hover:text-red-500 cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <ul className="list-none mt-0.5 overflow-y-auto flex-1 min-h-0">
          {sortedTasks.map((Task) => (
            <li
              key={Task.id}
              className={`flex items-center justify-center relative p-[20px_55px] 
                sm:p-[20px_55px] p-[16px_45px] mb-3.5 rounded-2xl min-h-[95px] 
                sm:min-h-[95px] min-h-[80px] backdrop-blur-xl backdrop-saturate-200 
                border border-white/45 
                shadow-[0_20px_40px_rgba(0,0,0,0.07),0_6px_12px_rgba(0,0,0,0.03),
                inset_1px_1px_1px_rgba(255,255,255,0.65),inset_-1px_-1px_2px_rgba(0,0,0,0.1)] 
                transition-[transform,background-color,box-shadow] duration-300 
                ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 
                hover:bg-white/32 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12),
                0_12px_20px_rgba(0,0,0,0.05),inset_1px_1px_2px_rgba(255,255,255,0.8),
                inset_-1px_-1px_2px_rgba(0,0,0,0.05)]
                ${
                  Task.completed
                    ? `opacity-40 !bg-[rgba(225,225,225,0.05)] !border-white/10 
                !shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] !transform-none line-through text-[#888]`
                    : ""
                }`}
            >
              <div className="flex flex-col items-center justify-center flex-1">
                <input
                  type="checkbox"
                  className="absolute left-5 top-1/2 -translate-y-1/2 appearance-none w-5 
                    h-5 border-2 border-[#aaa] rounded-full cursor-pointer transition-all 
                    duration-200 shrink-0 checked:bg-[var(--apple-blue,#0071e3)] 
                    checked:border-[var(--apple-blue,#0071e3)] checked:after:content-['✓'] 
                    checked:after:text-white checked:after:text-[14px] checked:after:absolute 
                    checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 
                    checked:after:-translate-y-1/2"
                  checked={Task.completed || false}
                  onChange={() => handleToggleComplete(Task.id)}
                />
                <div
                  className={`font-bold text-center text-lg sm:text-[25px] break-words ${
                    Task.completed
                      ? "text-[#888] line-through [text-shadow:0_1px_1px_rgba(246,165,165,0.4)]"
                      : "text-[#dae5f4]"
                  }`}
                >
                  {Task.text}
                </div>

                <div className="mt-[4px]">
                  <span className="inline-block relative cursor-pointer">
                    📅
                    <input
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={Task.deadline || ""}
                      onClick={(e) => e.target.showPicker()}
                      onChange={(e) =>
                        handleUpdateTaskDeadline(Task.id, e.target.value)
                      }
                    />
                  </span>
                  <span className="text-[0.85rem] text-[#ff6565] ml-1">
                    {Task.deadline}
                  </span>
                  <RemainingTime targetDate={Task.deadline} />
                </div>
              </div>

              <div>
                <PriorityDropdown
                  currentPriority={Task.priority || 4}
                  onSelect={(newPriority) =>
                    handleUpdateTaskPriority(Task.id, newPriority)
                  }
                />
                <button
                  onClick={() => handleDeleteTask(Task.id)}
                  className="absolute top-[15px] right-[15px] bg-transparent border-none 
                  text-[#e0d5d5] text-[1.1rem] cursor-pointer p-[2px] leading-none transition-all 
                  duration-200 z-10 hover:text-[#ef4444] hover:bg-[#ef4444]/[0.08]"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const HighPriorityTasks = ({ Tasks, setTasks }) => {
  const topTasks = [...Tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => a.priority - b.priority)
    // .slice(0, 5);

  const handleUpdateTaskDeadline = (taskId, newDeadline) => {
    setTasks(
      Tasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task,
      ),
    );
  };

  const handleUpdateTaskPriority = (taskId, newPriority) => {
    setTasks(
      Tasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task,
      ),
    );
  };

  return (
    <div >
      {topTasks.length === 0 ? (
        <p className="text-[#dae5f4] text-[0.95rem] text-center py-2.5">
          No pending tasks added yet!
        </p>
      ) : (
        <ul className="list-none flex flex-col gap-2">
          {topTasks.map((task) => (
            <li
              key={task.id}
              className="flex w-full min-w-0 flex-wrap items-center gap-3 px-3.5 py-3 rounded-xl 
              text-[0.95rem] text-[#d5d5e8] bg-white/14 backdrop-blur-[20px] backdrop-saturate-[200%] 
              border border-white/25 [box-shadow:inset_1px_1px_3px_rgba(0,0,0,0.06),_inset_-1px_-1px_2px_rgba(255,255,255,0.3)]"
            >
              <PriorityDropdown
                currentPriority={task.priority || 4}
                onSelect={(newPriority) =>
                  handleUpdateTaskPriority(task.id, newPriority)
                }
              />
              <span
                className={`min-w-0 flex-1 font-bold text-left text-lg sm:text-[25px] break-words ${
                  task.completed
                    ? "text-[#888] line-through [text-shadow:0_1px_1px_rgba(246,165,165,0.4)]"
                    : "text-[#dae5f4]"
                }`}
              >
                {task.text}
              </span>

              <span className="ml-[10px] shrink-0">
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
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Todo_App = () => {
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);

  const [Tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return [];
    const sTasks = localStorage.getItem("todo_tasks");
    return sTasks ? JSON.parse(sTasks) : [];
  });

  useEffect(() => {
    setTasks((prev) => {
      const needsMigration = prev.some(
        (task) => task.completed && !task.completedAt,
      );
      if (!needsMigration) return prev;
      return prev.map((task) =>
        task.completed && !task.completedAt
          ? { ...task, completedAt: new Date().toISOString() }
          : task,
      );
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(Tasks));
  }, [Tasks]);

  useEffect(() => {
    const handleTasksUpdated = () => {
      const sTasks = localStorage.getItem("todo_tasks");
      setTasks(sTasks ? JSON.parse(sTasks) : []);
    };

    window.addEventListener("todo_tasks_updated", handleTasksUpdated);

    return () => {
      window.removeEventListener("todo_tasks_updated", handleTasksUpdated);
    };
  }, []);

  return (
    <div>
      <div style={{ paddingTop: TOPBAR_HEIGHT, paddingBottom: FOOTER_HEIGHT }}>
        <HighPriorityTasks Tasks={Tasks} setTasks={setTasks} />

        {isTaskListOpen && (
          <TaskList
            onClose={() => setIsTaskListOpen(false)}
            Tasks={Tasks}
            setTasks={setTasks}
          />
        )}
      </div>
    </div>
  );
};

export default Todo_App;