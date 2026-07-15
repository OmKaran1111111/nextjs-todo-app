"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";

const Search_Task = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [searchInput, setSearchInput] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return [];
    const storedTasks = localStorage.getItem("todo_tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const isFirstSave = useRef(true);

  useEffect(() => {
    if (isFirstSave.current) {
      	  isFirstSave.current = false;
    	  return;
   	}
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

  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleDeleteTask = (idToDelete) => {
    setTasks(tasks.filter((task) => task.id !== idToDelete));
    if (selectedTaskId === idToDelete) setSelectedTaskId(null);
  };

  const handleAddSubtask = (taskId, text) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...(task.subtasks || []),
                { id: Date.now(), text, completed: false },
              ],
            }
          : task,
      ),
    );
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask,
              ),
            }
          : task,
      ),
    );
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).filter(
                (subtask) => subtask.id !== subtaskId,
              ),
            }
          : task,
      ),
    );
  };

  const highestPriorityMatch =
    [...filteredTasks].sort((a, b) => (a.priority || 4) - (b.priority || 4))[0];
  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ||
    highestPriorityMatch;

  const searchBox = (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full bg-surface-soft border border-border rounded-xl 
        px-4 py-2.5 text-heading placeholder:text-faint 
        focus:outline-none focus:border-border-strong backdrop-blur-md"
      />
    </form>
  );
  const renderTaskItem = (task, onSelectName) => (
    <li
      key={task.id}
      className="flex items-center justify-center 
    relative p-[16px_45px] sm:p-[20px_55px] mb-3.5 rounded-2xl min-h-[80px] 
    sm:min-h-[95px] bg-surface backdrop-blur-xl backdrop-saturate-200 border 
    border-border-strong shadow-card transition-[transform,background-color,
    box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
    hover:-translate-y-1 hover:bg-surface-hover hover:shadow-card-lg"
    >
      <div className="flex flex-col items-center justify-center flex-1">
        <div
          onClick={() => onSelectName(task)}
          className={`font-bold text-center text-lg sm:text-[25px] break-words cursor-pointer ${
            task.completed
              ? "text-faint line-through"
              : "text-heading"
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
          <span className="text-[0.85rem] text-danger ml-1">
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
  );

  if (isDesktop) {
    return (
      <div
        className="pt-[75px] pb-[70px] min-h-screen px-4 sm:px-6"
        onClick={handleClose}
      >
        <div
          className="mx-auto max-w-6xl md:flex md:items-start md:gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="md:w-[380px] md:shrink-0">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-xl font-bold text-heading">Search Tasks</h3>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full 
                bg-surface-muted text-base text-heading transition-all 
                duration-200 hover:bg-danger-soft hover:text-danger cursor-pointer"
              >
                ✕
              </button>
            </div>

            {searchBox}

            <ul className="list-none mt-3 flex flex-col gap-2.5">
              {filteredTasks.map((task) =>
                renderTaskItem(task, (t) => setSelectedTaskId(t.id)),
              )}
            </ul>
          </div>

          <div className="md:flex-1 md:sticky md:top-[100px]">
            <TaskDetails
              task={selectedTask}
              onUpdatePriority={handleUpdateTaskPriority}
              onUpdateDeadline={handleUpdateTaskDeadline}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 right-0 bottom-0 top-[75px] bg-transparent backdrop-blur-[16px] 
    backdrop-saturate-200 flex flex-col items-center z-[500] 
    animate-[fadeIn_0.25s_ease-out] py-[5vh] sm:py-[8vh] px-5"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl flex flex-col bg-surface-soft backdrop-blur-2xl 
        backdrop-saturate-150 border border-border rounded-3xl 
        shadow-card-lg p-5 sm:p-7 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center w-full mb-3 px-1">
          <h3 className="text-xl font-bold text-heading">Search Tasks</h3>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full 
          bg-surface-muted text-base text-heading transition-all 
          duration-200 hover:bg-danger-soft hover:text-danger cursor-pointer"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {searchBox}

        <ul className="list-none mt-0.5 overflow-y-auto flex-1 min-h-0">
          {filteredTasks.map((task) =>
            renderTaskItem(task, (t) => router.push(`/task/${t.id}`)),
          )}
        </ul>
      </div>
    </div>
  );
};

export default Search_Task;